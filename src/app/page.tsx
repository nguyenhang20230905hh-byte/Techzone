import FeaturedHero from "@/components/FeaturedHero";
import SidebarTabs from "@/components/SidebarTabs";
import ArticleCard from "@/components/ArticleCard";
import CategoryBlock from "@/components/CategoryBlock";
import { InlineAdStrip } from "@/components/AdBanner";
import NewsletterForm from "@/components/NewsletterForm";
import { getHomeFeed } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 0;

export default async function HomePage() {
  const [feed, settings] = await Promise.all([getHomeFeed(), getSiteSettings()]);

  if (!feed.main) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-xl font-bold text-navy">Chưa có bài viết nào</h1>
        <p className="mt-2 text-sm text-ink/60">
          Hãy là người đầu tiên đăng bài cho TECHZONE — bấm "Đăng bài" ở góc trên.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Khu vực E */}
      <section className="grid grid-cols-1 gap-8 py-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FeaturedHero main={feed.main} secondary={feed.secondary} />
        </div>
        <SidebarTabs latest={feed.latest} mostRead={feed.mostRead} />
      </section>

      {/* Khu vực F */}
      {feed.gridFeed.length > 0 && (
        <section className="border-t border-line py-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            {feed.gridFeed.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      {/* Khu vực G */}
      <InlineAdStrip ads={settings.inlineAds} />

      {/* Khu vực H */}
      <div className="divide-y divide-line">
        {feed.categoryBlocks.map((block) => (
          <CategoryBlock
            key={block.slug}
            categoryName={block.name}
            categorySlug={block.slug}
            featured={block.featured}
            rest={block.rest}
          />
        ))}
      </div>

      {/* Hộp đăng ký bản tin cuối trang chủ */}
      <section className="my-10 rounded-md border border-line bg-mist p-6 text-center">
        <h3 className="text-lg font-bold text-navy">Đăng ký nhận bản tin TECHZONE</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink/60">
          Tin công nghệ chọn lọc dành cho người trẻ, gửi thẳng vào email mỗi tuần.
        </p>
        <div className="mx-auto mt-4 max-w-sm">
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
