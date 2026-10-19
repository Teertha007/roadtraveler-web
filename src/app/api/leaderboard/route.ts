import { NextResponse } from "next/server";
import { db } from "@/lib/supabase/db";

export async function GET() {
  try {
    const leaderboard = await db.getLeaderboard();
    return NextResponse.json({ success: true, count: leaderboard.length, data: leaderboard });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
