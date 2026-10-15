import type { Metadata } from "next";
import type React from "react";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import Header from "@/components/Header";
import TopUtilityBar from "@/components/TopUtilityBar";
import CategoryNav from "@/components/CategoryNav";
import Footer from "@/components/Footer";
import { TopAdBanner } from "@/components/AdBanner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Lora({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TECHZONE — Công nghệ trong tầm tay",
  description:
    "TECHZONE là tạp chí điện tử công nghệ dành cho người trẻ Việt Nam: AI, thiết bị số, kỹ năng số và các xu hướng công nghệ.",
};

async function getNavCategories() {
  const categories = await prisma.category
    .findMany({ orderBy: { order: "asc" } })
    .catch(() => []);
  return categories.map((c) => ({ slug: c.slug, name: c.name }));
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings, session] = await Promise.all([
    getNavCategories(),
    getSiteSettings(),
    getServerSession(authOptions),
  ]);
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <html lang="vi" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-white font-sans text-ink antialiased">
        <SessionProviderWrapper>
          <TopAdBanner banner={settings.topBanner} />
          <TopUtilityBar settings={settings} />
          <Header slogan={settings.slogan} isAdmin={isAdmin} />
          <CategoryNav categories={categories} />
          <main className="mx-auto max-w-shell px-4">{children}</main>
          <Footer categories={categories} settings={settings} />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
