"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Nút xoá bài viết (chỉ nên render cho ADMIN — API vẫn kiểm tra quyền ở server).
 * - redirectTo: chuyển trang sau khi xoá (dùng ở trang chi tiết bài).
 * - onDeleted: callback cập nhật danh sách tại chỗ (dùng trong /admin).
 */
export default function DeleteArticleButton({
  slug,
  title,
  redirectTo,
  onDeleted,
  className,
}: {
  slug: string;
  title: string;
  redirectTo?: string;
  onDeleted?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const ok = confirm(
      `Xoá bài "${title}"?\n\nBình luận, lượt xem và ảnh bìa của bài cũng bị xoá. Không thể hoàn tác.`
    );
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/articles/${slug}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Không xoá được bài viết.");
        setDeleting(false);
        return;
      }
      onDeleted?.();
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch {
      alert("Có lỗi xảy ra, thử lại sau.");
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className={
        className ||
        "shrink-0 rounded border border-hot/40 px-3 py-1 text-xs font-semibold text-hot hover:bg-hot hover:text-white disabled:opacity-50"
      }
    >
      {deleting ? "Đang xoá..." : "Xoá"}
    </button>
  );
}
