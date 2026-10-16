import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getReaderAccess } from "@/lib/premium";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    select: { id: true, isPremium: true },
  });
  if (!article) return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });

  if (article.isPremium) {
    const access = await getReaderAccess(await getServerSession(authOptions));
    if (!access.canReadPremium) {
      return NextResponse.json({ error: "Bài viết Premium." }, { status: 403 });
    }
  }

  const comments = await prisma.comment.findMany({
    where: { articleId: article.id, isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });
  return NextResponse.json(comments);
}

// Lọc nội dung đầu vào cơ bản: chặn bình luận rỗng, quá dài, hoặc chứa thẻ HTML/script
// (phòng XSS ở mức input — phần hiển thị cũng render dưới dạng text thuần, không dùng
// dangerouslySetInnerHTML).
function sanitizeComment(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.length > 2000) return null;
  const stripped = trimmed.replace(/<[^>]*>/g, "");
  return stripped.trim() || null;
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để bình luận." }, { status: 401 });
  }

  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    select: { id: true, isPremium: true },
  });
  if (!article) return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });

  if (article.isPremium) {
    const access = await getReaderAccess(session);
    if (!access.canReadPremium) {
      return NextResponse.json(
        { error: "Cần gói Premium còn hạn để bình luận ở bài Premium." },
        { status: 403 }
      );
    }
  }

  const body = await req.json().catch(() => null);
  const content = sanitizeComment((body?.content || "").toString());
  if (!content) {
    return NextResponse.json({ error: "Nội dung bình luận không hợp lệ." }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      articleId: article.id,
      authorId: (session.user as any).id,
    },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}
