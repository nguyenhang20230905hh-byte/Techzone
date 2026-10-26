import { prisma } from "@/lib/prisma";

export type TopBanner = {
  imageUrl: string;
  title: string;
  subtitle: string;
  linkUrl: string;
};

export type InlineAd = {
  imageUrl: string;
  message: string;
  linkUrl: string;
};

export type SiteSettings = {
  siteName: string;
  slogan: string;
  topBanner: TopBanner;
  inlineAds: InlineAd[];
  contactEmail: string;
  socialLinks: { label: string; url: string }[];
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "TECHZONE",
  slogan: "Công nghệ trong tầm tay",
  topBanner: {
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=60&auto=format&fit=crop",
    title: "TECHZONE EXPO 2026",
    subtitle: "Sự kiện công nghệ dành cho người trẻ — đăng ký tham dự miễn phí",
    linkUrl: "/ve-chung-toi",
  },
  inlineAds: [
    {
      imageUrl:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=60&auto=format&fit=crop",
      message: "Laptop mỏng nhẹ cho sinh viên — ưu đãi học kỳ mới",
      linkUrl: "/category/thiet-bi-so",
    },
    {
      imageUrl:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=60&auto=format&fit=crop",
      message: "Khoá học kỹ năng số miễn phí cho sinh viên năm nhất",
      linkUrl: "/category/ky-nang-so",
    },
    {
      imageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=60&auto=format&fit=crop",
      message: "TECHZONE Premium — đọc không giới hạn mọi bài cao cấp",
      linkUrl: "/dang-ky",
    },
  ],
  contactEmail: "lienhe@techzone.vn",
  socialLinks: [
    { label: "Facebook", url: "https://facebook.com" },
    { label: "YouTube", url: "https://youtube.com" },
    { label: "TikTok", url: "https://tiktok.com" },
  ],
};

const str = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);

/**
 * Chuẩn hoá cấu hình đọc từ DB: thiếu trường / sai kiểu (vd. dữ liệu lưu từ bản
 * code cũ) thì lấy giá trị mặc định. Trước đây 1 trường linkUrl bị thiếu là đủ
 * làm <Link href={undefined}> ném lỗi và sập TẤT CẢ các trang (banner nằm trong layout).
 */
function normalizeSettings(raw: Record<string, unknown>): SiteSettings {
  const d = DEFAULT_SETTINGS;
  const tb = (raw.topBanner && typeof raw.topBanner === "object" ? raw.topBanner : {}) as Record<string, unknown>;
  const ads = Array.isArray(raw.inlineAds) ? raw.inlineAds : d.inlineAds;
  const links = Array.isArray(raw.socialLinks) ? raw.socialLinks : d.socialLinks;
  return {
    siteName: str(raw.siteName, d.siteName),
    slogan: str(raw.slogan, d.slogan),
    contactEmail: str(raw.contactEmail, d.contactEmail),
    topBanner: {
      imageUrl: str(tb.imageUrl, d.topBanner.imageUrl) || d.topBanner.imageUrl,
      title: str(tb.title, d.topBanner.title),
      subtitle: str(tb.subtitle, d.topBanner.subtitle),
      linkUrl: str(tb.linkUrl, d.topBanner.linkUrl) || "/",
    },
    inlineAds: ads
      .filter((a): a is Record<string, unknown> => Boolean(a) && typeof a === "object")
      .map((a, i) => ({
        imageUrl: str(a.imageUrl, d.inlineAds[i]?.imageUrl ?? d.inlineAds[0].imageUrl) || d.inlineAds[0].imageUrl,
        message: str(a.message, ""),
        linkUrl: str(a.linkUrl, "/") || "/",
      })),
    socialLinks: links
      .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
      .map((s) => ({ label: str(s.label, ""), url: str(s.url, "#") || "#" })),
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    if (rows.length === 0) return DEFAULT_SETTINGS;
    const map: Record<string, unknown> = {};
    for (const r of rows) {
      try {
        map[r.key] = JSON.parse(r.value);
      } catch {
        // 1 dòng cấu hình hỏng không được kéo theo cả site
      }
    }
    return normalizeSettings(map);
  } catch (err) {
    // DB chưa migrate/seed lần đầu — vẫn trả về mặc định để trang chủ không vỡ layout.
    console.error("[settings.getSiteSettings]", err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSiteSetting<K extends keyof SiteSettings>(
  key: K,
  value: SiteSettings[K]
) {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  });
}
