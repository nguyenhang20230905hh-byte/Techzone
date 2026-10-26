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

  const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);

  // Dùng lại bản đã cache — TRỪ khi đó là bản demo mà giờ đã có API key
  // (trước đây bản demo bị cache vĩnh viễn nên dù cấu hình key rồi vẫn mãi là demo).
  if (article.aiSummary && !(article.aiSummary.isDemo && hasApiKey)) {
    return NextResponse.json({
      points: JSON.parse(article.aiSummary.points),
      conclusion: article.aiSummary.conclusion,
      isDemo: article.aiSummary.isDemo,
    });
  }

  const result = await summarizeArticle(article.title, article.content);

  // Có key mà vẫn ra demo = gọi AI thất bại tạm thời -> không cache, lần sau thử lại.
  if (!(result.isDemo && hasApiKey)) {
    const data = {
      points: JSON.stringify(result.points),
      conclusion: result.conclusion,
      isDemo: result.isDemo,
    };
    await prisma.aISummary
      .upsert({ where: { articleId: article.id }, update: data, create: { articleId: article.id, ...data } })
      .catch((err) => console.error("[summary] không lưu được cache:", err));
  }

  return NextResponse.json(result);
}
