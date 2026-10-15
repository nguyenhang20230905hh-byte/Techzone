import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const t = process.env.BLOB_READ_WRITE_TOKEN || "";
  return NextResponse.json({
    hasBlobToken: !!t,
    length: t.length,
    start: t.slice(0, 15),
    end: t.slice(-6),
    hasWhitespace: t !== t.trim(),
    vercelEnv: process.env.VERCEL_ENV || null,
    checkedAt: new Date().toISOString(),
  });
}
