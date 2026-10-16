import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getArticleBySlug, getRelatedArticles } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { getReaderAccess } from "@/lib/premium";
import { formatVietnameseDate, parseArticleContent, truncateContent } from "@/lib/utils";
import ArticleCard from "@/components/ArticleCard";
import ViewTracker from "@/components/ViewTracker";
import AISummaryButton from "@/components/AISummaryButton";
import CommentSection from "@/components/CommentSection";
import DeleteArticleButton from "@/components/DeleteArticleButton";
import { MostReadModule, SideAdModule } from "@/components/SideModules";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "Không tìm thấy bài viết — TECHZONE" };
  return { title: `${article.title} — TECHZONE`, description: article.summary };
}

function ArticleBody({ content }: { content: string }) {
  const blocks = parseArticleContent(content);
  return (
    <div className="article-body">
      {blocks.map((b, i) => {
        if (b.type === "heading") return <h2 key={i}>{b.text}</h2>;
        if (b.type === "list")
          return (
            <ul key={i}>
              {b.items.map((it, j) => (
                <li key={j}>{it}</li>
              ))}
            </ul>
          );
        return <p key={i}>{b.text}</p>;
      })}
    </div>
  );
}

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const [article, session, settings] = await Promise.all([
    getArticleBySlug(params.slug),
    getServerSession(authOptions),
    getSiteSettings(),
  ]);

  if (!article) notFound();

  // Quyền đọc bài Premium: ADMIN hoặc tài khoản có gói Premium CÒN HẠN (đọc từ database).
  // Kiểm soát này thực hiện ở SERVER — người không đủ quyền không bao giờ nhận
  // được phần nội dung đầy đủ qua HTML, không phải chỉ ẩn bằng CSS/JS.
  const access = await getReaderAccess(session);
  const hasAccess = !article.isPremium || access.canReadPremium;
  const isAdmin = access.isAdmin;

  const [related, mostRead, comments] = await Promise.all([
    getRelatedArticles(article.categoryId, article.slug),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { viewCount: "desc" },
      take: 6,
      select: {
        slug: true,
        title: true,
        summary: true,
        coverImageUrl: true,
        isPremium: true,
        publishedAt: true,
        readingMinutes: true,
        viewCount: true,
        category: { select: { slug: true, name: true } },
        author: { select: { name: true } },
      },
    }),
    hasAccess
      ? prisma.comment.findMany({
          where: { articleId: article.id, isDeleted: false },
          orderBy: { createdAt: "desc" },
          include: { author: { select: { name: true } } },
        })
      : Promise.resolve([]),
  ]);

  const displayContent = hasAccess ? article.content : truncateContent(article.content, 110);

  return (
    <article className="py-6">
      <ViewTracker slug={article.slug} />

      <nav className="mb-3 text-sm text-ink/50">
        <Link href="/" className="hover:text-electric">
          Trang chủ
        </Link>
        <span className="mx-1.5">›</span>
        <Link href={`/category/${article.category.slug}`} className="hover:text-electric">
          {article.category.name}
        </Link>
      </nav>

      {isAdmin && (
        <div className="mb-4 flex items-center gap-2 rounded border border-line bg-mist px-3 py-2 text-sm">
          <span className="mr-auto font-semibold text-ink/60">Quản trị viên</span>
          <Link
            href={`/dang-bai/${article.slug}/sua`}
            className="rounded border border-line bg-white px-3 py-1 text-xs font-semibold hover:border-electric hover:text-electric"
          >
            Sửa bài
          </Link>
          <DeleteArticleButton slug={article.slug} title={article.title} redirectTo="/" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <span className="inline-block rounded bg-electric px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            {article.category.name}
          </span>
          {article.isPremium && (
            <span className="ml-2 inline-block rounded bg-hot px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
              Premium
            </span>
          )}

          <h1 className="mt-3 text-2xl font-extrabold leading-tight text-navy sm:text-[32px]">
            {article.title}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-ink/70">{article.summary}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/50">
            <span className="font-semibold text-ink">{article.author.name}</span>
            <span>·</span>
            <span>Đăng {formatVietnameseDate(article.publishedAt)}</span>
            {article.updatedAt > article.publishedAt && (
              <>
                <span>·</span>
                <span>Cập nhật {formatVietnameseDate(article.updatedAt)}</span>
              </>
            )}
            <span>·</span>
            <span>{article.readingMinutes} phút đọc</span>
            <span>·</span>
            <span>{article.viewCount.toLocaleString("vi-VN")} lượt xem</span>
          </div>

          <div className="relative mt-5 aspect-[16/9] w-full overflow-hidden rounded-sm bg-mist">
            <img src={article.coverImageUrl} alt={article.coverImageAlt || article.title} className="h-full w-full object-cover" />
          </div>
          {article.coverImageCredit && (
            <p className="mt-1.5 text-right text-xs italic text-ink/40">{article.coverImageCredit}</p>
          )}

          <div className="mx-auto mt-6 max-w-[760px]">
            <ArticleBody content={displayContent} />

            {!hasAccess && (
              <div className="rounded-md border border-hot/30 bg-hot/5 p-5 text-center">
                <p className="font-bold text-navy">Đây là bài viết Premium</p>
                <p className="mt-1 text-sm text-ink/60">
                  {access.isLoggedIn
                    ? access.premiumUntil
                      ? "Gói Premium của bạn đã hết hạn. Gia hạn để đọc toàn bộ bài viết này và mọi bài Premium khác."
                      : "Đăng ký gói Premium để đọc toàn bộ bài viết này và mọi bài Premium khác."
                    : "Đăng nhập và đăng ký gói Premium để đọc toàn bộ bài viết này và mọi bài Premium khác."}
                </p>
                <div className="mt-3 flex justify-center gap-3">
                  <Link href="/premium" className="rounded-full bg-electric px-5 py-2 text-sm font-semibold text-white">
                    {access.premiumUntil ? "Gia hạn Premium" : "Xem gói Premium"}
                  </Link>
                  {!access.isLoggedIn && (
                    <Link
                      href={`/dang-nhap?callbackUrl=/bai-viet/${article.slug}`}
                      className="rounded-full border border-electric px-5 py-2 text-sm font-semibold text-electric"
                    >
                      Đăng nhập
                    </Link>
                  )}
                </div>
              </div>
            )}

            {hasAccess && (
              <>
                {article.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {article.tags.map(({ tag }) => (
                      <Link
                        key={tag.id}
                        href={`/tim-kiem?q=${encodeURIComponent(tag.name)}`}
                        className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-ink/60 hover:bg-electric/10 hover:text-electric"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                )}

                <ShareRow title={article.title} />

                <AISummaryButton slug={article.slug} />

                <CommentSection
                  slug={article.slug}
                  initialComments={comments.map((c) => ({
                    id: c.id,
                    content: c.content,
                    createdAt: c.createdAt.toISOString(),
                    author: c.author,
                  }))}
                />
              </>
            )}
          </div>

          {related.length > 0 && (
            <section className="mt-10 border-t border-line pt-6">
              <h3 className="mb-4 text-lg font-bold text-navy">Bài viết liên quan</h3>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {related.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <MostReadModule articles={mostRead} />
          {settings.inlineAds[1] && <SideAdModule ad={settings.inlineAds[1]} />}
        </aside>
      </div>
    </article>
  );
}

function ShareRow({ title }: { title: string }) {
  return (
    <div className="mt-6 flex items-center gap-2 border-y border-line py-3 text-sm">
      <span className="font-semibold text-ink/60">Chia sẻ:</span>
      <a
        className="rounded border border-line px-3 py-1 hover:border-electric hover:text-electric"
        href={`https://www.facebook.com/sharer/sharer.php?u=&t=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noreferrer"
      >
        Facebook
      </a>
      <a
        className="rounded border border-line px-3 py-1 hover:border-electric hover:text-electric"
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noreferrer"
      >
        X (Twitter)
      </a>
    </div>
  );
}
