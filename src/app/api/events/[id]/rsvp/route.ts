import { NextResponse } from "next/server";
import { db } from "@/lib/supabase/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status === "going" ? "going" : "interested";
    const result = await db.rsvpEvent(id, status);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
