import Link from "next/link";
import Logo from "@/components/Logo";
import NewsletterForm from "@/components/NewsletterForm";
import type { NavCategory } from "@/components/CategoryNav";
import type { SiteSettings } from "@/lib/settings";

export default function Footer({
  categories,
  settings,
}: {
  categories: NavCategory[];
  settings: SiteSettings;
}) {
  return (
    <footer className="mt-12 bg-navy-dark text-white">
      <div className="mx-auto grid max-w-shell grid-cols-1 gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="[&_span]:text-white [&_span.text-electric]:text-electric-light">
            <Logo size="md" />
          </div>
          <p className="mt-3 text-sm text-white/60">{settings.slogan}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">
            TECHZONE là tạp chí điện tử về công nghệ dành cho học sinh, sinh viên và người trẻ
            Việt Nam — cập nhật AI, thiết bị số, kỹ năng số và các xu hướng đang định hình cách
            chúng ta học tập, làm việc và sống.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="mb-3 font-semibold text-white/90">Chuyên mục</h4>
            <ul className="space-y-2 text-white/55">
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white/90">Thông tin</h4>
            <ul className="space-y-2 text-white/55">
              <li>
                <Link href="/ve-chung-toi" className="hover:text-white">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-white">
                  Liên hệ
                </a>
              </li>
              <li>
                <Link href="/ve-chung-toi#chinh-sach" className="hover:text-white">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/ve-chung-toi#dieu-khoan" className="hover:text-white">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-white/90">Nhận bản tin TECHZONE</h4>
          <p className="mb-3 text-sm text-white/55">
            Tin công nghệ chọn lọc, gửi thẳng vào email mỗi tuần.
          </p>
          <NewsletterForm dark />
          <div className="mt-5 flex gap-3 text-sm text-white/55">
            {settings.socialLinks.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="hover:text-white">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {settings.siteName}. Nội dung thuộc tạp chí {settings.siteName}.
      </div>
    </footer>
  );
}
