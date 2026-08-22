import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CommunityPost from "@/models/CommunityPost";
import { getCurrentUser, getTokenPayload } from "@/lib/auth";
import { serializeMany, serialize } from "@/lib/utils";

export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const tag = searchParams.get("tag");
  const sort = searchParams.get("sort") || "recent";

  const filter = {};
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { content: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
    ];
  }
  if (tag && tag !== "all") filter.tags = tag;

  const sortMap = {
    recent: { createdAt: -1 },
    popular: { likes: -1, createdAt: -1 },
  };

  const posts = await CommunityPost.find(filter)
    .sort(sortMap[sort] || sortMap.recent)
    .limit(60)
    .lean();

  const payload = getTokenPayload();
  const userId = payload?.id ? String(payload.id) : null;
  const withLiked = posts.map((p) => ({
    ...p,
    likedByMe: userId ? (p.likedBy || []).some((u) => String(u) === userId) : false,
  }));

  return NextResponse.json({ posts: serializeMany(withLiked) });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }

    const tags = Array.isArray(body.tags)
      ? body.tags
      : String(body.tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

    const post = await CommunityPost.create({
      user: user.id,
      authorName: user.name || user.firstName || "Traveler",
      authorPhoto: user.photo || "",
      title: body.title.trim(),
      content: body.content.trim(),
      location: body.location?.trim() || "",
      activity: body.activity?.trim() || "",
      image: body.image || "",
      trip: body.trip || undefined,
      tags,
    });

    return NextResponse.json({ post: serialize(post.toObject()) }, { status: 201 });
  } catch (err) {
    console.error("create post error", err);
    return NextResponse.json({ error: "Could not create post." }, { status: 500 });
  }
}
