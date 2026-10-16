import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify, estimateReadingMinutes } from "@/lib/utils";

const schema = z.object({
  title: z.string().trim().min(10, "Tiêu đề quá ngắn.").max(200),
  summary: z.string().trim().min(20, "Tóm tắt quá ngắn.").max(400),
  content: z.string().trim().min(400, "Nội dung bài viết nên có ít nhất khoảng 400 ký tự."),
  coverImageUrl: z.string().url("Ảnh bìa không hợp lệ."),
  categoryId: z.string().min(1, "Vui lòng chọn chuyên mục."),
  tags: z.array(z.string().trim().min(1)).max(8).optional(),
  isPremium: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Bạn cần đăng nhập để đăng bài." }, { status: 401 });
    }
    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Chỉ quản trị viên được đăng bài." }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Chuyên mục không tồn tại." }, { status: 400 });
    }

    const baseSlug = slugify(data.title);
    let slug = baseSlug;
    let n = 1;
    while (await prisma.article.findUnique({ where: { slug } })) {
      n += 1;
      slug = `${baseSlug}-${n}`;
    }

    const tagNames = Array.from(new Set((data.tags || []).map((t) => t.trim()).filter(Boolean)));
    const tagRecords = await Promise.all(
      tagNames.map(async (name) => {
        const tagSlug = slugify(name);
        return prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name, slug: tagSlug },
        });
      })
    );

    const article = await prisma.article.create({
      data: {
        slug,
        title: data.title,
        summary: data.summary,
        content: data.content,
        coverImageUrl: data.coverImageUrl,
        readingMinutes: estimateReadingMinutes(data.content),
        isPremium: Boolean(data.isPremium),
        authorId: (session.user as any).id,
        categoryId: data.categoryId,
        tags: { create: tagRecords.map((t) => ({ tagId: t.id })) },
      },
    });

    return NextResponse.json({ slug: article.slug }, { status: 201 });
  } catch (err) {
    // Luôn trả JSON kể cả khi có lỗi không lường trước (DB lỗi, timeout...),
    // để phía client không bị crash lúc đọc res.json() với response rỗng.
    console.error("[articles.POST] lỗi không lường trước:", err);
    return NextResponse.json(
      { error: "Có lỗi xảy ra phía server, vui lòng thử lại." },
      { status: 500 }
    );
  }
}
