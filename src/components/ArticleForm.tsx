"use client";

import type React from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ARTICLE_AUTHORS } from "@/lib/constants";

type Category = { id: string; name: string };

type InitialData = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImageUrl: string;
  categoryId: string;
  authorName: string;
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
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initial?.title || "");
  const [summary, setSummary] = useState(initial?.summary || "");
  const [content, setContent] = useState(initial?.content || "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId || categories[0]?.id || "");
  const [authorName, setAuthorName] = useState(initial?.authorName || ARTICLE_AUTHORS[0]);
  const [tags, setTags] = useState("");
  const [isPremium, setIsPremium] = useState(initial?.isPremium || false);
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl || "");
  const [uploading, setUploading] = useState(false);
  const [contentImageUploading, setContentImageUploading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Đọc response JSON một cách an toàn: nếu server trả về rỗng hoặc không phải
  // JSON (lỗi 500 bất ngờ, timeout, gateway lỗi...), vẫn báo lỗi rõ ràng thay vì
  // làm crash ở res.json() với thông báo khó hiểu "Unexpected end of JSON input".
  async function parseJsonResponse(res: Response): Promise<any> {
    const text = await res.text();
    if (!text) {
      throw new Error(`Server không phản hồi dữ liệu (mã lỗi ${res.status}). Vui lòng thử lại.`);
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Server trả về dữ liệu không hợp lệ (mã lỗi ${res.status}). Vui lòng thử lại.`);
    }
  }

  // Dùng chung cho cả ảnh bìa lẫn ảnh chèn trong nội dung - ảnh nào cũng đi qua
  // /api/upload (chỉ ADMIN gọi được, xem lib/auth + api/upload/route.ts).
  async function uploadImageFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await parseJsonResponse(res);
    if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại.");
    return data.url as string;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      setCoverImageUrl(await uploadImageFile(file));
    } catch (err: any) {
      setError(err.message || "Tải ảnh thất bại.");
    } finally {
      setUploading(false);
    }
  }

  // Tải ảnh lên rồi chèn dòng "![](url)" vào ĐÚNG VỊ TRÍ con trỏ đang đặt trong
  // ô nội dung (không phải luôn chèn ở cuối bài) - đây là ô nhập văn bản thuần,
  // nên để "di chuyển" ảnh tới chỗ khác, cắt (cut) nguyên dòng ảnh rồi dán vào
  // vị trí mong muốn, giống sửa một đoạn văn bản bình thường.
  async function insertImageAtCursor(file: File) {
    setError("");
    const textarea = contentRef.current;
    const caretPos = textarea ? textarea.selectionStart : content.length;
    setContentImageUploading(true);
    try {
      const url = await uploadImageFile(file);
      const markdown = `\n\n![](${url})\n\n`;
      setContent((prev) => prev.slice(0, caretPos) + markdown + prev.slice(caretPos));
      // Đặt lại con trỏ ngay sau ảnh vừa chèn, sau khi React render xong nội dung mới.
      requestAnimationFrame(() => {
        const el = contentRef.current;
        if (el) {
          const nextPos = caretPos + markdown.length;
          el.focus();
          el.setSelectionRange(nextPos, nextPos);
        }
      });
    } catch (err: any) {
      setError(err.message || "Tải ảnh thất bại.");
    } finally {
      setContentImageUploading(false);
    }
  }

  function handleContentImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại đúng file đó lần nữa nếu cần
    if (file) insertImageAtCursor(file);
  }

  // Chèn "[nhãn](url)" ở đúng vị trí con trỏ/đoạn đang bôi đen trong ô nội
  // dung — giống cách "Chèn ảnh" hoạt động ở trên. Nếu người dùng đã bôi đen
  // sẵn 1 đoạn chữ thì dùng luôn đoạn đó làm nhãn hiển thị của link.
  function insertLinkAtCursor() {
    const textarea = contentRef.current;
    const selStart = textarea ? textarea.selectionStart : content.length;
    const selEnd = textarea ? textarea.selectionEnd : content.length;
    const selectedText = content.slice(selStart, selEnd);

    const url = window.prompt("Dán đường dẫn liên kết (bắt đầu bằng http:// hoặc https://):");
    if (!url) return;
    const trimmedUrl = url.trim();
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      setError("Liên kết phải bắt đầu bằng http:// hoặc https://.");
      return;
    }
    setError("");

    const label = selectedText.trim() || window.prompt("Chữ hiển thị cho liên kết:", "") || trimmedUrl;
    const markdown = `[${label}](${trimmedUrl})`;
    setContent((prev) => prev.slice(0, selStart) + markdown + prev.slice(selEnd));
    requestAnimationFrame(() => {
      const el = contentRef.current;
      if (el) {
        const nextPos = selStart + markdown.length;
        el.focus();
        el.setSelectionRange(nextPos, nextPos);
      }
    });
  }

  // Dán ảnh (Ctrl+V / Cmd+V) từ clipboard thẳng vào ô nội dung, ví dụ ảnh vừa
  // chụp màn hình hoặc copy từ trình duyệt khác - không cần lưu ra file trước.
  function handleContentPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          insertImageAtCursor(file);
        }
        return;
      }
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
      authorName,
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
      const data = await parseJsonResponse(res);
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
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink/70">Tác giả đăng</label>
          <select
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-electric"
          >
            {ARTICLE_AUTHORS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        {!isEdit && (
          <div className="sm:col-span-2">
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
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-semibold text-ink/70">Nội dung bài viết</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={insertLinkAtCursor}
              className="rounded border border-line px-2.5 py-1 text-xs font-semibold text-ink/70 hover:border-electric hover:text-electric"
            >
              🔗 Chèn liên kết
            </button>
            <button
              type="button"
              onClick={() => contentImageInputRef.current?.click()}
              disabled={contentImageUploading}
              className="rounded border border-line px-2.5 py-1 text-xs font-semibold text-ink/70 hover:border-electric hover:text-electric disabled:opacity-60"
            >
              {contentImageUploading ? "Đang tải ảnh..." : "🖼️ Chèn ảnh"}
            </button>
          </div>
          <input
            ref={contentImageInputRef}
            type="file"
            accept="image/*"
            onChange={handleContentImagePick}
            className="hidden"
          />
        </div>
        <p className="mb-1.5 text-xs text-ink/45">
          Mẹo định dạng: dòng bắt đầu bằng <code className="rounded bg-mist px-1">## </code> thành
          tiêu đề phụ, dòng bắt đầu bằng <code className="rounded bg-mist px-1">- </code> thành gạch
          đầu dòng, để trống một dòng giữa các đoạn văn. Để chèn ảnh vào giữa bài: đặt con trỏ vào
          chỗ muốn chèn rồi bấm <strong>Chèn ảnh</strong>, hoặc dán trực tiếp ảnh đã copy (Ctrl+V /
          Cmd+V) vào ô bên dưới. Muốn đổi vị trí ảnh: cắt nguyên dòng{" "}
          <code className="rounded bg-mist px-1">![](...)</code> rồi dán vào chỗ khác. Để chèn liên
          kết ra trang ngoài: bôi đen đoạn chữ muốn làm nhãn (hoặc không cần) rồi bấm{" "}
          <strong>Chèn liên kết</strong>, hoặc tự gõ theo cú pháp{" "}
          <code className="rounded bg-mist px-1">[nhãn hiển thị](https://...)</code>.
        </p>
        <textarea
          ref={contentRef}
          required
          minLength={400}
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={handleContentPaste}
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
