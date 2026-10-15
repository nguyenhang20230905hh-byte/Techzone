"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { formatVietnameseDate } from "@/lib/utils";
import type { SiteSettings } from "@/lib/settings";

export default function TopUtilityBar({ settings }: { settings: SiteSettings }) {
  const [now, setNow] = useState<Date | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden border-b border-line bg-white text-[13px] text-ink/70 sm:block">
      <div className="mx-auto flex max-w-shell items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <span suppressHydrationWarning>{now ? formatVietnameseDate(now) : ""}</span>
          <Link href="/tim-kiem?sort=newest" className="font-medium text-electric hover:underline">
            Tin mới
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <a href={`mailto:${settings.contactEmail}`} className="hover:text-electric">
            Liên hệ
          </a>
          <Link href="/ve-chung-toi" className="hover:text-electric">
            Về chúng tôi
          </Link>
          <span className="hidden items-center gap-2 md:flex">
            {settings.socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-electric"
              >
                {s.label}
              </a>
            ))}
          </span>
          {status === "authenticated" ? (
            <span className="flex items-center gap-3">
              <Link href="/tai-khoan" className="font-medium hover:text-electric">
                {session.user?.name}
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="hover:text-electric">
                Đăng xuất
              </button>
            </span>
          ) : (
            <Link href="/dang-nhap" className="font-medium hover:text-electric">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
