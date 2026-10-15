import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estimateReadingMinutes } from "@/lib/utils";

const schema = z.object({
  title: z.string().trim().min(10).max(200).optional(),
  summary: z.string().trim().min(20).max(400).optional(),
  content: z.string().trim().min(400).optional(),
  coverImageUrl: z.string().url().optional(),
  categoryId: z.string().min(1).optional(),
  isPremium: z.boolean().optional(),
  isFeatured: z.boolean().optional(), // chỉ ADMIN mới thực sự đổi được (kiểm tra bên dưới)
});

async function findOwnedArticle(slug: string, userId: string, role: string) {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) return { article: null, allowed: false };
  const allowed = article.authorId === userId || role === "ADMIN";
  return { article, allowed };
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const { article, allowed } = await findOwnedArticle(params.slug, userId, role);
  if (!article) return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
  if (!allowed) return NextResponse.json({ error: "Bạn không có quyền sửa bài này." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Chỉ ADMIN được đổi cờ "bài nổi bật trang chủ".
  const isFeatured = role === "ADMIN" ? data.isFeatured : undefined;

  const updated = await prisma.article.update({
    where: { slug: params.slug },
    data: {
      ...(data.title ? { title: data.title } : {}),
      ...(data.summary ? { summary: data.summary } : {}),
      ...(data.content
        ? { content: data.content, readingMinutes: estimateReadingMinutes(data.content) }
        : {}),
      ...(data.coverImageUrl ? { coverImageUrl: data.coverImageUrl } : {}),
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      ...(data.isPremium !== undefined ? { isPremium: data.isPremium } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
    },
  });

  return NextResponse.json({ slug: updated.slug });
}

export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const { article, allowed } = await findOwnedArticle(params.slug, userId, role);
  if (!article) return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });
  if (!allowed) return NextResponse.json({ error: "Bạn không có quyền xoá bài này." }, { status: 403 });

  await prisma.article.delete({ where: { slug: params.slug } });
  return NextResponse.json({ ok: true });
}
