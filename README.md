# TECHZONE — Tạp chí điện tử công nghệ cho người trẻ Việt Nam

> "Công nghệ trong tầm tay"

Web app tạp chí điện tử công nghệ, xây dựng bằng **Next.js 14 (App Router) + TypeScript +
Prisma + PostgreSQL**, deploy được thật trên **Vercel**, mã nguồn trên **GitHub**.

## Vì sao không dùng PHP + MySQL như bản mô tả gốc?

Bản mô tả yêu cầu ban đầu đề xuất PHP + MySQL, nhưng **Vercel không chạy được PHP** (chỉ chạy
Node.js/Next.js, Python, Go...). Vì yêu cầu triển khai cuối cùng là "chạy qua Vercel", dự án này
dùng Next.js (Node.js) + PostgreSQL — vẫn giữ đúng tinh thần kiến trúc rõ ràng, tách lớp
giao diện/logic backend/truy vấn dữ liệu như yêu cầu gốc, nhưng chạy được thật trên Vercel.

## 1. Kiến trúc & công nghệ

| Lớp | Công nghệ |
|---|---|
| Frontend | Next.js 14 App Router, React 18, TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers (`src/app/api/**`) — tương đương các API PHP trong yêu cầu gốc |
| Cơ sở dữ liệu | PostgreSQL qua Prisma ORM (tương đương MySQL trong yêu cầu gốc) |
| Xác thực | NextAuth.js (Credentials) + bcrypt băm mật khẩu |
| Upload ảnh | Vercel Blob (sản xuất) / ổ đĩa local (chỉ khi `npm run dev`) |
| AI tóm tắt | Anthropic Claude API (có chế độ demo khi chưa cấu hình key) |
| Email newsletter | Resend API (có chế độ demo khi chưa cấu hình key) |

Cấu trúc thư mục chính:

```
techzone/
├─ prisma/
│  ├─ schema.prisma      # 9+ bảng: articles, categories, authors, users, tags,
│  │                      # article_tags, comments, newsletter_subscribers, article_views...
│  └─ seed.ts             # 18 bài viết mẫu tiếng Việt + 7 chuyên mục + 4 tài khoản
├─ src/
│  ├─ app/                # Các trang (page.tsx) + API routes (route.ts)
│  ├─ components/         # Header, Footer, ArticleCard, CommentSection...
│  └─ lib/                # prisma client, auth, ai, email, settings, queries, utils
└─ public/uploads/        # Ảnh upload khi chạy local (dev only)
```

## 2. Chạy ở máy local

### Yêu cầu

