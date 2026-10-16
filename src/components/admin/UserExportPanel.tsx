"use client";

import { useState } from "react";

export default function UserExportPanel() {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleEmailSend() {
    setSending(true);
    setMessage("");
    const res = await fetch("/api/admin/export-users", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) {
      setMessage(data.error || "Có lỗi xảy ra.");
      return;
    }
    setMessage(`Đã gửi danh sách tới ${data.sentTo}.`);
  }

  return (
    <div>
      <p className="mb-3 text-xs text-ink/60">
        Xuất danh sách toàn bộ người dùng dạng Excel (.xlsx): email, ngày đăng ký, loại tài khoản
        (Free/Premium), gói đăng ký (1 tháng/6 tháng/1 năm) và tình trạng nhận bản tin.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href="/api/admin/export-users"
          className="rounded bg-navy px-4 py-1.5 text-sm font-semibold text-white hover:bg-navy-light"
        >
          Tải file Excel
        </a>
        <button
          onClick={handleEmailSend}
          disabled={sending}
          className="rounded border border-electric px-4 py-1.5 text-sm font-semibold text-electric hover:bg-electric hover:text-white disabled:opacity-60"
        >
          {sending ? "Đang gửi..." : "Gửi qua email của tôi"}
        </button>
      </div>
      {message && <p className="mt-2 text-sm text-ink/70">{message}</p>}
    </div>
  );
}
