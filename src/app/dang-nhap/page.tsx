"use client";

import type React from "react";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email hoặc mật khẩu không đúng.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="text-2xl font-extrabold text-navy">Đăng nhập</h1>
      <p className="mt-1 text-sm text-ink/60">Chào mừng bạn quay lại TECHZONE.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-electric"
          />
        </div>
        {error && <p className="text-sm text-hot">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-electric py-2.5 text-sm font-semibold text-white hover:bg-electric-light disabled:opacity-60"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-ink/60">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="font-semibold text-electric hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
