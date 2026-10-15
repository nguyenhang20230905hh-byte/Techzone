import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });
  if (!article) return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });

  await prisma.$transaction([
    prisma.articleView.create({ data: { articleId: article.id } }),
    prisma.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } }),
  ]);

  return NextResponse.json({ ok: true });
}
