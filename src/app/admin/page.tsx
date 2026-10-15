import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import CategoryManager from "@/components/admin/CategoryManager";
import SettingsManager from "@/components/admin/SettingsManager";
import FeaturedManager from "@/components/admin/FeaturedManager";
import UserExportPanel from "@/components/admin/UserExportPanel";

export const metadata = { title: "Quản trị — TECHZONE" };
export const revalidate = 0;

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/dang-nhap?callbackUrl=/admin");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  const [categories, settings, articles] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    getSiteSettings(),
    prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      take: 50,
      select: { slug: true, title: true, isFeatured: true, isPremium: true },
    }),
  ]);

  return (
    <div className="py-10">
      <h1 className="text-2xl font-extrabold text-navy">Trang quản trị</h1>
      <p className="mt-1 text-sm text-ink/60">
        Mọi chức năng của TECHZONE đều tự điều chỉnh được ở đây — không cần sửa code.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-bold text-navy">Chuyên mục</h2>
          <CategoryManager
            initial={categories.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              showOnHome: c.showOnHome,
            }))}
          />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-navy">Cấu hình trang & banner quảng cáo</h2>
          <SettingsManager initial={settings} />
        </section>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-bold text-navy">Bài viết nổi bật / Premium</h2>
        <FeaturedManager initial={articles} />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-bold text-navy">Danh sách người dùng</h2>
        <UserExportPanel />
      </section>
    </div>
  );
}
