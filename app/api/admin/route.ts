import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const adminEmail = process.env.ADMIN_EMAIL || "mouhamed.sarr2@univ-thies.sn";
  const adminPassword = process.env.ADMIN_PASSWORD || "280601.Sarr";
  if (email === adminEmail && password === adminPassword) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false }, { status: 401 });
}