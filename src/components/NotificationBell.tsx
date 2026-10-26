"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { timeAgo } from "@/lib/utils";

type NotificationItem = {
  id: string;
  type: "NEW_COMMENT" | "COMMENT_REPLY" | "NEW_ARTICLE";
  message: string;
  articleSlug: string | null;
  commentId: string | null;
  isRead: boolean;
  createdAt: string;
};

const POLL_MS = 45_000;

function notificationHref(n: NotificationItem): string | null {
  if (!n.articleSlug) return null;
  return n.commentId ? `/bai-viet/${n.articleSlug}#comment-${n.commentId}` : `/bai-viet/${n.articleSlug}`;
}

/**
 * Chuông thông báo dùng chung cho cả ADMIN (nhận thông báo bình luận của
 * khán giả) và thành viên (nhận thông báo bài mới + phản hồi bình luận của
 * mình) — nội dung khác nhau hoàn toàn tự nhiên vì mỗi người chỉ nhận thông
 * báo của chính họ (xem api/notifications, lib/notifications.ts). Không hiện
 * gì nếu chưa đăng nhập.
 */
export default function NotificationBell() {
  const { status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // im lặng bỏ qua — chuông thông báo không quan trọng bằng nội dung chính của trang
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [status, load]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      await load();
      setLoading(false);
    }
  }

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
    } catch {
      // bỏ qua - lần fetch tiếp theo sẽ tự đồng bộ lại đúng trạng thái
    }
  }

  async function handleClick(n: NotificationItem) {
    setOpen(false);
    if (!n.isRead) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      }).catch(() => {});
    }
    const href = notificationHref(n);
    if (href) router.push(href);
  }

  if (status !== "authenticated") return null;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="Thông báo"
        className="relative rounded-full border border-line p-2 text-ink/70 transition hover:border-electric hover:text-electric"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2.5c-3.2 0-5.5 2.4-5.5 5.6v3.3c0 .6-.2 1.3-.6 1.9L4.6 15.6c-.6.9 0 2.1 1 2.1h12.8c1 0 1.6-1.2 1-2.1l-1.3-2.3c-.4-.6-.6-1.3-.6-1.9V8.1c0-3.2-2.3-5.6-5.5-5.6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M9.5 19.5a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-hot px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 max-w-[90vw] rounded border border-line bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <span className="text-sm font-bold text-navy">Thông báo</span>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-semibold text-electric hover:underline">
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {loading && <li className="px-3 py-6 text-center text-sm text-ink/40">Đang tải...</li>}
            {!loading && items.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-ink/40">Chưa có thông báo nào.</li>
            )}
            {!loading &&
              items.map((n) => (
                <li key={n.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    className={`block w-full px-3 py-2.5 text-left text-sm transition hover:bg-mist ${
                      n.isRead ? "text-ink/60" : "bg-mist/60 font-medium text-ink"
                    }`}
                  >
                    <p className="leading-snug">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-ink/40">{timeAgo(new Date(n.createdAt))}</p>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
