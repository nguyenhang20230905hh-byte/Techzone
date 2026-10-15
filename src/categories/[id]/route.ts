import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  description: z.string().trim().max(300).optional(),
  showOnHome: z.boolean().optional(),
  order: z.number().int().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "ADMIN";
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Chỉ quản trị viên được sửa chuyên mục." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
  const updated = await prisma.category.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Chỉ quản trị viên được xoá chuyên mục." }, { status: 403 });
  }
  const articleCount = await prisma.article.count({ where: { categoryId: params.id } });
  if (articleCount > 0) {
    return NextResponse.json(
      { error: `Chuyên mục còn ${articleCount} bài viết, không thể xoá.` },
      { status: 400 }
    );
  }
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
