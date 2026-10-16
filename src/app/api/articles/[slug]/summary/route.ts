import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { summarizeArticle } from "@/lib/ai";
import { getReaderAccess } from "@/lib/premium";

export async function POST(_req: Request, { params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: { aiSummary: true },
  });
  if (!article) return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });

  // Bài premium: phải là ADMIN hoặc có Premium còn hạn mới được tóm tắt,
  // tránh lộ nội dung trả phí qua AI.
  if (article.isPremium) {
    const session = await getServerSession(authOptions);
    const access = await getReaderAccess(session);
    if (!access.canReadPremium) {
      return NextResponse.json(
        { error: "Bài viết Premium — cần gói Premium còn hạn để dùng tóm tắt AI." },
        { status: 403 }
      );
    }
  }

  if (article.aiSummary) {
    return NextResponse.json({
      points: JSON.parse(article.aiSummary.points),
      conclusion: article.aiSummary.conclusion,
      isDemo: article.aiSummary.isDemo,
    });
  }

  const result = await summarizeArticle(article.title, article.content);

  await prisma.aISummary.create({
    data: {
      articleId: article.id,
      points: JSON.stringify(result.points),
      conclusion: result.conclusion,
      isDemo: result.isDemo,
    },
  });

  return NextResponse.json(result);
}
