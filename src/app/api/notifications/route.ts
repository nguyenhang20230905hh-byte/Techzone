import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LIST_LIMIT = 30;

// Danh sách thông báo của người đang đăng nhập (mới nhất trước) + số chưa đọc
// thật (đếm riêng bằng count, không suy ra từ LIST_LIMIT bản ghi trả về, để
// luôn đúng kể cả khi có hơn 30 thông báo chưa đọc).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: LIST_LIMIT,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return NextResponse.json({ items, unreadCount });
}

// Đánh dấu đã đọc: truyền { id } để đánh dấu 1 thông báo cụ thể (dùng khi bấm
// vào 1 thông báo), hoặc không truyền id để đánh dấu TẤT CẢ đã đọc (nút "Đánh
// dấu tất cả đã đọc").
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const body = await req.json().catch(() => ({}));
  const id = typeof body?.id === "string" ? body.id : null;

  if (id) {
    // updateMany + where userId (thay vì update theo id đơn thuần) để không
    // ai đánh dấu được thông báo của người khác chỉ bằng cách đoán id.
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  } else {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  return NextResponse.json({ ok: true });
}
