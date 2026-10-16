import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";

export type ReaderAccess = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  premiumUntil: Date | null;
  /** Có được đọc đầy đủ bài Premium hay không (ADMIN hoặc Premium còn hạn). */
  canReadPremium: boolean;
};

export function isPremiumActive(premiumUntil: Date | null | undefined): boolean {
  return Boolean(premiumUntil && premiumUntil.getTime() > Date.now());
}

/**
 * Quyền đọc bài Premium được quyết định từ DATABASE, không dựa vào session/JWT
 * (JWT không tự cập nhật khi vừa mua gói hoặc bị thu hồi).
 */
export async function getReaderAccess(session: Session | null): Promise<ReaderAccess> {
  const user = session?.user as any;
  if (!user?.id) {
    return { isLoggedIn: false, isAdmin: false, premiumUntil: null, canReadPremium: false };
  }
  if (user.role === "ADMIN") {
    return { isLoggedIn: true, isAdmin: true, premiumUntil: null, canReadPremium: true };
  }
  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: { premiumUntil: true },
  });
  const premiumUntil = row?.premiumUntil ?? null;
  return {
    isLoggedIn: true,
    isAdmin: false,
    premiumUntil,
    canReadPremium: isPremiumActive(premiumUntil),
  };
}
