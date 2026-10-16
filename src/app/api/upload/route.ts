import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để tải ảnh lên." }, { status: 401 });
  }
  // Chỉ quản trị viên được tải ảnh (ảnh chỉ dùng cho bài viết, mà chỉ ADMIN đăng bài).
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Chỉ quản trị viên được tải ảnh lên." }, { status: 403 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Không tìm thấy file ảnh." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Ảnh tối đa 5MB." }, { status: 400 });
  }

  const ext = file.type.split("/")[1] || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // Có BLOB_READ_WRITE_TOKEN: upload lên Vercel Blob (store phải ở chế độ PUBLIC).
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`techzone/${filename}`, file, { access: "public" });
      return NextResponse.json({ url: blob.url }, { status: 201 });
    } catch (err) {
      console.error("[upload] Vercel Blob lỗi:", err);
      return NextResponse.json(
        { error: "Không tải ảnh lên được, kiểm tra cấu hình Vercel Blob (store phải ở chế độ Public)." },
        { status: 500 }
      );
    }
  }

  // Không có token: lưu tạm vào ổ đĩa local — CHỈ dùng khi chạy `npm run dev` trên máy thật.
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadsDir, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (err) {
    console.error("[upload] ghi file local lỗi:", err);
    return NextResponse.json(
      { error: "Không lưu được ảnh. Trên Vercel hãy cấu hình BLOB_READ_WRITE_TOKEN." },
      { status: 500 }
    );
  }
}
