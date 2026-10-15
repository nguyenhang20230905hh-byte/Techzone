import Image from "next/image";
import Link from "next/link";
import { formatShortDate } from "@/lib/utils";
import type { ArticleCardData } from "@/lib/types";

export default function ArticleCard({
  article,
  variant = "grid",
}: {
  article: ArticleCardData;
  variant?: "grid" | "list";
}) {
  const href = `/bai-viet/${article.slug}`;

  if (variant === "list") {
    return (
      <Link href={href} className="group flex gap-3 py-3">
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-sm bg-mist">
          <Image src={article.coverImageUrl} alt={article.title} fill sizes="96px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink group-hover:text-electric">
            {article.title}
          </p>
          <p className="mt-1 text-xs text-ink/50">{formatShortDate(article.publishedAt)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm bg-mist">
        <Image
          src={article.coverImageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {article.isPremium && (
          <span className="absolute right-2 top-2 rounded bg-hot px-1.5 py-0.5 text-[10px] font-bold text-white">
            PREMIUM
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-2 min-h-[2.6em] text-[15px] font-bold leading-snug text-ink group-hover:text-electric">
        {article.title}
      </p>
      <p className="mt-1 text-xs text-ink/50">
        <span className="font-semibold text-electric">{article.category.name}</span>
        <span className="mx-1.5">·</span>
        {formatShortDate(article.publishedAt)}
      </p>
    </Link>
  );
}
