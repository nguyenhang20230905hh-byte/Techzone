export type ArticleCardData = {
  slug: string;
  title: string;
  summary: string;
  coverImageUrl: string;
  isPremium: boolean;
  publishedAt: Date;
  readingMinutes: number;
  viewCount: number;
  category: { slug: string; name: string };
  author: { name: string };
  authorName: string | null;
};
