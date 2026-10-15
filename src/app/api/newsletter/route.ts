import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEmail } from "@/lib/utils";
import { sendNewsletterConfirmation, notifyAdminNewSubscriber } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = (body?.email || "").toString().trim().toLowerCase();

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Email không hợp lệ." }, { status: 400 });
  }

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email này đã đăng ký rồi." }, { status: 409 });
  }

  const { sent } = await sendNewsletterConfirmation(email);

  await prisma.newsletterSubscriber.create({
    data: { email, isConfirmed: sent },
  });

  // Báo cho admin biết — không chặn phản hồi nếu gửi mail lỗi/chưa cấu hình.
  notifyAdminNewSubscriber(email).catch(() => {});

  return NextResponse.json({ ok: true, emailSent: sent }, { status: 201 });
}
