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

/**
 * Tên hiển thị dùng thay cho tên tài khoản thật của ADMIN khi họ phản hồi bình
 * luận của độc giả — tránh lộ tên cá nhân của quản trị viên, hiển thị thống
 * nhất là đại diện cho cả toà soạn thay vì 1 người cụ thể.
 */
export const ADMIN_DISPLAY_NAME = "Quản trị viên TECHZONE";
