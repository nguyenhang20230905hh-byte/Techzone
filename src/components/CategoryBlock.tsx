import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import type { ArticleCardData } from "@/lib/types";

export default function CategoryBlock({
  categoryName,
  categorySlug,
  featured,
  rest,
}: {
  categoryName: string;
  categorySlug: string;
  featured: ArticleCardData;
  rest: ArticleCardData[];
}) {
  return (
    <section className="py-8">
      <div className="mb-4 flex items-end justify-between border-b-2 border-navy pb-2">
        <h2 className="text-xl font-extrabold text-navy">
          <span className="mr-2 inline-block h-5 w-1.5 -translate-y-0.5 bg-electric align-middle" />
          {categoryName}
        </h2>
        <Link href={`/category/${categorySlug}`} className="text-sm font-semibold text-electric hover:underline">
          Xem tất cả →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Link href={`/bai-viet/${featured.slug}`} className="group md:col-span-2">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-mist">
            <img
              src={featured.coverImageUrl}
              alt={featured.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </div>
          <p className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-ink group-hover:text-electric">
            {featured.title}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-ink/60">{featured.summary}</p>
        </Link>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:col-span-2">
          {rest.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </div>
    </section>
  );
}
