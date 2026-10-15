import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isValidEmail } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Tên phải có ít nhất 2 ký tự.").max(80),
  email: z.string().trim().email("Email không hợp lệ."),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ." },
      { status: 400 }
    );
  }
  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase().trim();

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email không hợp lệ." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email này đã được đăng ký." }, { status: 409 });
  }

  const allowed = await prisma.allowedEmail.findUnique({ where: { email } });
  if (!allowed) {
    return NextResponse.json(
      {
        error:
          "Email này chưa được quản trị viên duyệt để đăng ký. Vui lòng liên hệ quản trị viên để được thêm vào danh sách.",
      },
      { status: 403 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "MEMBER" },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
