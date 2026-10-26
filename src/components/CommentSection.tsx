"use client";

import type React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { timeAgo } from "@/lib/utils";
import { ADMIN_DISPLAY_NAME } from "@/lib/constants";

export type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string; role?: "MEMBER" | "ADMIN" };
  parentId: string | null;
  isDeleted: boolean;
};

type CommentThread = CommentItem & { replies: CommentItem[] };

// Phản hồi chỉ có 1 cấp (xem giải thích ở prisma/schema.prisma): gom các bình
// luận có parentId vào đúng bình luận gốc, sắp bình luận gốc mới nhất lên
// trước và phản hồi trong từng luồng theo thứ tự thời gian (cũ -> mới, giống
// hội thoại).
function buildThreads(flat: CommentItem[]): CommentThread[] {
  const roots = new Map<string, CommentThread>();
  const orphanReplies: CommentItem[] = [];

  for (const c of flat) {
    if (!c.parentId) roots.set(c.id, { ...c, replies: [] });
  }
  for (const c of flat) {
    if (c.parentId) {
      const root = roots.get(c.parentId);
      if (root) root.replies.push(c);
      else orphanReplies.push(c); // phòng trường hợp dữ liệu cũ/lỗi, không nên xảy ra
    }
  }

  const threads = Array.from(roots.values());
  threads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  for (const t of threads) {
    t.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  if (orphanReplies.length) {
    orphanReplies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    threads.push(...orphanReplies.map((r) => ({ ...r, replies: [] })));
  }
  return threads;
}

function displayName(author: { name: string; role?: "MEMBER" | "ADMIN" }): string {
  return author.role === "ADMIN" ? ADMIN_DISPLAY_NAME : author.name;
}

function CommentBody({ c }: { c: CommentItem }) {
  return (
    <div id={`comment-${c.id}`} className="scroll-mt-24">
      <div className="flex items-center gap-2 text-sm">
        <span className={`font-semibold ${c.author.role === "ADMIN" ? "text-electric" : "text-navy"}`}>
          {displayName(c.author)}
        </span>
        {c.author.role === "ADMIN" && (
          <span className="rounded-full bg-electric/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-electric">
            Admin
          </span>
        )}
        <span className="text-xs text-ink/40">{timeAgo(new Date(c.createdAt))}</span>
      </div>
      {c.isDeleted ? (
        <p className="mt-1 text-sm italic text-ink/40">Bình luận đã bị xoá.</p>
      ) : (
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{c.content}</p>
      )}
    </div>
  );
}

export default function CommentSection({
  slug,
  initialComments,
}: {
  slug: string;
  initialComments: CommentItem[];
}) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");

  const threads = useMemo(() => buildThreads(comments), [comments]);
  const totalCount = comments.filter((c) => !c.isDeleted).length;

  async function postComment(content: string, parentId: string | null) {
    const res = await fetch(`/api/articles/${slug}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content, parentId: parentId || undefined }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Không gửi được bình luận.");
    }
    return (await res.json()) as CommentItem;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setSubmitting(true);
    setError("");
    try {
      const newComment = await postComment(content, null);
      setComments((prev) => [...prev, newComment]);
      setText("");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReplySubmit(rootId: string) {
    const content = replyText.trim();
    if (!content) return;
    setReplySubmitting(true);
    setReplyError("");
    try {
      const newComment = await postComment(content, rootId);
      setComments((prev) => [...prev, newComment]);
      setReplyText("");
      setReplyTo(null);
    } catch (err: any) {
      setReplyError(err.message || "Có lỗi xảy ra.");
    } finally {
      setReplySubmitting(false);
    }
  }

  return (
    <section className="mt-10 border-t border-line pt-6">
      <h3 className="mb-4 text-lg font-bold text-navy">Bình luận ({totalCount})</h3>

      {status === "authenticated" ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Chia sẻ suy nghĩ của bạn..."
            className="w-full rounded border border-line p-3 text-sm outline-none focus:border-electric"
          />
          <div className="mt-2 flex items-center justify-between">
            {error && <p className="text-xs text-hot">{error}</p>}
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="ml-auto rounded bg-electric px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : "Gửi bình luận"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-6 rounded bg-mist px-4 py-3 text-sm text-ink/70">
          <Link href="/dang-nhap" className="font-semibold text-electric hover:underline">
            Đăng nhập
          </Link>{" "}
          để tham gia bình luận.
        </p>
      )}

      <ul className="space-y-5">
        {threads.map((t) => (
          <li key={t.id} className="border-b border-line pb-5">
            <CommentBody c={t} />

            {!t.isDeleted && status === "authenticated" && (
              <button
                type="button"
                onClick={() => {
                  setReplyTo(replyTo === t.id ? null : t.id);
                  setReplyError("");
                }}
                className="mt-1.5 text-xs font-semibold text-ink/50 hover:text-electric"
              >
                {replyTo === t.id ? "Huỷ" : "Trả lời"}
              </button>
            )}

            {t.replies.length > 0 && (
              <ul className="mt-3 space-y-3 border-l-2 border-line pl-4">
                {t.replies.map((r) => (
                  <li key={r.id}>
                    <CommentBody c={r} />
                  </li>
                ))}
              </ul>
            )}

            {replyTo === t.id && (
              <div className="mt-3 border-l-2 border-line pl-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  maxLength={2000}
                  rows={2}
                  autoFocus
                  placeholder="Viết phản hồi..."
                  className="w-full rounded border border-line p-2.5 text-sm outline-none focus:border-electric"
                />
                <div className="mt-1.5 flex items-center justify-between">
                  {replyError && <p className="text-xs text-hot">{replyError}</p>}
                  <button
                    type="button"
                    onClick={() => handleReplySubmit(t.id)}
                    disabled={replySubmitting || !replyText.trim()}
                    className="ml-auto rounded bg-electric px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {replySubmitting ? "Đang gửi..." : "Gửi phản hồi"}
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        {threads.length === 0 && (
          <li className="text-sm text-ink/40">Chưa có bình luận nào. Hãy là người đầu tiên!</li>
        )}
      </ul>
    </section>
  );
}
