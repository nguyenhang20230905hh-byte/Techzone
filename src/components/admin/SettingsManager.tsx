"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/settings";

export default function SettingsManager({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    setState("saving");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(settings),
    });
    setState(res.ok ? "saved" : "error");
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-semibold text-ink/70">Tên tạp chí</label>
        <input
          value={settings.siteName}
          onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
          className="w-full rounded border border-line px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-ink/70">Slogan</label>
        <input
          value={settings.slogan}
          onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
          className="w-full rounded border border-line px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-ink/70">Email liên hệ</label>
        <input
          value={settings.contactEmail}
          onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
          className="w-full rounded border border-line px-3 py-1.5 text-sm"
        />
      </div>

      <fieldset className="rounded border border-line p-3">
        <legend className="px-1 text-sm font-semibold text-ink/70">Banner quảng cáo đầu trang</legend>
        <div className="space-y-2">
          <input
            value={settings.topBanner.title}
            onChange={(e) =>
              setSettings({ ...settings, topBanner: { ...settings.topBanner, title: e.target.value } })
            }
            placeholder="Tiêu đề banner"
            className="w-full rounded border border-line px-3 py-1.5 text-sm"
          />
          <input
            value={settings.topBanner.subtitle}
            onChange={(e) =>
              setSettings({ ...settings, topBanner: { ...settings.topBanner, subtitle: e.target.value } })
            }
            placeholder="Mô tả ngắn"
            className="w-full rounded border border-line px-3 py-1.5 text-sm"
          />
          <input
            value={settings.topBanner.imageUrl}
            onChange={(e) =>
              setSettings({ ...settings, topBanner: { ...settings.topBanner, imageUrl: e.target.value } })
            }
            placeholder="URL ảnh nền"
            className="w-full rounded border border-line px-3 py-1.5 text-sm"
          />
          <input
            value={settings.topBanner.linkUrl}
            onChange={(e) =>
              setSettings({ ...settings, topBanner: { ...settings.topBanner, linkUrl: e.target.value } })
            }
            placeholder="Đường dẫn khi bấm vào"
            className="w-full rounded border border-line px-3 py-1.5 text-sm"
          />
        </div>
      </fieldset>

      <fieldset className="rounded border border-line p-3">
        <legend className="px-1 text-sm font-semibold text-ink/70">
          3 banner quảng cáo xen kẽ
        </legend>
        <div className="space-y-4">
          {settings.inlineAds.map((ad, i) => (
            <div key={i} className="space-y-2 border-b border-line pb-3 last:border-0 last:pb-0">
              <input
                value={ad.message}
                onChange={(e) => {
                  const next = [...settings.inlineAds];
                  next[i] = { ...next[i], message: e.target.value };
                  setSettings({ ...settings, inlineAds: next });
                }}
                placeholder="Thông điệp"
                className="w-full rounded border border-line px-3 py-1.5 text-sm"
              />
              <input
                value={ad.imageUrl}
                onChange={(e) => {
                  const next = [...settings.inlineAds];
                  next[i] = { ...next[i], imageUrl: e.target.value };
                  setSettings({ ...settings, inlineAds: next });
                }}
                placeholder="URL ảnh"
                className="w-full rounded border border-line px-3 py-1.5 text-sm"
              />
              <input
                value={ad.linkUrl}
                onChange={(e) => {
                  const next = [...settings.inlineAds];
                  next[i] = { ...next[i], linkUrl: e.target.value };
                  setSettings({ ...settings, inlineAds: next });
                }}
                placeholder="Đường dẫn"
                className="w-full rounded border border-line px-3 py-1.5 text-sm"
              />
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={state === "saving"}
          className="rounded-full bg-electric px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {state === "saving" ? "Đang lưu..." : "Lưu cấu hình"}
        </button>
        {state === "saved" && <span className="text-sm text-electric">✓ Đã lưu, áp dụng ngay.</span>}
        {state === "error" && <span className="text-sm text-hot">Có lỗi xảy ra.</span>}
      </div>
    </div>
  );
}
