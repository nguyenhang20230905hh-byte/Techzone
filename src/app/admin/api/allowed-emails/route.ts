import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidEmail } from "@/lib/utils";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.role === "ADMIN";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Chỉ quản trị viên được xem danh sách này." }, { status: 403 });
  }
  const emails = await prisma.allowedEmail.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(emails);
}

const schema = z.object({
  email: z.string().trim().email("Email không hợp lệ."),
  note: z.string().trim().max(200).optional(),
});

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Chỉ quản trị viên được thêm email." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email không hợp lệ." }, { status: 400 });
  }

  const exists = await prisma.allowedEmail.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email này đã có trong danh sách." }, { status: 409 });
  }

  const allowedEmail = await prisma.allowedEmail.create({
    data: { email, note: parsed.data.note },
  });

  return NextResponse.json(allowedEmail, { status: 201 });
}
