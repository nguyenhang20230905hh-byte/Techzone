import Image from "next/image";
import Link from "next/link";
import type { TopBanner, InlineAd } from "@/lib/settings";

export function TopAdBanner({ banner }: { banner: TopBanner }) {
  return (
    <div className="w-full bg-navy-dark">
      <Link
        href={banner.linkUrl}
        className="relative mx-auto block h-[100px] max-w-shell overflow-hidden sm:h-[130px]"
      >
        <span className="absolute left-2 top-2 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">
          QUẢNG CÁO
        </span>
        <Image
          src={banner.imageUrl}
          alt={banner.title}
          fill
          priority
          // URL ảnh do admin tự nhập ở /admin — có thể thuộc tên miền bất kỳ. Không
          // tối ưu qua Next để tránh lỗi "hostname is not configured" làm sập cả layout.
          unoptimized
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="relative z-10 flex h-full flex-col items-start justify-center gap-1 px-5 text-white">
          <span className="text-base font-bold sm:text-xl">{banner.title}</span>
          <span className="text-xs sm:text-sm">{banner.subtitle}</span>
        </div>
      </Link>
    </div>
  );
}

export function InlineAdStrip({ ads }: { ads: InlineAd[] }) {
  if (!ads.length) return null;
  return (
    <div className="my-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ads.map((ad, i) => (
          <Link
            key={i}
            href={ad.linkUrl}
            className="group relative block h-24 overflow-hidden rounded-sm border border-line"
          >
            <span className="absolute left-1.5 top-1.5 z-10 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white">
              QUẢNG CÁO
            </span>
            <Image
              src={ad.imageUrl}
              alt={ad.message}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-2">
              <span className="text-xs font-medium text-white">{ad.message}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
