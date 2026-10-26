import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getReaderAccess } from "@/lib/premium";
import { notifyNewComment, notifyCommentReply } from "@/lib/notifications";

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

  // Không lọc isDeleted ở đây: 1 bình luận gốc bị xoá vẫn phải trả về (để
  // component hiện "Bình luận đã bị xoá" và vẫn giữ được các phản hồi bên
  // dưới nó) — ẩn hẳn sẽ khiến phản hồi mồ côi bị hiểu nhầm thành bình luận gốc.
  const comments = await prisma.comment.findMany({
    where: { articleId: article.id },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { name: true, role: true } } },
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
    select: { id: true, title: true, isPremium: true },
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

  // Phản hồi 1 cấp: parentId (nếu có) phải là 1 bình luận GỐC (không có parent
  // riêng) thuộc đúng bài viết này — chặn việc trả lời 1 bình luận ở bài khác,
  // hoặc cố tạo nhiều cấp lồng nhau từ phía client.
  const rawParentId = typeof body?.parentId === "string" ? body.parentId.trim() : "";
  let parent: { id: string; authorId: string } | null = null;
  if (rawParentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: rawParentId },
      select: { id: true, authorId: true, articleId: true, parentId: true },
    });
    if (!parentComment || parentComment.articleId !== article.id || parentComment.parentId) {
      return NextResponse.json({ error: "Không tìm thấy bình luận để phản hồi." }, { status: 400 });
    }
    parent = parentComment;
  }

  const actorId = (session.user as any).id as string;
  const actorRole = (session.user as any).role as "MEMBER" | "ADMIN";
  const actorIsAdmin = actorRole === "ADMIN";

  const comment = await prisma.comment.create({
    data: {
      content,
      articleId: article.id,
      authorId: actorId,
      parentId: parent?.id,
    },
    include: { author: { select: { name: true, role: true } } },
  });

  // Tạo thông báo. Đợi (await) các hàm này thay vì "bắn rồi quên" — trên môi
  // trường serverless (Vercel), code chạy sau khi response đã trả về không
  // được đảm bảo chạy tiếp, nên bắn-rồi-quên có thể làm mất thông báo. Bản
  // thân các hàm này đã tự bắt lỗi (xem lib/notifications.ts) nên await ở
  // đây không bao giờ khiến việc gửi bình luận bị lỗi theo.
  await Promise.all([
    parent
      ? notifyCommentReply({
          parentAuthorId: parent.authorId,
          articleSlug: params.slug,
          articleTitle: article.title,
          commentId: comment.id,
          actorId,
          actorName: comment.author.name,
          actorIsAdmin,
        })
      : Promise.resolve(),
    notifyNewComment({
      articleSlug: params.slug,
      articleTitle: article.title,
      commentId: comment.id,
      actorId,
      actorName: comment.author.name,
      actorIsAdmin,
    }),
  ]);

  return NextResponse.json(comment, { status: 201 });
}
