"use client";

import type React from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra.");
        setLoading(false);
        return;
      }
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      setLoading(false);
      if (signInRes?.error) {
        router.push("/dang-nhap");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Có lỗi xảy ra, thử lại sau.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="text-2xl font-extrabold text-navy">Đăng ký</h1>
      <p className="mt-1 text-sm text-ink/60">
        Tạo tài khoản để đăng bài, bình luận và đọc không giới hạn mọi bài Premium.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/70">Họ tên</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-electric"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/70">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-electric"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/70">Mật khẩu</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-electric"
          />
          <p className="mt-1 text-xs text-ink/40">Tối thiểu 6 ký tự.</p>
        </div>
        {error && <p className="text-sm text-hot">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-electric py-2.5 text-sm font-semibold text-white hover:bg-electric-light disabled:opacity-60"
        >
          {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-ink/60">
        Đã có tài khoản?{" "}
        <Link href="/dang-nhap" className="font-semibold text-electric hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
