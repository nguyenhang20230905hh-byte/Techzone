import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-5xl font-black text-navy">404</h1>
      <p className="mt-3 text-ink/60">Không tìm thấy trang hoặc bài viết bạn đang tìm.</p>
      <Link href="/" className="mt-5 inline-block rounded-full bg-electric px-5 py-2 text-sm font-semibold text-white">
        Về trang chủ
      </Link>
    </div>
  );
}
