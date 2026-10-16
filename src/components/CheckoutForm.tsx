"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PAYMENT_METHODS,
  addMonths,
  formatVND,
  type PaymentMethodId,
  type Plan,
} from "@/lib/plans";

function formatDate(d: Date) {
  return d.toLocaleDateString("vi-VN");
}

export default function CheckoutForm({
  plan,
  currentUntil,
}: {
  plan: Plan;
  currentUntil: string | null;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethodId>("card");
  const [phase, setPhase] = useState<"form" | "processing" | "done">("form");
  const [error, setError] = useState("");
  const [newUntil, setNewUntil] = useState<string | null>(null);

  useEffect(() => {
    (window as any).gtag?.("event", "begin_checkout", {
      currency: "VND",
      value: plan.price,
      items: [{ item_id: plan.id, item_name: plan.name }],
    });
  }, [plan.id, plan.name, plan.price]);

  const base = currentUntil && new Date(currentUntil) > new Date() ? new Date(currentUntil) : new Date();
  const expectedUntil = addMonths(base, plan.months);

  async function handlePay() {
    setError("");
    setPhase("processing");
    // Giả lập thời gian xử lý của cổng thanh toán.
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const res = await fetch("/api/premium/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planId: plan.id, method }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Thanh toán thất bại, thử lại sau.");
        setPhase("form");
        return;
      }
      setNewUntil(data.premiumUntil);
      // Sự kiện mô phỏng: đặt tên khác "purchase" để không lẫn vào doanh thu thật trong GA.
      (window as any).gtag?.("event", "simulated_purchase", {
        transaction_id: data.orderId,
        currency: "VND",
        value: plan.price,
        items: [{ item_id: plan.id, item_name: plan.name }],
      });
      setPhase("done");
      router.refresh();
    } catch {
      setError("Có lỗi xảy ra, thử lại sau.");
      setPhase("form");
    }
  }

  if (phase === "done") {
    return (
      <div className="mt-6 rounded-md border border-electric/30 bg-electric/5 p-6 text-center">
        <p className="text-lg font-bold text-navy">Đăng ký Premium thành công</p>
        <p className="mt-2 text-sm text-ink/70">
          Premium của bạn có hiệu lực đến{" "}
          <strong>{newUntil ? formatDate(new Date(newUntil)) : formatDate(expectedUntil)}</strong>.
        </p>
        <p className="mt-1 text-xs text-ink/40">Giao dịch mô phỏng, không có khoản tiền nào bị trừ.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/" className="rounded-full bg-electric px-5 py-2 text-sm font-semibold text-white">
            Đọc bài ngay
          </Link>
          <Link
            href="/tai-khoan"
            className="rounded-full border border-electric px-5 py-2 text-sm font-semibold text-electric"
          >
            Xem tài khoản
          </Link>
        </div>
      </div>
    );
  }

  const busy = phase === "processing";

  return (
    <div className="mt-4">
      <p className="rounded border border-hot/30 bg-hot/5 px-3 py-2 text-xs font-semibold text-hot">
        CHẾ ĐỘ MÔ PHỎNG — không có khoản tiền nào bị trừ.
      </p>

      <div className="mt-5 rounded-md border border-line p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-ink">{plan.name}</span>
          <span className="text-lg font-extrabold text-navy">{formatVND(plan.price)}</span>
        </div>
        <p className="mt-2 text-xs text-ink/50" suppressHydrationWarning>
          Hạn Premium sau khi thanh toán: <strong>{formatDate(expectedUntil)}</strong>
          {currentUntil && " (cộng nối tiếp vào hạn hiện tại)"}
        </p>
      </div>

      <fieldset className="mt-5" disabled={busy}>
        <legend className="mb-2 text-sm font-semibold text-ink/70">Phương thức thanh toán</legend>
        <div className="space-y-2">
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m.id}
              className={`flex cursor-pointer items-start gap-3 rounded border px-3 py-2.5 text-sm ${
                method === m.id ? "border-electric bg-electric/5" : "border-line"
              }`}
            >
              <input
                type="radio"
                name="method"
                value={m.id}
                checked={method === m.id}
                onChange={() => setMethod(m.id)}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-ink">{m.label}</span>
                <span className="block text-xs text-ink/40">{m.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className="mt-4 text-sm text-hot">{error}</p>}

      <button
        type="button"
        onClick={handlePay}
        disabled={busy}
        className="mt-5 w-full rounded-full bg-electric py-2.5 text-sm font-semibold text-white hover:bg-electric-light disabled:opacity-60"
      >
        {busy ? "Đang xử lý thanh toán..." : `Thanh toán ${formatVND(plan.price)} (mô phỏng)`}
      </button>
    </div>
  );
}
