import Link from "next/link";

/**
 * Logo TECHZONE tự thiết kế bằng SVG thuần — không dùng lại bất kỳ logo báo điện tử nào.
 * Biểu tượng: 4 ô pixel xếp lệch mô phỏng chip vi xử lý / khối dữ liệu số.
 */
export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = { sm: 28, md: 34, lg: 42 }[size];
  const text = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" }[size];

  return (
    <Link href="/" className="inline-flex items-center gap-2 select-none">
      <svg width={dims} height={dims} viewBox="0 0 48 48" fill="none" aria-hidden>
        <rect x="4" y="4" width="18" height="18" rx="4" fill="#2a7de1" />
        <rect x="26" y="4" width="18" height="18" rx="4" fill="#0b1e3d" />
        <rect x="4" y="26" width="18" height="18" rx="4" fill="#0b1e3d" />
        <rect x="26" y="26" width="18" height="18" rx="4" fill="#2a7de1" />
        <circle cx="24" cy="24" r="5.5" fill="#ffffff" stroke="#0b1e3d" strokeWidth="2" />
      </svg>
      <span className={`${text} font-black tracking-tight text-navy`}>
        TECH<span className="text-electric">ZONE</span>
      </span>
    </Link>
  );
}
