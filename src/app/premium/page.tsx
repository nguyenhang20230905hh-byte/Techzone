import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getReaderAccess } from "@/lib/premium";
import { PLANS, formatVND, pricePerMonth, savingPercent } from "@/lib/plans";
import { formatShortDate } from "@/lib/utils";

export const metadata = { title: "Gói Premium — TECHZONE" };
export const revalidate = 0;

const BENEFITS = [
  "Đọc toàn bộ nội dung mọi bài Premium",
  "Bình luận và thảo luận ở các bài Premium",
  "Tóm tắt AI cho các bài Premium",
];

export default async function PremiumPage() {
  const session = await getServerSession(authOptions);
  const access = await getReaderAccess(session);
  const activeUntil = !access.isAdmin && access.canReadPremium ? access.premiumUntil : null;

  return (
    <div className="py-10">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold text-navy">TECHZONE Premium</h1>
        <p className="mt-2 text-ink/60">
          Đọc không giới hạn các bài phân tích chuyên sâu. Chọn gói phù hợp với bạn.
        </p>
      </div>

      {access.isAdmin && (
        <p className="mx-auto mt-6 max-w-2xl rounded border border-line bg-mist px-4 py-3 text-center text-sm text-ink/70">
          Bạn là quản trị viên nên luôn đọc được mọi bài Premium. Bạn vẫn có thể thử luồng mua gói bên dưới.
        </p>
      )}
      {activeUntil && (
        <p className="mx-auto mt-6 max-w-2xl rounded border border-electric/30 bg-electric/5 px-4 py-3 text-center text-sm text-navy">
          Premium của bạn còn hạn đến <strong>{formatShortDate(activeUntil)}</strong>. Mua thêm gói sẽ
          được cộng nối tiếp vào hạn hiện tại.
        </p>
      )}

      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-3">
        {PLANS.map((plan) => {
          const saving = savingPercent(plan);
          const highlight = Boolean(plan.badge);
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-md border p-5 ${
                highlight ? "border-electric shadow-md" : "border-line"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-electric px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                  {plan.badge}
                </span>
              )}
              <h2 className="text-lg font-bold text-navy">{plan.name}</h2>
              <p className="mt-3 text-3xl font-extrabold text-ink">{formatVND(plan.price)}</p>
              <p className="mt-1 text-sm text-ink/50">
                {plan.months > 1
                  ? `≈ ${formatVND(pricePerMonth(plan))}/tháng`
                  : "Thanh toán một lần, không tự gia hạn"}
              </p>
              {saving > 0 && (
                <p className="mt-2 inline-block self-start rounded bg-hot/10 px-2 py-0.5 text-xs font-semibold text-hot">
                  Tiết kiệm {saving}%
                </p>
              )}
              <ul className="mt-4 flex-1 space-y-2 text-sm text-ink/70">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-electric">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/premium/thanh-toan?plan=${plan.id}`}
                className={`mt-5 rounded-full py-2.5 text-center text-sm font-semibold ${
                  highlight
                    ? "bg-electric text-white hover:bg-electric-light"
                    : "border border-electric text-electric hover:bg-electric hover:text-white"
                }`}
              >
                {activeUntil ? "Gia hạn gói này" : "Chọn gói này"}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-ink/40">
        Đây là bản mô phỏng thanh toán: không có khoản tiền nào bị trừ.
        {!access.isLoggedIn && (
          <>
            {" "}
            Bạn cần{" "}
            <Link href="/dang-nhap?callbackUrl=/premium" className="text-electric hover:underline">
              đăng nhập
            </Link>{" "}
            hoặc{" "}
            <Link href="/dang-ky" className="text-electric hover:underline">
              đăng ký tài khoản
            </Link>{" "}
            trước khi chọn gói.
          </>
        )}
      </p>
    </div>
  );
}
