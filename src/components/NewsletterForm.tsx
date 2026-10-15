"use client";

import type React from "react";
import { useState } from "react";

type State = "idle" | "loading" | "success" | "exists" | "invalid" | "error";

export default function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.status === 201) {
        setState("success");
        setEmailSent(Boolean(data.emailSent));
        setEmail("");
      } else if (res.status === 409) {
        setState("exists");
      } else if (res.status === 400) {
        setState("invalid");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  const inputClass = dark
    ? "bg-white/10 text-white placeholder:text-white/40 border-white/20"
    : "bg-white text-ink placeholder:text-ink/40 border-line";

  if (state === "success") {
    return (
      <p className={`text-sm ${dark ? "text-electric-light" : "text-electric"}`}>
        ✓ Đã lưu email đăng ký!{" "}
        {emailSent
          ? "Kiểm tra hộp thư để xác nhận nhé."
          : "(Chế độ demo: chưa gửi email xác nhận thật — cấu hình RESEND_API_KEY để bật gửi mail.)"}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@cuaban.com"
        className={`min-w-0 flex-1 rounded border px-3 py-2 text-sm outline-none ${inputClass}`}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="shrink-0 rounded bg-electric px-4 py-2 text-sm font-semibold text-white transition hover:bg-electric-light disabled:opacity-60"
      >
        {state === "loading" ? "..." : "Đăng ký"}
      </button>
      {state === "exists" && (
        <p className="absolute mt-10 text-xs text-hot">Email này đã đăng ký rồi.</p>
      )}
      {state === "invalid" && (
        <p className="absolute mt-10 text-xs text-hot">Email không hợp lệ.</p>
      )}
      {state === "error" && (
        <p className="absolute mt-10 text-xs text-hot">Có lỗi xảy ra, thử lại sau.</p>
      )}
    </form>
  );
}
