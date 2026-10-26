import { prisma } from "@/lib/prisma";
import { ADMIN_DISPLAY_NAME } from "@/lib/constants";

/**
 * Tạo thông báo cho người dùng — dùng chung cho 3 tình huống:
 *  - NEW_COMMENT: admin nhận khi có khán giả bình luận/phản hồi về 1 bài viết.
 *  - COMMENT_REPLY: tác giả 1 bình luận nhận khi có người phản hồi lại đúng
 *    bình luận của họ.
 *  - NEW_ARTICLE: mọi thành viên nhận khi admin đăng bài viết mới.
 * Mọi lỗi ở đây chỉ log lại, KHÔNG được làm hỏng luồng chính (gửi bình luận/
 * đăng bài vẫn phải thành công dù tạo thông báo thất bại).
 */

type NewCommentParams = {
  articleSlug: string;
  articleTitle: string;
  commentId: string;
  actorId: string;
  actorName: string;
  actorIsAdmin: boolean;
};

export async function notifyNewComment(params: NewCommentParams): Promise<void> {
  try {
    // Admin không cần tự thông báo cho chính mình khi admin là người bình luận.
    if (params.actorIsAdmin) return;

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    if (admins.length === 0) return;

    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        type: "NEW_COMMENT",
        message: `${params.actorName} vừa bình luận về bài "${params.articleTitle}"`,
        articleSlug: params.articleSlug,
        commentId: params.commentId,
      })),
    });
  } catch (err) {
    console.error("[notifications.notifyNewComment]", err);
  }
}

type CommentReplyParams = {
  parentAuthorId: string;
  articleSlug: string;
  articleTitle: string;
  commentId: string;
  actorId: string;
  actorName: string;
  actorIsAdmin: boolean;
};

export async function notifyCommentReply(params: CommentReplyParams): Promise<void> {
  try {
    // Không tự thông báo khi tự trả lời bình luận của chính mình.
    if (params.parentAuthorId === params.actorId) return;

    const displayName = params.actorIsAdmin ? ADMIN_DISPLAY_NAME : params.actorName;
    await prisma.notification.create({
      data: {
        userId: params.parentAuthorId,
        type: "COMMENT_REPLY",
        message: `${displayName} đã phản hồi bình luận của bạn trong bài "${params.articleTitle}"`,
        articleSlug: params.articleSlug,
        commentId: params.commentId,
      },
    });
  } catch (err) {
    console.error("[notifications.notifyCommentReply]", err);
  }
}

type NewArticleParams = {
  articleSlug: string;
  articleTitle: string;
};

export async function notifyNewArticle(params: NewArticleParams): Promise<void> {
  try {
    const members = await prisma.user.findMany({
      where: { role: "MEMBER" },
      select: { id: true },
    });
    if (members.length === 0) return;

    await prisma.notification.createMany({
      data: members.map((m) => ({
        userId: m.id,
        type: "NEW_ARTICLE",
        message: `Bài viết mới: "${params.articleTitle}"`,
        articleSlug: params.articleSlug,
      })),
    });
  } catch (err) {
    console.error("[notifications.notifyNewArticle]", err);
  }
}
