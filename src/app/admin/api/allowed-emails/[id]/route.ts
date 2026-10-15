import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Chỉ quản trị viên được xoá email." }, { status: 403 });
  }

  await prisma.allowedEmail.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
