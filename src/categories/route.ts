import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(categories);
}

const schema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(300).optional(),
  showOnHome: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Chỉ quản trị viên được tạo chuyên mục." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
      { status: 400 }
    );
  }

  const slug = slugify(parsed.data.name);
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) {
    return NextResponse.json({ error: "Chuyên mục này đã tồn tại." }, { status: 409 });
  }

  const maxOrder = await prisma.category.aggregate({ _max: { order: true } });
  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      showOnHome: parsed.data.showOnHome ?? true,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
