"use client";

import type React from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

type InitialData = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImageUrl: string;
  categoryId: string;
  isPremium: boolean;
};

export default function ArticleForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: InitialData;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title || "");
  const [summary, setSummary] = useState(initial?.summary || "");
  const [content, setContent] = useState(initial?.content || "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId || categories[0]?.id || "");
  const [tags, setTags] = useState("");
  const [isPremium, setIsPremium] = useState(initial?.isPremium || false);
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại.");
      setCoverImageUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Tải ảnh thất bại.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!coverImageUrl) {
      setError("Vui lòng tải ảnh bìa cho bài viết.");
      return;
    }
    setSubmitting(true);
    const payload = {
      title,
      summary,
      content,
      coverImageUrl,
      categoryId,
      isPremium,
      ...(isEdit
        ? {}
        : { tags: tags.split(",").map((t) => t.trim()).filter(Boolean) }),
    };

    const url = isEdit ? `/api/articles/${initial!.slug}` : "/api/articles";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra.");
      router.push(`/bai-viet/${data.slug}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="rounded bg-hot/10 px-3 py-2 text-sm text-hot">{error}</p>}

      <div>
        <label className="mb-1 block text-sm font-semibold text-ink/70">Tiêu đề bài viết</label>
        <input
          required
          minLength={10}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-electric"
          placeholder="Ví dụ: 5 công cụ AI đáng thử dành cho sinh viên"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-ink/70">Tóm tắt (2-3 câu)</label>
        <textarea
          required
          minLength={20}
          rows={2}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-electric"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink/70">Chuyên mục</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-electric"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {!isEdit && (
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink/70">Tag (cách nhau bằng dấu phẩy)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="AI, sinh viên, công cụ"
              className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-electric"
            />
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-ink/70">Ảnh bìa</label>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
        {uploading && <p className="mt-1 text-xs text-ink/50">Đang tải ảnh lên...</p>}
        {coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImageUrl} alt="Xem trước ảnh bìa" className="mt-2 h-40 w-full rounded object-cover" />
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-ink/70">Nội dung bài viết</label>
        <p className="mb-1.5 text-xs text-ink/45">
          Mẹo định dạng: dòng bắt đầu bằng <code className="rounded bg-mist px-1">## </code> thành
          tiêu đề phụ, dòng bắt đầu bằng <code className="rounded bg-mist px-1">- </code> thành gạch
          đầu dòng, để trống một dòng giữa các đoạn văn.
        </p>
        <textarea
          required
          minLength={400}
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded border border-line px-3 py-2 text-sm leading-relaxed outline-none focus:border-electric"
        />
        <p className="mt-1 text-right text-xs text-ink/40">{content.trim().split(/\s+/).filter(Boolean).length} từ</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
        Đánh dấu là bài viết Premium (chỉ thành viên đăng nhập mới đọc toàn bộ)
      </label>

      <button
        type="submit"
        disabled={submitting || uploading}
        className="rounded-full bg-electric px-6 py-2.5 text-sm font-semibold text-white hover:bg-electric-light disabled:opacity-60"
      >
        {submitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Đăng bài"}
      </button>
    </form>
  );
}
