"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; slug: string; showOnHome: boolean };

export default function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Có lỗi xảy ra.");
      return;
    }
    setCategories((prev) => [...prev, data]);
    setName("");
    router.refresh();
  }

  async function toggleShowOnHome(cat: Category) {
    const res = await fetch(`/api/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ showOnHome: !cat.showOnHome }),
    });
    if (res.ok) {
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, showOnHome: !c.showOnHome } : c))
      );
      router.refresh();
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Xoá chuyên mục "${cat.name}"?`)) return;
    const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Không xoá được.");
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên chuyên mục mới"
          className="flex-1 rounded border border-line px-3 py-1.5 text-sm outline-none focus:border-electric"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-navy px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          + Thêm
        </button>
      </form>
      {error && <p className="mb-3 text-sm text-hot">{error}</p>}

      <ul className="divide-y divide-line rounded border border-line">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between px-3 py-2 text-sm">
            <span className="font-medium text-ink">{c.name}</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-ink/60">
                <input
                  type="checkbox"
                  checked={c.showOnHome}
                  onChange={() => toggleShowOnHome(c)}
                />
                Hiện khối riêng ở trang chủ
              </label>
              <button
                onClick={() => handleDelete(c)}
                className="text-xs font-semibold text-hot hover:underline"
              >
                Xoá
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
