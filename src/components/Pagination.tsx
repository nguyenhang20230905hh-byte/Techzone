import Link from "next/link";

export default function Pagination({
  basePath,
  page,
  totalPages,
  searchParams,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== "page") params.set(k, v);
    });
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={`rounded border border-line px-3 py-1.5 text-sm ${
          page <= 1 ? "pointer-events-none opacity-40" : "hover:border-electric hover:text-electric"
        }`}
      >
        ← Trước
      </Link>
      <span className="px-2 text-sm text-ink/60">
        Trang {page}/{totalPages}
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={`rounded border border-line px-3 py-1.5 text-sm ${
          page >= totalPages
            ? "pointer-events-none opacity-40"
            : "hover:border-electric hover:text-electric"
        }`}
      >
        Xem thêm →
      </Link>
    </div>
  );
}
