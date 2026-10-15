import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Xoá mềm bình luận — tác giả bình luận hoặc ADMIN mới xoá được. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }
  const comment = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!comment) return NextResponse.json({ error: "Không tìm thấy bình luận." }, { status: 404 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  if (comment.authorId !== userId && role !== "ADMIN") {
    return NextResponse.json({ error: "Bạn không có quyền xoá bình luận này." }, { status: 403 });
  }

  await prisma.comment.update({ where: { id: params.id }, data: { isDeleted: true } });
  return NextResponse.json({ ok: true });
}
