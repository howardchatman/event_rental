import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Call via Vercel Cron or manually: GET /api/cron/release-holds
export async function GET(request: Request) {
  // Optional: verify cron secret
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("release_expired_holds");

  if (error) {
    console.error("Failed to release holds:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }

  return NextResponse.json({ released: data });
}