- Node.js ≥ 18.18
- Một database PostgreSQL miễn phí — khuyến nghị [Neon](https://neon.tech) hoặc
  [Supabase](https://supabase.com) (tạo tài khoản, tạo project, copy connection string).

### Các bước

```bash
# 1. Cài đặt gói
npm install

# 2. Tạo file .env từ mẫu, điền DATABASE_URL + NEXTAUTH_SECRET
cp .env.example .env
# Tạo NEXTAUTH_SECRET nhanh bằng: openssl rand -base64 32

# 3. Đồng bộ schema vào database
npm run db:push

# 4. Seed dữ liệu mẫu (18 bài viết, 7 chuyên mục, 4 tài khoản)
npm run db:seed

# 5. Chạy app
npm run dev
```

Mở `http://localhost:3000`.

### Tài khoản mẫu sau khi seed

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị viên | `admin@techzone.vn` | `techzone2026` |
| Thành viên | `minhkhue@techzone.vn` | `techzone2026` |
| Thành viên | `giabao@techzone.vn` | `techzone2026` |
| Thành viên | `thuylinh@techzone.vn` | `techzone2026` |

**Đổi mật khẩu các tài khoản này ngay** nếu deploy lên môi trường công khai thật.
Tài khoản ADMIN có thể vào trang `/admin` để quản lý chuyên mục, banner quảng cáo, đánh dấu
bài nổi bật/Premium — mọi thứ tự điều chỉnh được, không cần sửa code.

## 3. Đưa code lên GitHub

```bash
git init
git add .
git commit -m "TECHZONE: khởi tạo dự án"
git branch -M main
git remote add origin https://github.com/<tai-khoan-cua-ban>/techzone.git
git push -u origin main
```

## 4. Deploy lên Vercel

1. Vào [vercel.com](https://vercel.com) → **Add New → Project** → chọn repo `techzone` vừa push.
2. Vercel tự nhận diện đây là dự án Next.js, không cần chỉnh Build Command.
3. Vào tab **Environment Variables**, thêm tối thiểu:
   - `DATABASE_URL` — connection string Postgres (Neon/Supabase/Vercel Postgres).
   - `NEXTAUTH_SECRET` — chuỗi bí mật bất kỳ.
   - `NEXTAUTH_URL` — URL app sau khi deploy, ví dụ `https://techzone-xxx.vercel.app`
     (có thể để trống ở lần deploy đầu, Vercel set `VERCEL_URL` tự động, nhưng nên điền chính
     xác sau khi có URL để NextAuth hoạt động ổn định).
   - `BLOB_READ_WRITE_TOKEN` — **bắt buộc nếu muốn upload ảnh hoạt động đúng trên production**
     (Vercel Dashboard → Storage → Blob → Create → Connect to Project → copy token).
   - `ANTHROPIC_API_KEY` *(tuỳ chọn)* — bật tóm tắt AI thật, không có vẫn chạy ở chế độ demo.
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL` *(tuỳ chọn)* — bật gửi email newsletter thật.
4. Bấm **Deploy**.
5. Sau khi deploy xong lần đầu, mở **Vercel → Storage → Postgres hoặc terminal cục bộ** và chạy:
   ```bash
   # Trỏ DATABASE_URL về đúng database production rồi chạy local:
   npm run db:push
   npm run db:seed
   ```
   (Prisma không tự seed khi deploy — đây là bước thủ công một lần duy nhất.)

## 5. Các chức năng đã triển khai (bám theo yêu cầu gốc)

**Mức 1 — Nội dung & trang cơ bản**
- Trang chủ đúng bố cục tham khảo: banner quảng cáo → thanh tiện ích (ngày giờ thực) → header
  logo giữa → menu chuyên mục → cụm tin nổi bật (chính + phụ + sidebar tin mới/đọc nhiều) →
  lưới tin phụ → banner xen kẽ → 5 khối chuyên mục → footer.
- 18 bài viết mẫu tiếng Việt (vượt yêu cầu tối thiểu 15), đủ 7 trường dữ liệu, phân bổ đúng số
  lượng từng chuyên mục theo yêu cầu (AI 4 · Thiết bị số 4 · Kỹ năng số 4 · Xu hướng số 3,
  cộng thêm 3 bài Đời sống số để khối chuyên mục thứ 5 không trống).
- Trang chuyên mục, trang chi tiết bài viết, trang Về chúng tôi.

**Mức 2 — Tương tác**
- Tìm kiếm theo tiêu đề/tóm tắt/nội dung (`/tim-kiem`).
- Lọc kết hợp theo chuyên mục + tác giả + khoảng ngày + sắp xếp mới/cũ nhất.
- Newsletter lưu email thật vào database, kiểm tra định dạng + trùng lặp; gửi email xác nhận
  thật nếu có `RESEND_API_KEY`, nếu không sẽ báo rõ "chế độ demo" thay vì giả vờ đã gửi.
- Bài đọc nhiều dựa trên `viewCount` (tăng mỗi lượt xem trang chi tiết).

**Mức 3 — Tài khoản & nội dung nâng cao**
- Đăng ký/đăng nhập thật qua NextAuth + bcrypt, session quản lý bằng JWT.
- Đăng bài viết kèm upload ảnh bìa (thành viên đã đăng nhập), sửa/xoá bài của chính mình.
- Bình luận yêu cầu đăng nhập, lọc nội dung rỗng/quá dài/thẻ HTML, xoá mềm bởi chủ bình luận
  hoặc admin.
- Paywall mô phỏng: bài đánh dấu Premium chỉ hiện ~110 từ đầu cho khách chưa đăng nhập — **kiểm
  soát ở server** (route trả về nội dung đã cắt, không phải ẩn bằng CSS), bất kỳ ai đăng nhập
  được xem là có quyền Premium (mô phỏng gói thành viên, không tích hợp thanh toán thật).
- Tóm tắt AI: gọi Claude thật nếu có `ANTHROPIC_API_KEY`; không có key → chế độ demo trích xuất
  câu trực tiếp từ bài viết, **ghi rõ nhãn "Chế độ demo"** trên giao diện, không giả vờ là AI thật.

**Tự điều chỉnh (`/admin`, chỉ ADMIN)**
- Thêm/xoá chuyên mục, bật/tắt hiển thị khối chuyên mục ở trang chủ.
- Sửa banner quảng cáo đầu trang + 3 banner xen kẽ, slogan, email liên hệ — không cần sửa code.
- Đánh dấu bài nổi bật trang chủ / bài Premium.

## 6. Giới hạn đã biết

- Nội dung 18 bài viết mẫu do AI soạn thảo để có dữ liệu chạy ngay — cần đội biên tập chỉnh sửa
  lại thành bài gốc trước khi dùng cho mục đích thực tế (đúng tinh thần mục 8 của bản yêu cầu).
- Ảnh bìa mẫu lấy từ Unsplash (miễn phí bản quyền) — nên thay bằng ảnh tự chụp/thiết kế khi đưa
  vào sử dụng thật.
- Chưa có trang quên mật khẩu — có thể bổ sung sau bằng luồng gửi email reset qua Resend.
- "Bài viết đã lưu" (saved articles) đã có sẵn trong schema database nhưng chưa có nút lưu ở
  giao diện — để dành cho giai đoạn mở rộng tiếp theo.
