/** Danh sách bút danh tác giả được phép chọn khi đăng bài (xem ArticleForm.tsx). */
export const ARTICLE_AUTHORS = [
  "Phương Nhi",
  "Gia Uyên",
  "Thanh Thúy",
  "Hà Phương",
  "Quỳnh Quỳnh",
  "Hà Thiên",
  "Nguyễn Hằng",
  "Admin",
] as const;

export type ArticleAuthorName = (typeof ARTICLE_AUTHORS)[number];
