import { NextResponse } from "next/server";
import { db } from "@/lib/supabase/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : undefined;
    const lng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : undefined;
    const radius = searchParams.get("radius") ? parseFloat(searchParams.get("radius")!) : 50;

    const events = await db.getEvents({ lat, lng, radius });
    return NextResponse.json({ success: true, count: events.length, data: events });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
