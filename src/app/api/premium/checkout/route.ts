import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  MAX_MONTHS_AHEAD,
  PAYMENT_SIMULATED,
  addMonths,
  getPlan,
  isPaymentMethod,
} from "@/lib/plans";

const schema = z.object({
  planId: z.string(),
  method: z.string(),
});

// Thanh toán MÔ PHỎNG: không có tiền thật chạy. Giá luôn lấy từ PLANS ở server,
// không bao giờ tin số tiền client gửi lên.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để đăng ký Premium." }, { status: 401 });
  }

  if (!PAYMENT_SIMULATED) {
    return NextResponse.json(
      { error: "Cổng thanh toán chưa được cấu hình." },
      { status: 503 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
  const plan = getPlan(parsed.data.planId);
  if (!plan) return NextResponse.json({ error: "Gói không tồn tại." }, { status: 400 });
  if (!isPaymentMethod(parsed.data.method)) {
    return NextResponse.json({ error: "Phương thức thanh toán không hợp lệ." }, { status: 400 });
  }
  const method = parsed.data.method;

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { premiumUntil: true },
    });
    if (!user) return { error: "Không tìm thấy tài khoản.", status: 404 as const };

    const now = new Date();
    // Gia hạn: cộng nối tiếp vào hạn hiện tại nếu còn hạn, ngược lại tính từ hôm nay.
    const base = user.premiumUntil && user.premiumUntil > now ? user.premiumUntil : now;
    const until = addMonths(base, plan.months);
    if (until > addMonths(now, MAX_MONTHS_AHEAD)) {
      return {
        error: `Hạn Premium tối đa là ${MAX_MONTHS_AHEAD} tháng kể từ hôm nay.`,
        status: 400 as const,
      };
    }

    const order = await tx.order.create({
      data: {
        userId,
        planId: plan.id,
        planName: plan.name,
        months: plan.months,
        amount: plan.price,
        method,
        status: "PAID",
        simulated: true,
      },
      select: { id: true },
    });
    await tx.user.update({ where: { id: userId }, data: { premiumUntil: until } });
    return { orderId: order.id, until };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(
    { orderId: result.orderId, premiumUntil: result.until.toISOString() },
    { status: 201 }
  );
}
