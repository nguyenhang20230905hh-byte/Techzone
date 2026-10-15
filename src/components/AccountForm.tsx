"use client";

import type React from "react";
import { useState } from "react";

export default function AccountForm({ initialName, initialBio }: { initialName: string; initialBio: string }) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, bio }),
    });
    setState(res.ok ? "saved" : "error");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-ink/70">Họ tên hiển thị</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-electric"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink/70">Giới thiệu ngắn</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={300}
          className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-electric"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state === "saving"}
          className="rounded-full bg-electric px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {state === "saving" ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        {state === "saved" && <span className="text-sm text-electric">✓ Đã lưu.</span>}
        {state === "error" && <span className="text-sm text-hot">Có lỗi xảy ra.</span>}
      </div>
    </form>
  );
}
