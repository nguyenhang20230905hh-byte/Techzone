import Image from "next/image";
import Link from "next/link";
import { formatShortDate } from "@/lib/utils";
import type { ArticleCardData } from "@/lib/types";

export default function FeaturedHero({
  main,
  secondary,
}: {
  main: ArticleCardData;
  secondary: ArticleCardData[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Vùng 1 — tin nổi bật chính */}
      <Link href={`/bai-viet/${main.slug}`} className="group lg:col-span-3">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm bg-mist">
          <Image
            src={main.coverImageUrl}
            alt={main.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded bg-electric px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            {main.category.name}
          </span>
        </div>
        <h1 className="mt-3 text-[22px] font-extrabold leading-tight text-navy group-hover:text-electric sm:text-[26px]">
          {main.title}
        </h1>
        <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-ink/70">{main.summary}</p>
        <p className="mt-2 text-xs text-ink/50">
          {main.author.name} · {formatShortDate(main.publishedAt)} · {main.readingMinutes} phút đọc
        </p>
      </Link>

      {/* Vùng 2 — tin nổi bật phụ */}
      <div className="flex flex-col divide-y divide-line lg:col-span-2">
        {secondary.map((a) => (
          <Link key={a.slug} href={`/bai-viet/${a.slug}`} className="group flex gap-3 py-3 first:pt-0">
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-sm bg-mist">
              <Image src={a.coverImageUrl} alt={a.title} fill sizes="112px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-electric">
                {a.category.name}
              </p>
              <p className="line-clamp-2 text-sm font-bold leading-snug text-ink group-hover:text-electric">
                {a.title}
              </p>
              <p className="mt-1 text-xs text-ink/45">{formatShortDate(a.publishedAt)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
