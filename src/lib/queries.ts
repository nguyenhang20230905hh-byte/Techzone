import { prisma } from "@/lib/prisma";
import type { ArticleCardData } from "@/lib/types";
import { ARTICLE_AUTHORS } from "@/lib/constants";

export const CARD_SELECT = {
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
  authorName: true,
} as const;

export const HOME_CATEGORY_ORDER = [
  "ai-cong-nghe",
  "thiet-bi-so",
  "ky-nang-so",
  "xu-huong-so",
  "doi-song-so",
];

const EMPTY_HOME_FEED = {
  main: undefined as ArticleCardData | undefined,
  secondary: [] as ArticleCardData[],
  gridFeed: [] as ArticleCardData[],
  latest: [] as ArticleCardData[],
  mostRead: [] as ArticleCardData[],
  categoryBlocks: [] as {
    slug: string;
    name: string;
    featured: ArticleCardData;
    rest: ArticleCardData[];
  }[],
};

export async function getHomeFeed() {
  try {
    const [featuredPick, allRecent, mostRead] = await Promise.all([
      prisma.article.findFirst({
        where: { status: "PUBLISHED", isFeatured: true },
        orderBy: { publishedAt: "desc" },
        select: CARD_SELECT,
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 24,
        select: CARD_SELECT,
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { viewCount: "desc" },
        take: 5,
        select: CARD_SELECT,
      }),
    ]);

    const main: ArticleCardData | undefined = featuredPick ?? allRecent[0];
    const rest = allRecent.filter((a) => a.slug !== main?.slug);

    const secondary = rest.slice(0, 3);
    const gridFeed = rest.slice(3, 11);
    const latest = allRecent.slice(0, 8);

    const categoryBlocks = await Promise.all(
      HOME_CATEGORY_ORDER.map(async (slug) => {
        const category = await prisma.category.findUnique({ where: { slug } });
        if (!category) return null;
        const articles = await prisma.article.findMany({
          where: { status: "PUBLISHED", categoryId: category.id },
          orderBy: { publishedAt: "desc" },
          take: 4,
          select: CARD_SELECT,
        });
        if (articles.length === 0) return null;
        return {
          slug: category.slug,
          name: category.name,
          featured: articles[0],
          rest: articles.slice(1, 4),
        };
      })
    );

    return {
      main,
      secondary,
      gridFeed,
      latest,
      mostRead,
      categoryBlocks: categoryBlocks.filter(Boolean) as {
        slug: string;
        name: string;
        featured: ArticleCardData;
        rest: ArticleCardData[];
      }[],
    };
  } catch (err) {
    // DB chưa migrate/seed hoặc tạm mất kết nối — không để trang chủ vỡ (500),
    // thay vào đó hiện trạng thái "chưa có bài viết nào".
    console.error("[queries.getHomeFeed]", err);
    return EMPTY_HOME_FEED;
  }
}

export type CategoryPageFilters = {
  sort?: "newest" | "oldest";
  author?: string;
  from?: string;
  to?: string;
  page?: number;
};

const PAGE_SIZE = 9;

// ?page=abc hoặc ?from=xyz trên URL từng làm Prisma nhận NaN/Invalid Date -> lỗi 500.
function safePage(p: number | undefined): number {
  return p && Number.isFinite(p) ? Math.max(1, Math.floor(p)) : 1;
}
function safeDate(s: string): Date | null {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function getCategoryPage(slug: string, filters: CategoryPageFilters) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return null;

  const page = safePage(filters.page);
  const where: any = { status: "PUBLISHED", categoryId: category.id };

  // Lọc theo "tác giả đăng" (bút danh chọn lúc đăng bài, xem lib/constants.ts)
  // — bài cũ chưa có authorName thì vẫn khớp được bằng tên tài khoản đăng.
  if (filters.author) {
    where.OR = [
      { authorName: filters.author },
      { authorName: null, author: { name: { contains: filters.author, mode: "insensitive" } } },
    ];
  }
  // Ngày lọc tính theo giờ Việt Nam (+07:00), không theo giờ UTC của server Vercel.
  const from = filters.from ? safeDate(`${filters.from}T00:00:00+07:00`) : null;
  const to = filters.to ? safeDate(`${filters.to}T23:59:59.999+07:00`) : null;
  if (from || to) {
    where.publishedAt = {};
    if (from) where.publishedAt.gte = from;
    if (to) where.publishedAt.lte = to;
  }

  const [total, pageArticles] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: filters.sort === "oldest" ? "asc" : "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: CARD_SELECT,
    }),
  ]);

  // Trang 1: bài đầu tiên của danh sách (mới nhất theo bộ lọc hiện tại) được
  // tách ra làm khối "bài nổi bật", phần còn lại xuống danh sách bên dưới.
  const featured = page === 1 ? pageArticles[0] ?? null : null;
  const articles = page === 1 ? pageArticles.slice(1) : pageArticles;

  return {
    category,
    featured,
    articles,
    total,
    page,
    pageSize: PAGE_SIZE,
    // Danh sách tác giả cố định (xem lib/constants.ts) để lọc — không dò DB.
    authors: ARTICLE_AUTHORS as unknown as string[],
  };
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: { select: { slug: true, name: true } },
      author: { select: { name: true, bio: true, avatarUrl: true } },
      tags: { include: { tag: true } },
    },
  });
}

export async function getRelatedArticles(categoryId: string, excludeSlug: string) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", categoryId, slug: { not: excludeSlug } },
    orderBy: { publishedAt: "desc" },
    take: 4,
    select: CARD_SELECT,
  });
}

export async function searchArticles(query: string, filters: CategoryPageFilters) {
  const page = safePage(filters.page);
  const where: any = {
    status: "PUBLISHED",
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { summary: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
    ],
  };
  if (filters.author) {
    where.AND = [
      {
        OR: [
          { authorName: filters.author },
          { authorName: null, author: { name: { contains: filters.author, mode: "insensitive" } } },
        ],
      },
    ];
  }

  const [total, articles] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: filters.sort === "oldest" ? "asc" : "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: CARD_SELECT,
    }),
  ]);

  return { total, articles, page, pageSize: PAGE_SIZE };
}
