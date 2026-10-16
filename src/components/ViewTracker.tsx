"use client";

import { useEffect } from "react";

/** Gửi 1 lượt xem khi người đọc mở trang chi tiết bài viết (chỉ 1 lần mỗi lượt tải trang). */
export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/articles/${slug}/view`, { method: "POST" }).catch(() => {});
    (window as any).gtag?.("event", "view_article", { article_slug: slug });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);
  return null;
}
