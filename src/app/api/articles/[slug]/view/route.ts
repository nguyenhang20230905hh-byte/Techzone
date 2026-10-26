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
    // Tăng lượt xem bằng SQL thô: prisma.article.update sẽ tự đổi cột updatedAt
    // (@updatedAt), làm bài nào có người đọc cũng hiện "Cập nhật <hôm nay>".
    prisma.$executeRaw`UPDATE "articles" SET "viewCount" = "viewCount" + 1 WHERE "id" = ${article.id}`,
  ]);

  return NextResponse.json({ ok: true });
}
