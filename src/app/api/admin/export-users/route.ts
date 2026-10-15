import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailUsersCsv } from "@/lib/email";
import { formatShortDate } from "@/lib/utils";

async function buildCsv(): Promise<string> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { name: true, email: true, role: true, createdAt: true },
  });
  const header = "Tên,Email,Vai trò,Ngày tham gia";
  const rows = users.map((u) =>
    [u.name, u.email, u.role, formatShortDate(u.createdAt)]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header, ...rows].join("\n");
}

/** Tải trực tiếp file CSV danh sách người dùng. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Chỉ quản trị viên được xuất danh sách." }, { status: 403 });
  }

  const csv = await buildCsv();
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="techzone-users.csv"`,
    },
  });
}

/** Gửi file CSV qua email cho chính tài khoản admin đang đăng nhập. */
export async function POST() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Chỉ quản trị viên được gửi danh sách." }, { status: 403 });
  }

  const adminEmail = (session!.user as any).email as string;
  const csv = await buildCsv();
  const { sent, reason } = await emailUsersCsv(adminEmail, csv);

  if (!sent) {
    return NextResponse.json(
      {
        error:
          reason === "demo"
            ? "Chưa cấu hình RESEND_API_KEY nên chưa gửi được email thật. Dùng nút tải CSV trực tiếp thay thế."
            : "Gửi email thất bại, thử lại sau.",
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ ok: true, sentTo: adminEmail });
}
