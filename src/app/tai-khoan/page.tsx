import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatShortDate } from "@/lib/utils";
import AccountForm from "@/components/AccountForm";
import DeleteArticleButton from "@/components/DeleteArticleButton";

export const metadata = { title: "Tài khoản — TECHZONE" };
export const revalidate = 0;

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/dang-nhap?callbackUrl=/tai-khoan");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { name: true, email: true, role: true, bio: true, createdAt: true },
  });
  if (!user) redirect("/dang-nhap");

  const myArticles = await prisma.article.findMany({
    where: { authorId: (session.user as any).id },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, title: true, status: true, viewCount: true, publishedAt: true, isPremium: true },
  });

  return (
    <div className="py-10">
      <h1 className="text-2xl font-extrabold text-navy">Tài khoản của tôi</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-sm border border-line p-5 lg:col-span-1">
          <p className="text-sm text-ink/50">Email</p>
          <p className="font-medium text-ink">{user.email}</p>
          <p className="mt-3 text-sm text-ink/50">Vai trò</p>
          <p className="font-medium text-ink">{user.role === "ADMIN" ? "Quản trị viên" : "Thành viên"}</p>
          <p className="mt-3 text-sm text-ink/50">Tham gia từ</p>
          <p className="font-medium text-ink">{formatShortDate(user.createdAt)}</p>

          <div className="mt-6 border-t border-line pt-5">
            <AccountForm initialName={user.name} initialBio={user.bio || ""} />
          </div>
        </div>

        {user.role === "ADMIN" && (
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy">Bài viết của tôi ({myArticles.length})</h2>
              <Link href="/dang-bai" className="rounded-full bg-electric px-4 py-1.5 text-sm font-semibold text-white">
                + Đăng bài mới
              </Link>
            </div>

            {myArticles.length === 0 ? (
              <p className="rounded border border-line bg-mist px-4 py-8 text-center text-sm text-ink/50">
                Bạn chưa đăng bài nào.
              </p>
            ) : (
              <ul className="divide-y divide-line rounded-sm border border-line">
                {myArticles.map((a) => (
                  <li key={a.slug} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <Link href={`/bai-viet/${a.slug}`} className="truncate font-semibold text-ink hover:text-electric">
                        {a.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-ink/45">
                        {formatShortDate(a.publishedAt)} · {a.viewCount.toLocaleString("vi-VN")} lượt xem
                        {a.isPremium ? " · Premium" : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/dang-bai/${a.slug}/sua`}
                        className="rounded border border-line px-3 py-1 text-xs font-semibold hover:border-electric hover:text-electric"
                      >
                        Sửa
                      </Link>
                      <DeleteArticleButton slug={a.slug} title={a.title} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
