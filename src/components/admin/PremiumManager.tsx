"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatVND } from "@/lib/plans";

type PremiumUser = { name: string; email: string; until: string; active: boolean };
type OrderRow = {
  id: string;
  planName: string;
  amount: number;
  simulated: boolean;
  date: string;
  userName: string;
  userEmail: string;
};

export default function PremiumManager({
  stats,
  users,
  orders,
}: {
  stats: { activeCount: number; paidOrders: number; revenue: number };
  users: PremiumUser[];
  orders: OrderRow[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [months, setMonths] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function call(body: Record<string, unknown>, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/premium", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Thao tác thất bại.");
      } else {
        setMessage("Đã cập nhật.");
        router.refresh();
      }
    } catch {
      setMessage("Có lỗi xảy ra, thử lại sau.");
    }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded border border-line p-3">
          <p className="text-2xl font-extrabold text-navy">{stats.activeCount}</p>
          <p className="text-xs text-ink/50">Đang Premium</p>
        </div>
        <div className="rounded border border-line p-3">
          <p className="text-2xl font-extrabold text-navy">{stats.paidOrders}</p>
          <p className="text-xs text-ink/50">Đơn mô phỏng</p>
        </div>
        <div className="rounded border border-line p-3">
          <p className="text-2xl font-extrabold text-navy">{formatVND(stats.revenue)}</p>
          <p className="text-xs text-ink/50">Doanh thu mô phỏng</p>
        </div>
      </div>

      <div className="rounded border border-line p-4">
        <p className="mb-2 text-sm font-semibold text-ink/70">Tặng Premium theo email</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@nguoidung.com"
            className="min-w-0 flex-1 rounded border border-line px-3 py-1.5 text-sm outline-none focus:border-electric"
          />
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="rounded border border-line px-2 py-1.5 text-sm"
          >
            {[1, 3, 6, 12].map((m) => (
              <option key={m} value={m}>
                {m} tháng
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy || !email.trim()}
            onClick={() => call({ action: "grant", email: email.trim(), months })}
            className="rounded-full bg-electric px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Tặng
          </button>
        </div>
        {message && <p className="mt-2 text-xs text-ink/60">{message}</p>}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ink/70">Tài khoản có gói Premium ({users.length})</p>
        <ul className="divide-y divide-line rounded border border-line">
          {users.map((u) => (
            <li key={u.email} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{u.name}</p>
                <p className="truncate text-xs text-ink/45">{u.email}</p>
              </div>
              <span className={`shrink-0 text-xs ${u.active ? "text-electric" : "text-hot"}`}>
                {u.active ? `Còn hạn đến ${u.until}` : `Hết hạn ${u.until}`}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => call({ action: "grant", email: u.email, months: 1 })}
                className="shrink-0 rounded border border-line px-3 py-1 text-xs font-semibold hover:border-electric hover:text-electric disabled:opacity-50"
              >
                +1 tháng
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  call({ action: "revoke", email: u.email }, `Thu hồi Premium của ${u.email}?`)
                }
                className="shrink-0 rounded border border-hot/40 px-3 py-1 text-xs font-semibold text-hot hover:bg-hot hover:text-white disabled:opacity-50"
              >
                Thu hồi
              </button>
            </li>
          ))}
          {users.length === 0 && (
            <li className="px-3 py-4 text-center text-sm text-ink/40">Chưa có ai đăng ký Premium.</li>
          )}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ink/70">Đơn gần đây</p>
        <ul className="divide-y divide-line rounded border border-line">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">
                  {o.planName} · {o.userName}
                </p>
                <p className="truncate text-xs text-ink/45">
                  {o.userEmail} · {o.date}
                  {o.simulated ? " · mô phỏng" : ""}
                </p>
              </div>
              <span className="shrink-0 font-semibold text-ink">
                {o.amount === 0 ? "Tặng" : formatVND(o.amount)}
              </span>
            </li>
          ))}
          {orders.length === 0 && (
            <li className="px-3 py-4 text-center text-sm text-ink/40">Chưa có đơn nào.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
