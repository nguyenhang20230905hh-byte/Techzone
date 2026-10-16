"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DeleteArticleButton from "@/components/DeleteArticleButton";

type ArticleRow = { slug: string; title: string; isFeatured: boolean; isPremium: boolean };

export default function FeaturedManager({ initial }: { initial: ArticleRow[] }) {
  const router = useRouter();
  const [articles, setArticles] = useState(initial);

  async function toggle(a: ArticleRow, field: "isFeatured" | "isPremium") {
    const res = await fetch(`/api/articles/${a.slug}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ [field]: !a[field] }),
    });
    if (res.ok) {
      setArticles((prev) =>
        prev.map((x) => (x.slug === a.slug ? { ...x, [field]: !x[field] } : x))
      );
      router.refresh();
    }
  }

  return (
    <ul className="divide-y divide-line rounded border border-line">
      {articles.map((a) => (
        <li key={a.slug} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-sm">
          <Link href={`/bai-viet/${a.slug}`} className="min-w-0 flex-1 truncate font-medium text-ink hover:text-electric">
            {a.title}
          </Link>
          <label className="flex shrink-0 items-center gap-1.5 text-xs text-ink/60">
            <input type="checkbox" checked={a.isFeatured} onChange={() => toggle(a, "isFeatured")} />
            Nổi bật trang chủ
          </label>
          <label className="flex shrink-0 items-center gap-1.5 text-xs text-ink/60">
            <input type="checkbox" checked={a.isPremium} onChange={() => toggle(a, "isPremium")} />
            Premium
          </label>
          <Link
            href={`/dang-bai/${a.slug}/sua`}
            className="shrink-0 rounded border border-line px-3 py-1 text-xs font-semibold hover:border-electric hover:text-electric"
          >
            Sửa
          </Link>
          <DeleteArticleButton
            slug={a.slug}
            title={a.title}
            onDeleted={() => setArticles((prev) => prev.filter((x) => x.slug !== a.slug))}
          />
        </li>
      ))}
      {articles.length === 0 && (
        <li className="px-3 py-4 text-center text-sm text-ink/40">Chưa có bài viết nào.</li>
      )}
    </ul>
  );
}
