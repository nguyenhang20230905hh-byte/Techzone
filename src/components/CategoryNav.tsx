"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SearchBox from "@/components/SearchBox";

export type NavCategory = { slug: string; name: string };

export default function CategoryNav({ categories }: { categories: NavCategory[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [{ slug: "", name: "Trang chủ" }, ...categories];

  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex max-w-shell items-center gap-4 px-4">
        <button
          className="flex items-center py-3 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Mở menu chuyên mục"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="#0b1e3d"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <ul className="hidden items-center gap-1 overflow-x-auto md:flex">
          {links.map((c) => {
            const href = c.slug ? `/category/${c.slug}` : "/";
            const isActive = c.slug ? pathname?.startsWith(`/category/${c.slug}`) : pathname === "/";
            return (
              <li key={c.slug || "home"}>
                <Link
                  href={href}
                  className={`block whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "border-electric text-electric"
                      : "border-transparent text-ink/80 hover:border-electric/40 hover:text-electric"
                  }`}
                >
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-1 items-center justify-end gap-3 py-2 md:py-0">
          <SearchBox />
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-white px-4 py-2 md:hidden">
          <ul className="flex flex-col">
            {links.map((c) => {
              const href = c.slug ? `/category/${c.slug}` : "/";
              return (
                <li key={c.slug || "home-m"}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-line py-2.5 text-sm font-medium text-ink/85"
                  >
                    {c.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
