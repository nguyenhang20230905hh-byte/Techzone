"use client";

import { useEffect } from "react";
import Link from "next/link";

// Trang báo lỗi thân thiện thay cho màn hình trắng "Application error" của Next.js.
// Chi tiết lỗi thật vẫn nằm trong Vercel → Logs (tìm theo mã digest bên dưới).
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-24 text-center">
      <h1 className="text-xl font-bold text-navy">Đã có lỗi xảy ra</h1>
      <p className="mt-2 text-sm text-ink/60">Trang tạm thời không tải được. Bạn thử lại sau ít phút nhé.</p>
      {error.digest && <p className="mt-1 text-xs text-ink/40">Mã lỗi: {error.digest}</p>}
      <div className="mt-5 flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-electric px-5 py-2 text-sm font-semibold text-white"
        >
          Thử lại
        </button>
        <Link href="/" className="rounded-full border border-electric px-5 py-2 text-sm font-semibold text-electric">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
