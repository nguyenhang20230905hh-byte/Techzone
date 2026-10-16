import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { formatShortDate } from "@/lib/utils";
import CategoryManager from "@/components/admin/CategoryManager";
import SettingsManager from "@/components/admin/SettingsManager";
import FeaturedManager from "@/components/admin/FeaturedManager";
import UserExportPanel from "@/components/admin/UserExportPanel";
import PremiumManager from "@/components/admin/PremiumManager";

export const metadata = { title: "Quản trị — TECHZONE" };
export const revalidate = 0;

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/dang-nhap?callbackUrl=/admin");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  const [categories, settings, articles, premiumUsers, recentOrders, orderStats] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    getSiteSettings(),
    prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      take: 50,
      select: { slug: true, title: true, isFeatured: true, isPremium: true },
    }),
    prisma.user.findMany({
      where: { premiumUntil: { not: null } },
      orderBy: { premiumUntil: "desc" },
      take: 100,
      select: { name: true, email: true, premiumUntil: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        planName: true,
        amount: true,
        simulated: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.order.aggregate({
      where: { amount: { gt: 0 } },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const nowMs = Date.now();

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
        <h2 className="mb-3 text-lg font-bold text-navy">Quản lý bài viết (nổi bật · Premium · sửa · xoá)</h2>
        <FeaturedManager initial={articles} />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-bold text-navy">Gói Premium & doanh thu (mô phỏng)</h2>
        <PremiumManager
          stats={{
            activeCount: premiumUsers.filter((u) => u.premiumUntil && u.premiumUntil.getTime() > nowMs).length,
            paidOrders: orderStats._count,
            revenue: orderStats._sum.amount ?? 0,
          }}
          users={premiumUsers.map((u) => ({
            name: u.name,
            email: u.email,
            until: u.premiumUntil ? formatShortDate(u.premiumUntil) : "",
            active: Boolean(u.premiumUntil && u.premiumUntil.getTime() > nowMs),
          }))}
          orders={recentOrders.map((o) => ({
            id: o.id,
            planName: o.planName,
            amount: o.amount,
            simulated: o.simulated,
            date: formatShortDate(o.createdAt),
            userName: o.user.name,
            userEmail: o.user.email,
          }))}
        />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-bold text-navy">Danh sách người dùng</h2>
        <UserExportPanel />
      </section>
    </div>
  );
}
