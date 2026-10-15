"use client";

import { useState } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import type { ArticleCardData } from "@/lib/types";

export default function SidebarTabs({
  latest,
  mostRead,
}: {
  latest: ArticleCardData[];
  mostRead: ArticleCardData[];
}) {
  const [tab, setTab] = useState<"latest" | "mostRead">("latest");
  const list = tab === "latest" ? latest : mostRead;

  return (
    <aside className="rounded-sm border border-line">
      <div className="flex border-b border-line text-sm font-bold">
        <button
          onClick={() => setTab("latest")}
          className={`flex-1 py-3 ${tab === "latest" ? "border-b-2 border-electric text-electric" : "text-ink/50"}`}
        >
          Tin mới
        </button>
        <button
          onClick={() => setTab("mostRead")}
          className={`flex-1 py-3 ${tab === "mostRead" ? "border-b-2 border-electric text-electric" : "text-ink/50"}`}
        >
          Đọc nhiều
        </button>
      </div>
      <ol className="max-h-[560px] divide-y divide-line overflow-y-auto">
        {list.map((a, i) => (
          <li key={a.slug}>
            <Link href={`/bai-viet/${a.slug}`} className="group flex gap-3 px-4 py-3">
              <span className="w-5 shrink-0 text-lg font-black leading-none text-line group-hover:text-electric/40">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink group-hover:text-electric">
                  {a.title}
                </p>
                <p className="mt-1 text-[11px] text-ink/45">
                  {tab === "latest" ? timeAgo(a.publishedAt) : `${a.viewCount.toLocaleString("vi-VN")} lượt xem`}
                </p>
              </div>
            </Link>
          </li>
        ))}
        {list.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-ink/40">Chưa có dữ liệu.</li>
        )}
      </ol>
    </aside>
  );
}
