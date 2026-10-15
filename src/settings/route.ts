import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteSettings, updateSiteSetting, type SiteSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

const EDITABLE_KEYS: (keyof SiteSettings)[] = [
  "siteName",
  "slogan",
  "topBanner",
  "inlineAds",
  "contactEmail",
  "socialLinks",
];

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Chỉ quản trị viên được đổi cấu hình." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const updates = Object.entries(body).filter(([key]) =>
    EDITABLE_KEYS.includes(key as keyof SiteSettings)
  );
  if (updates.length === 0) {
    return NextResponse.json({ error: "Không có trường nào hợp lệ để cập nhật." }, { status: 400 });
  }

  for (const [key, value] of updates) {
    await updateSiteSetting(key as keyof SiteSettings, value as any);
  }

  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}
