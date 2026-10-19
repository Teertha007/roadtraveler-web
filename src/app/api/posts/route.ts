import { NextResponse } from "next/server";
import { db } from "@/lib/supabase/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag") || undefined;
    const search = searchParams.get("search") || undefined;
    const tab = searchParams.get("tab") || undefined;

    const posts = await db.getPosts({ tag, search, tab });
    return NextResponse.json({ success: true, count: posts.length, data: posts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Post content cannot be empty." }, { status: 400 });
    }

    const newPost = await db.createPost({
      author: body.author || "Teertha",
      location: body.location || "USA Roadway",
      title: body.title,
      text: body.text,
      tag: body.tag || "#RoadTraveler",
    });

    return NextResponse.json({ success: true, data: newPost }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
