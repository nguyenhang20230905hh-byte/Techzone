import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estimateReadingMinutes, extractContentImageUrls } from "@/lib/utils";
import { del } from "@vercel/blob";

const schema = z.object({
  title: z.string().trim().min(10).max(200).optional(),
  summary: z.string().trim().min(20).max(400).optional(),
  content: z.string().trim().min(400).optional(),
  coverImageUrl: z.string().url().optional(),
  categoryId: z.string().min(1).optional(),
  isPremium: z.boolean().optional(),
  isFeatured: z.boolean().optional(), // chỉ ADMIN mới thực sự đổi được (kiểm tra bên dưới)
});

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Chỉ quản trị viên được sửa bài." }, { status: 403 });
  }

  const article = await prisma.article.findUnique({ where: { slug: params.slug } });
  if (!article) return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Chỉ ADMIN được đổi cờ "bài nổi bật trang chủ".
  const isFeatured = role === "ADMIN" ? data.isFeatured : undefined;

  const updated = await prisma.article.update({
    where: { slug: params.slug },
    data: {
      ...(data.title ? { title: data.title } : {}),
      ...(data.summary ? { summary: data.summary } : {}),
      ...(data.content
        ? { content: data.content, readingMinutes: estimateReadingMinutes(data.content) }
        : {}),
      ...(data.coverImageUrl ? { coverImageUrl: data.coverImageUrl } : {}),
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      ...(data.isPremium !== undefined ? { isPremium: data.isPremium } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
    },
  });

  // Dọn ảnh cũ trên Vercel Blob khi sửa bài làm ảnh đó không còn được dùng nữa
  // (đổi ảnh bìa, hoặc gỡ/thay ảnh chèn trong nội dung). Không chặn việc lưu
  // bài nếu bước dọn dẹp này lỗi.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // Ảnh bìa cũ, nếu vừa bị thay bằng ảnh bìa khác.
    if (
      data.coverImageUrl &&
      data.coverImageUrl !== article.coverImageUrl &&
      article.coverImageUrl.includes(".blob.vercel-storage.com")
    ) {
      try {
        const stillUsed = await prisma.article.count({
          where: { coverImageUrl: article.coverImageUrl },
        });
        if (stillUsed === 0) await del(article.coverImageUrl);
      } catch (err) {
        console.error("[articles.PATCH] không xoá được ảnh bìa cũ trên Blob:", err);
      }
    }

    // Ảnh chèn trong nội dung cũ mà bản nội dung mới không còn dùng nữa.
    if (data.content) {
      const oldUrls = extractContentImageUrls(article.content).filter((url) =>
        url.includes(".blob.vercel-storage.com")
      );
      const newUrls = new Set(extractContentImageUrls(data.content));
      const removedUrls = oldUrls.filter((url) => !newUrls.has(url));
      for (const url of removedUrls) {
        try {
          const stillUsed = await prisma.article.count({ where: { content: { contains: url } } });
          if (stillUsed === 0) await del(url);
        } catch (err) {
          console.error("[articles.PATCH] không xoá được ảnh cũ trong nội dung trên Blob:", err);
        }
      }
    }
  }

  return NextResponse.json({ slug: updated.slug });
  } catch (err) {
    console.error("[articles.PATCH] lỗi không lường trước:", err);
    return NextResponse.json(
      { error: "Có lỗi xảy ra phía server, vui lòng thử lại." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Chỉ quản trị viên được xoá bài." }, { status: 403 });
  }

  const article = await prisma.article.findUnique({ where: { slug: params.slug } });
  if (!article) return NextResponse.json({ error: "Không tìm thấy bài viết." }, { status: 404 });

  await prisma.article.delete({ where: { slug: params.slug } });

  // Dọn ảnh bìa trên Vercel Blob (không chặn việc xoá bài nếu bước này lỗi).
  // Bỏ qua nếu ảnh vẫn đang được bài khác dùng chung.
  const coverUrl = article.coverImageUrl;
  if (process.env.BLOB_READ_WRITE_TOKEN && coverUrl.includes(".blob.vercel-storage.com")) {
    try {
      const stillUsed = await prisma.article.count({ where: { coverImageUrl: coverUrl } });
      if (stillUsed === 0) await del(coverUrl);
    } catch (err) {
      console.error("[articles.DELETE] không xoá được ảnh bìa trên Blob:", err);
    }
  }

  // Dọn các ảnh chèn trong nội dung bài viết trên Vercel Blob. Vì ảnh chèn
  // không có cột riêng trong DB (chỉ nằm trong text content), kiểm tra "còn
  // dùng ở bài khác không" bằng cách tìm URL đó trong content của các bài còn lại.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const contentImageUrls = extractContentImageUrls(article.content).filter((url) =>
      url.includes(".blob.vercel-storage.com")
    );
    for (const url of contentImageUrls) {
      try {
        const stillUsed = await prisma.article.count({ where: { content: { contains: url } } });
        if (stillUsed === 0) await del(url);
      } catch (err) {
        console.error("[articles.DELETE] không xoá được ảnh trong nội dung trên Blob:", err);
      }
    }
  }

  return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[articles.DELETE] lỗi không lường trước:", err);
    return NextResponse.json(
      { error: "Có lỗi xảy ra phía server, vui lòng thử lại." },
      { status: 500 }
    );
  }
}
