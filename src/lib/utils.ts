export function slugify(input: string): string {
  const map: Record<string, string> = {
    à: "a", á: "a", ạ: "a", ả: "a", ã: "a", â: "a", ầ: "a", ấ: "a", ậ: "a", ẩ: "a", ẫ: "a",
    ă: "a", ằ: "a", ắ: "a", ặ: "a", ẳ: "a", ẵ: "a",
    è: "e", é: "e", ẹ: "e", ẻ: "e", ẽ: "e", ê: "e", ề: "e", ế: "e", ệ: "e", ể: "e", ễ: "e",
    ì: "i", í: "i", ị: "i", ỉ: "i", ĩ: "i",
    ò: "o", ó: "o", ọ: "o", ỏ: "o", õ: "o", ô: "o", ồ: "o", ố: "o", ộ: "o", ổ: "o", ỗ: "o",
    ơ: "o", ờ: "o", ớ: "o", ợ: "o", ở: "o", ỡ: "o",
    ù: "u", ú: "u", ụ: "u", ủ: "u", ũ: "u", ư: "u", ừ: "u", ứ: "u", ự: "u", ử: "u", ữ: "u",
    ỳ: "y", ý: "y", ỵ: "y", ỷ: "y", ỹ: "y",
    đ: "d",
  };
  const lower = input.toLowerCase();
  const noDiacritics = lower
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("");
  return noDiacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function estimateReadingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(2, Math.round(words / 180));
}

const vnDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatVietnameseDate(date: Date): string {
  const parts = vnDateFormatter.formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalized}, ${day}/${month}/${year}`;
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Vừa xong";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return formatShortDate(date);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Nội dung bài viết lưu dạng "markdown-lite":
 *  - Dòng bắt đầu bằng "## " => tiêu đề phụ (h2)
 *  - Dòng bắt đầu bằng "- " (liên tiếp) => danh sách
 *  - Các đoạn còn lại cách nhau bằng dòng trống => <p>
 * Hàm này tách thành các khối có cấu trúc để component render ra HTML an toàn
 * (không dùng dangerouslySetInnerHTML với nội dung người dùng nhập).
 */
export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export function parseArticleContent(raw: string): ContentBlock[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: ContentBlock[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      blocks.push({ type: "paragraph", text: paragraphBuffer.join(" ").trim() });
      paragraphBuffer = [];
    }
  };
  const flushList = () => {
    if (listBuffer.length) {
      blocks.push({ type: "list", items: [...listBuffer] });
      listBuffer = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: line.slice(3).trim() });
    } else if (line.startsWith("- ")) {
      flushParagraph();
      listBuffer.push(line.slice(2).trim());
    } else if (line === "") {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraphBuffer.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

/** Cắt bài viết ở khoảng N từ đầu cho phần xem trước khi dính paywall. */
export function truncateContent(raw: string, wordLimit = 120): string {
  const words = raw.trim().split(/\s+/);
  if (words.length <= wordLimit) return raw;
  return words.slice(0, wordLimit).join(" ") + "…";
}
