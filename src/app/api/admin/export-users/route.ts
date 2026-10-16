import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ExcelJS from "exceljs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailUsersExcel } from "@/lib/email";
import { formatShortDate } from "@/lib/utils";

/**
 * Dựng file Excel (.xlsx) danh sách người dùng — gồm cả người chưa từng mua
 * Premium (Loại tài khoản = Free, Gói đăng ký để trống).
 *  - Loại tài khoản: Premium nếu premiumUntil còn hạn tại thời điểm xuất, ngược lại Free.
 *  - Gói đăng ký: tên gói của đơn PAID gần nhất (1 tháng / 6 tháng / 1 năm / admin tặng).
 *    Để trống nếu chưa từng có đơn nào.
 *  - Nhận bản tin: email có nằm trong danh sách đăng ký bản tin hay không (so khớp
 *    không phân biệt hoa/thường) — bảng bản tin không gắn với tài khoản nên đây là
 *    cách duy nhất để biết ai trong số người dùng đã đăng ký bản tin.
 */
async function buildUsersWorkbook(): Promise<ExcelJS.Buffer> {
  const [users, subscribers] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        email: true,
        createdAt: true,
        premiumUntil: true,
        orders: {
          where: { status: "PAID" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { planName: true },
        },
      },
    }),
    prisma.newsletterSubscriber.findMany({ select: { email: true } }),
  ]);

  const newsletterEmails = new Set(subscribers.map((s) => s.email.trim().toLowerCase()));
  const nowMs = Date.now();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TECHZONE";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Người dùng");
  sheet.columns = [
    { header: "Email", key: "email", width: 34 },
    { header: "Ngày đăng ký", key: "createdAt", width: 16 },
    { header: "Loại tài khoản", key: "accountType", width: 16 },
    { header: "Gói đăng ký", key: "plan", width: 26 },
    { header: "Nhận bản tin", key: "newsletter", width: 14 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B1E3D" } };
  headerRow.alignment = { vertical: "middle" };

  for (const u of users) {
    const isPremium = Boolean(u.premiumUntil && u.premiumUntil.getTime() > nowMs);
    sheet.addRow({
      email: u.email,
      createdAt: formatShortDate(u.createdAt),
      accountType: isPremium ? "Premium" : "Free",
      plan: u.orders[0]?.planName || "",
      newsletter: newsletterEmails.has(u.email.trim().toLowerCase()) ? "Có" : "Không",
    });
  }

  sheet.autoFilter = { from: "A1", to: "E1" };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  return workbook.xlsx.writeBuffer();
}

/** Tải trực tiếp file Excel danh sách người dùng. */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Chỉ quản trị viên được xuất danh sách." }, { status: 403 });
    }

    const buffer = await buildUsersWorkbook();
    return new NextResponse(buffer, {
      headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "content-disposition": `attachment; filename="techzone-nguoi-dung.xlsx"`,
      },
    });
  } catch (err) {
    console.error("[export-users.GET] lỗi không lường trước:", err);
    return NextResponse.json(
      { error: "Có lỗi xảy ra phía server, vui lòng thử lại." },
      { status: 500 }
    );
  }
}

/** Gửi file Excel qua email cho chính tài khoản admin đang đăng nhập. */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Chỉ quản trị viên được gửi danh sách." }, { status: 403 });
    }

    const adminEmail = (session!.user as any).email as string;
    const buffer = await buildUsersWorkbook();
    const { sent, reason } = await emailUsersExcel(adminEmail, Buffer.from(buffer));

    if (!sent) {
      return NextResponse.json(
        {
          error:
            reason === "demo"
              ? "Chưa cấu hình RESEND_API_KEY nên chưa gửi được email thật. Dùng nút tải Excel trực tiếp thay thế."
              : "Gửi email thất bại, thử lại sau.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ ok: true, sentTo: adminEmail });
  } catch (err) {
    console.error("[export-users.POST] lỗi không lường trước:", err);
    return NextResponse.json(
      { error: "Có lỗi xảy ra phía server, vui lòng thử lại." },
      { status: 500 }
    );
  }
}
