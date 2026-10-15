"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { timeAgo } from "@/lib/utils";

export type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string };
};

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/articles/${slug}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Không gửi được bình luận.");
      }
      const newComment = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setText("");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-10 border-t border-line pt-6">
      <h3 className="mb-4 text-lg font-bold text-navy">Bình luận ({comments.length})</h3>

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

      <ul className="space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="border-b border-line pb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-navy">{c.author.name}</span>
              <span className="text-xs text-ink/40">{timeAgo(new Date(c.createdAt))}</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-ink/80">{c.content}</p>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-sm text-ink/40">Chưa có bình luận nào. Hãy là người đầu tiên!</li>
        )}
      </ul>
    </section>
  );
}
