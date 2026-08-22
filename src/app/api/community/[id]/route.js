import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CommunityPost from "@/models/CommunityPost";
import { getTokenPayload } from "@/lib/auth";

/** Delete a community post (author only). */
export async function DELETE(request, { params }) {
  const { id } = await params;
  const payload = await getTokenPayload();
  if (!payload?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const post = await CommunityPost.findById(id).catch(() => null);
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (String(post.user) !== String(payload.id)) {
    return NextResponse.json({ error: "You can only delete your own posts." }, { status: 403 });
  }

  await post.deleteOne();
  return NextResponse.json({ ok: true });
}
