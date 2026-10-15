import Image from "next/image";
import Link from "next/link";
import { formatShortDate } from "@/lib/utils";
import type { ArticleCardData } from "@/lib/types";
import type { InlineAd } from "@/lib/settings";
import NewsletterForm from "@/components/NewsletterForm";

export function MostReadModule({ articles }: { articles: ArticleCardData[] }) {
  return (
    <div className="rounded-sm border border-line">
      <div className="border-b border-line px-4 py-3 text-sm font-bold text-navy">Đọc nhiều</div>
      <ol className="divide-y divide-line">
        {articles.map((a, i) => (
          <li key={a.slug}>
            <Link href={`/bai-viet/${a.slug}`} className="group flex gap-3 px-4 py-3">
              <span className="w-5 text-lg font-black text-line group-hover:text-electric/40">{i + 1}</span>
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink group-hover:text-electric">
                {a.title}
              </p>
            </Link>
          </li>
        ))}
        {articles.length === 0 && <li className="px-4 py-5 text-center text-sm text-ink/40">Chưa có dữ liệu.</li>}
      </ol>
    </div>
  );
}

export function SideAdModule({ ad }: { ad: InlineAd }) {
  return (
    <Link href={ad.linkUrl} className="group relative block h-40 overflow-hidden rounded-sm border border-line">
      <span className="absolute left-2 top-2 z-10 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold text-white">
        QUẢNG CÁO
      </span>
      <Image src={ad.imageUrl} alt={ad.message} fill sizes="320px" className="object-cover transition group-hover:scale-105" />
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-3">
        <span className="text-sm font-medium text-white">{ad.message}</span>
      </div>
    </Link>
  );
}

export function AboutModule() {
  return (
    <div className="rounded-sm border border-line p-4">
      <h4 className="font-bold text-navy">Về TECHZONE</h4>
      <p className="mt-2 text-sm leading-relaxed text-ink/60">
        Tạp chí điện tử công nghệ dành cho người trẻ Việt Nam — nơi AI, thiết bị số và kỹ năng số
        được kể bằng ngôn ngữ dễ hiểu, gần gũi.
      </p>
      <Link href="/ve-chung-toi" className="mt-3 inline-block text-sm font-semibold text-electric hover:underline">
        Tìm hiểu thêm →
      </Link>
    </div>
  );
}

export function NewsletterModule() {
  return (
    <div className="rounded-sm border border-line bg-mist p-4">
      <h4 className="font-bold text-navy">Bản tin TECHZONE</h4>
      <p className="mt-1 mb-3 text-sm text-ink/60">Tin công nghệ chọn lọc mỗi tuần.</p>
      <NewsletterForm />
    </div>
  );
}

export function WeekFeaturedModule({ article }: { article: ArticleCardData | null }) {
  if (!article) return null;
  return (
    <div className="rounded-sm border border-line p-4">
      <h4 className="mb-3 font-bold text-navy">Nổi bật trong tuần</h4>
      <Link href={`/bai-viet/${article.slug}`} className="group block">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-mist">
          <Image src={article.coverImageUrl} alt={article.title} fill sizes="320px" className="object-cover" />
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-bold text-ink group-hover:text-electric">{article.title}</p>
        <p className="mt-1 text-xs text-ink/45">{formatShortDate(article.publishedAt)}</p>
      </Link>
    </div>
  );
}
