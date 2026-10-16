import Link from "next/link";
import { searchArticles } from "@/lib/queries";
import { ARTICLE_AUTHORS } from "@/lib/constants";
import ArticleCard from "@/components/ArticleCard";
import FilterBar from "@/components/FilterBar";
import Pagination from "@/components/Pagination";

export const metadata = { title: "Tìm kiếm — TECHZONE" };
export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; sort?: string; author?: string; page?: string };
}) {
  const q = (searchParams.q || "").trim();
  const filters = {
    sort: searchParams.sort === "oldest" ? ("oldest" as const) : ("newest" as const),
    author: searchParams.author || undefined,
    page: searchParams.page ? Number(searchParams.page) : 1,
  };

  const result = q
    ? await searchArticles(q, filters)
    : { total: 0, articles: [], page: 1, pageSize: 9 };

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="py-6">
      <h1 className="text-2xl font-extrabold text-navy">Tìm kiếm</h1>
      {q ? (
        <p className="mt-1 text-sm text-ink/60">
          {result.total} kết quả cho "<span className="font-semibold text-ink">{q}</span>"
        </p>
      ) : (
        <p className="mt-1 text-sm text-ink/60">Nhập từ khoá ở ô tìm kiếm trên thanh menu.</p>
      )}

      {q && (
        <FilterBar
          basePath="/tim-kiem"
          authors={ARTICLE_AUTHORS as unknown as string[]}
          currentQuery={q}
          defaults={filters}
        />
      )}

      {q && result.articles.length === 0 && (
        <p className="rounded border border-line bg-mist px-4 py-10 text-center text-sm text-ink/50">
          Không tìm thấy bài viết phù hợp. Thử từ khoá khác xem sao?
        </p>
      )}

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
        {result.articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>

      <Pagination basePath="/tim-kiem" page={filters.page} totalPages={totalPages} searchParams={{ ...filters, q } as any} />

      {!q && (
        <Link href="/" className="mt-6 inline-block text-sm text-electric hover:underline">
          ← Về trang chủ
        </Link>
      )}
    </div>
  );
}
