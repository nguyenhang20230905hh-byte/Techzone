/**
 * Seed TỐI THIỂU cho production: chỉ tạo 7 chuyên mục + 1 tài khoản ADMIN.
 * KHÔNG tạo bài viết mẫu — dùng khi bạn muốn tự đăng bài thật qua giao diện,
 * không cần dữ liệu demo.
 *
 * Chạy (trỏ đúng DATABASE_URL production):
 *   npm run db:push        # tạo bảng nếu chưa có
 *   npm run db:seed  # chạy script này
 *
 * Tuỳ chỉnh email/mật khẩu admin bằng biến môi trường, ví dụ:
 *   ADMIN_EMAIL="ban@gmail.com" ADMIN_PASSWORD="mat-khau-cua-ban" npm run db:seed
 * Không truyền thì dùng mặc định: admin@techzone.vn / techzone2026 — NÊN đổi ngay sau khi seed.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "AI & Công nghệ", slug: "ai-cong-nghe", order: 1, description: "Trí tuệ nhân tạo và cách nó thay đổi học tập, công việc, cuộc sống." },
  { name: "Thiết bị số", slug: "thiet-bi-so", order: 2, description: "Đánh giá, so sánh và hướng dẫn chọn thiết bị công nghệ phù hợp." },
  { name: "Kỹ năng số", slug: "ky-nang-so", order: 3, description: "Kỹ năng làm chủ công cụ số trong học tập và nghề nghiệp." },
  { name: "Xu hướng số", slug: "xu-huong-so", order: 4, description: "Những xu hướng công nghệ đang định hình cách người trẻ sống và làm việc." },
  { name: "Đời sống số", slug: "doi-song-so", order: 5, description: "Công nghệ trong đời sống hằng ngày và sự cân bằng với thế giới thực." },
  { name: "Góc nhìn", slug: "goc-nhin", order: 6, description: "Bài bình luận, phân tích chuyên sâu từ cộng đồng TECHZONE.", showOnHome: false },
  { name: "Video", slug: "video", order: 7, description: "Nội dung công nghệ dạng video.", showOnHome: false },
];

async function main() {
  console.log("Đang tạo chuyên mục...");
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const email = (process.env.ADMIN_EMAIL || "admin@techzone.vn").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "techzone2026";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Tài khoản ${email} đã tồn tại — đặt lại role ADMIN và mật khẩu mới.`);
    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN", passwordHash: await bcrypt.hash(password, 10) },
    });
  } else {
    await prisma.user.create({
      data: {
        name: "Admin TECHZONE",
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: "ADMIN",
      },
    });
    console.log(`Đã tạo tài khoản ADMIN: ${email}`);
  }

  console.log("Xong. Đăng nhập bằng:");
  console.log(`  Email: ${email}`);
  console.log(`  Mật khẩu: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
