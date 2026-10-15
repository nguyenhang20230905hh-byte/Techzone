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

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    if (rows.length === 0) return DEFAULT_SETTINGS;
    const map = Object.fromEntries(rows.map((r) => [r.key, JSON.parse(r.value)]));
    return { ...DEFAULT_SETTINGS, ...map };
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
