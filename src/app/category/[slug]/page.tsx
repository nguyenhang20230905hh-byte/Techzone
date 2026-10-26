import Link from "next/link";
import type { Metadata } from "next";
import { getCategoryPage, CARD_SELECT } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";
import FilterBar from "@/components/FilterBar";
import Pagination from "@/components/Pagination";
import { MostReadModule, SideAdModule, NewsletterModule } from "@/components/SideModules";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  return { title: category ? `${category.name} — TECHZONE` : "Chuyên mục — TECHZONE" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { sort?: string; author?: string; from?: string; to?: string; page?: string };
}) {
  const filters = {
    sort: searchParams.sort === "oldest" ? ("oldest" as const) : ("newest" as const),
    author: searchParams.author || undefined,
    from: searchParams.from || undefined,
    to: searchParams.to || undefined,
    page: searchParams.page ? Number(searchParams.page) : 1,
  };

  const [result, settings, mostRead] = await Promise.all([
    getCategoryPage(params.slug, filters),
    getSiteSettings(),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: CARD_SELECT,
    }),
  ]);

  if (!result) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-xl font-bold text-navy">Không tìm thấy chuyên mục</h1>
        <Link href="/" className="mt-3 inline-block text-electric hover:underline">
          ← Về trang chủ
        </Link>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="py-6">
      <nav className="mb-3 text-sm text-ink/50">
        <Link href="/" className="hover:text-electric">
          Trang chủ
        </Link>
        <span className="mx-1.5">›</span>
        <span className="font-medium text-ink">{result.category.name}</span>
      </nav>
      <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">{result.category.name}</h1>
      {result.category.description && (
        <p className="mt-2 max-w-2xl text-sm text-ink/60">{result.category.description}</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FilterBar
            basePath={`/category/${params.slug}`}
            authors={result.authors}
            defaults={filters}
          />

          {result.featured && (
            <Link href={`/bai-viet/${result.featured.slug}`} className="group mb-6 block">
              <div className="relative aspect-[16/8] w-full overflow-hidden rounded-sm bg-mist">
                <img
                  src={result.featured.coverImageUrl}
                  alt={result.featured.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <h2 className="mt-3 text-xl font-extrabold leading-snug text-navy group-hover:text-electric">
                {result.featured.title}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-ink/60">{result.featured.summary}</p>
            </Link>
          )}

          {result.articles.length === 0 && !result.featured ? (
            <p className="rounded border border-line bg-mist px-4 py-10 text-center text-sm text-ink/50">
              Chưa có bài viết phù hợp với bộ lọc hiện tại.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
              {result.articles.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          )}

          <Pagination
            basePath={`/category/${params.slug}`}
            page={filters.page}
            totalPages={totalPages}
            searchParams={filters as any}
          />
        </div>

        <aside className="space-y-6">
          <MostReadModule articles={mostRead} />
          {settings.inlineAds[0] && <SideAdModule ad={settings.inlineAds[0]} />}
          <NewsletterModule />
        </aside>
      </div>
    </div>
  );
}
