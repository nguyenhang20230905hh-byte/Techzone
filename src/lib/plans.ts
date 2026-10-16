// Cấu hình gói Premium + phương thức thanh toán. Dùng được ở cả server lẫn client
// (không import gì phía server). Muốn đổi giá/gói chỉ cần sửa file này.

/**
 * true  = thanh toán MÔ PHỎNG (không trừ tiền, ai bấm cũng được kích hoạt Premium).
 * false = chặn API checkout cho tới khi tích hợp cổng thanh toán thật.
 */
export const PAYMENT_SIMULATED = true;

/** Chặn việc bấm thanh toán liên tục để cộng hạn vô hạn: hạn tối đa tính từ hôm nay. */
export const MAX_MONTHS_AHEAD = 36;

export type PlanId = "1m" | "6m" | "12m";

export type Plan = {
  id: PlanId;
  name: string;
  months: number;
  price: number; // tổng tiền của cả gói, đơn vị VND
  badge?: string;
};

export const PLANS: Plan[] = [
  { id: "1m", name: "Gói 1 tháng", months: 1, price: 29000 },
  { id: "6m", name: "Gói 6 tháng", months: 6, price: 150000 },
  { id: "12m", name: "Gói 1 năm", months: 12, price: 275000, badge: "Tiết kiệm nhất" },
];

export const BASE_MONTHLY_PRICE = PLANS[0].price / PLANS[0].months;

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function pricePerMonth(plan: Plan): number {
  return Math.round(plan.price / plan.months);
}

/** % tiết kiệm so với mua lẻ từng tháng theo giá gói 1 tháng. */
export function savingPercent(plan: Plan): number {
  const full = BASE_MONTHLY_PRICE * plan.months;
  return Math.max(0, Math.round((1 - plan.price / full) * 100));
}

export type PaymentMethodId = "card" | "wallet" | "bank";

export const PAYMENT_METHODS: { id: PaymentMethodId; label: string; hint: string }[] = [
  { id: "card", label: "Thẻ ATM / Visa / Mastercard", hint: "Mô phỏng — không nhập số thẻ" },
  { id: "wallet", label: "Ví điện tử (MoMo, ZaloPay…)", hint: "Mô phỏng" },
  { id: "bank", label: "Chuyển khoản ngân hàng (QR)", hint: "Mô phỏng" },
];

export function isPaymentMethod(v: unknown): v is PaymentMethodId {
  return PAYMENT_METHODS.some((m) => m.id === v);
}

export function formatVND(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

/** Cộng `months` tháng theo lịch, kẹp ngày cuối tháng (31/1 + 1 tháng = 28/2, không nhảy sang tháng 3). */
export function addMonths(from: Date, months: number): Date {
  const d = new Date(from.getTime());
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}
