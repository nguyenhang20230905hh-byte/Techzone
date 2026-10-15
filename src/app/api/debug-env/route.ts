import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    tokenPrefix: process.env.BLOB_READ_WRITE_TOKEN
      ? process.env.BLOB_READ_WRITE_TOKEN.slice(0, 12)
      : null,
    vercelEnv: process.env.VERCEL_ENV || null,
  });
}
