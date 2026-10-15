"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type AllowedEmail = { id: string; email: string; note: string | null };

export default function AllowedEmailsManager({ initial }: { initial: AllowedEmail[] }) {
  const router = useRouter();
  const [emails, setEmails] = useState(initial);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/allowed-emails", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email.trim(), note: note.trim() || undefined }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Có lỗi xảy ra.");
      return;
    }
    setEmails((prev) => [data, ...prev]);
    setEmail("");
    setNote("");
    router.refresh();
  }

  async function handleDelete(item: AllowedEmail) {
    if (!confirm(`Xoá "${item.email}" khỏi danh sách được phép đăng ký?`)) return;
    const res = await fetch(`/api/allowed-emails/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      setEmails((prev) => prev.filter((e) => e.id !== item.id));
      router.refresh();
    }
  }

  return (
    <div>
      <p className="mb-3 text-xs text-ink/60">
        Chỉ email có trong danh sách này mới đăng ký (và vì vậy mới đăng bài) được. Thêm email ở
        đây trước khi gửi cho người bạn muốn cấp quyền thành viên.
      </p>
      <form onSubmit={handleAdd} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@vidu.com"
          className="flex-1 rounded border border-line px-3 py-1.5 text-sm outline-none focus:border-electric"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú (tuỳ chọn)"
          className="flex-1 rounded border border-line px-3 py-1.5 text-sm outline-none focus:border-electric"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-navy px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          + Thêm
        </button>
      </form>
      {error && <p className="mb-3 text-sm text-hot">{error}</p>}

      <ul className="divide-y divide-line rounded border border-line">
        {emails.map((item) => (
          <li key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
            <div>
              <span className="font-medium text-ink">{item.email}</span>
              {item.note && <span className="ml-2 text-xs text-ink/50">({item.note})</span>}
            </div>
            <button
              onClick={() => handleDelete(item)}
              className="text-xs font-semibold text-hot hover:underline"
            >
              Xoá
            </button>
          </li>
        ))}
        {emails.length === 0 && (
          <li className="px-3 py-2 text-sm text-ink/40">Chưa có email nào được duyệt.</li>
        )}
      </ul>
    </div>
  );
}
