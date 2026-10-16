import Link from "next/link";
import Logo from "@/components/Logo";

export default function Header({ slogan, isAdmin }: { slogan: string; isAdmin?: boolean }) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto grid max-w-shell grid-cols-3 items-center px-4 py-4">
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Link
                href="/dang-bai"
                className="hidden rounded-full border border-electric px-4 py-1.5 text-sm font-semibold text-electric transition hover:bg-electric hover:text-white sm:inline-block"
              >
                Đăng bài
              </Link>
              <a
                href="/api/admin/export-users"
                className="hidden rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-ink/70 transition hover:border-electric hover:text-electric sm:inline-block"
              >
                Xuất Excel
              </a>
            </>
          )}
        </div>

        <div className="flex flex-col items-center">
          <Logo size="lg" />
          <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-ink/50">
            {slogan}
          </span>
        </div>

        <div className="flex items-center justify-end gap-3">
          {isAdmin && (
            <>
              <Link
                href="/dang-bai"
                className="rounded-full border border-electric px-3 py-1.5 text-xs font-semibold text-electric sm:hidden"
              >
                Đăng bài
              </Link>
              <a
                href="/api/admin/export-users"
                className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink/70 sm:hidden"
              >
                Excel
              </a>
            </>
          )}
          <Link
            href="/premium"
            className="rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-light sm:px-4 sm:text-sm"
          >
            Premium
          </Link>
        </div>
      </div>
    </header>
  );
}
