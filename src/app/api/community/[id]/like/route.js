import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CommunityPost from "@/models/CommunityPost";
import { getTokenPayload } from "@/lib/auth";

/** Toggle a like on a community post for the current user. */
export async function POST(request, { params }) {
  const { id } = await params;
  const payload = await getTokenPayload();
  if (!payload?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const post = await CommunityPost.findById(id).catch(() => null);
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  const uid = String(payload.id);
  const already = (post.likedBy || []).some((u) => String(u) === uid);

  if (already) {
    post.likedBy = post.likedBy.filter((u) => String(u) !== uid);
  } else {
    post.likedBy.push(payload.id);
  }
  post.likes = post.likedBy.length;
  await post.save();

  return NextResponse.json({ likes: post.likes, likedByMe: !already });
}
