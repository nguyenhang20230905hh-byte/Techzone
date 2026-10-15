"use client";

import { useState } from "react";

type Summary = { points: string[]; conclusion: string; isDemo: boolean };

export default function AISummaryButton({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [summary, setSummary] = useState<Summary | null>(null);

  async function handleClick() {
    setState("loading");
    try {
      const res = await fetch(`/api/articles/${slug}/summary`, { method: "POST" });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setSummary(data);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="my-6 rounded-md border border-electric/30 bg-electric/5 p-4">
      {state !== "done" && (
        <button
          onClick={handleClick}
          disabled={state === "loading"}
          className="flex items-center gap-2 rounded-full bg-electric px-4 py-2 text-sm font-semibold text-white transition hover:bg-electric-light disabled:opacity-60"
        >
          <span>✨</span>
          {state === "loading" ? "Đang tóm tắt..." : "Tóm tắt bằng AI"}
        </button>
      )}
      {state === "error" && (
        <p className="mt-2 text-sm text-hot">Không tóm tắt được lúc này, thử lại sau.</p>
      )}
      {state === "done" && summary && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-bold text-navy">✨ Tóm tắt nhanh</h3>
            {summary.isDemo && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                Chế độ demo
              </span>
            )}
          </div>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink/80">
            {summary.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <p className="mt-3 border-t border-electric/20 pt-3 text-sm italic text-ink/70">
            {summary.conclusion}
          </p>
        </div>
      )}
    </div>
  );
}
