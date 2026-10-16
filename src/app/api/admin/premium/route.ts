import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_MONTHS_AHEAD, addMonths } from "@/lib/plans";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("grant"),
    email: z.string().trim().toLowerCase().email(),
    months: z.number().int().min(1).max(MAX_MONTHS_AHEAD),
  }),
  z.object({
    action: z.literal("revoke"),
    email: z.string().trim().toLowerCase().email(),
  }),
]);

// ADMIN tặng thêm tháng Premium hoặc thu hồi Premium của một tài khoản (xác định theo email).
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Chỉ quản trị viên được thực hiện." }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
  const data = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true, premiumUntil: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy tài khoản với email này." }, { status: 404 });
  }

  if (data.action === "revoke") {
    await prisma.user.update({ where: { id: user.id }, data: { premiumUntil: null } });
    return NextResponse.json({ premiumUntil: null });
  }

  const now = new Date();
  const base = user.premiumUntil && user.premiumUntil > now ? user.premiumUntil : now;
  const until = addMonths(base, data.months);
  if (until > addMonths(now, MAX_MONTHS_AHEAD)) {
    return NextResponse.json(
      { error: `Hạn Premium tối đa là ${MAX_MONTHS_AHEAD} tháng kể từ hôm nay.` },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.order.create({
      data: {
        userId: user.id,
        planId: "grant",
        planName: `Quản trị viên tặng ${data.months} tháng`,
        months: data.months,
        amount: 0,
        method: "admin",
        status: "PAID",
        simulated: false,
      },
    }),
    prisma.user.update({ where: { id: user.id }, data: { premiumUntil: until } }),
  ]);

  return NextResponse.json({ premiumUntil: until.toISOString() });
}
