"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term) router.push(`/tim-kiem?q=${encodeURIComponent(term)}`);
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "w-full" : "hidden w-64 sm:block"}>
      <div className="flex items-center rounded-full border border-line bg-mist px-3 py-1.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink/50">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm kiếm bài viết..."
          className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-ink/40"
        />
      </div>
    </form>
  );
}
