import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getTokenPayload, getCurrentUser } from "@/lib/auth";
import { serialize } from "@/lib/utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ user });
}

export async function PUT(request) {
  const payload = await getTokenPayload();
  if (!payload?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const allowed = [
      "firstName",
      "lastName",
      "phone",
      "city",
      "country",
      "additionalInfo",
      "photo",
      "language",
      "savedDestinations",
    ];
    const update = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }
    if ("firstName" in update || "lastName" in update) {
      const current = await connectDB().then(() => User.findById(payload.id).lean());
      const fn = update.firstName ?? current?.firstName ?? "";
      const ln = update.lastName ?? current?.lastName ?? "";
      update.name = `${fn} ${ln}`.trim() || current?.name;
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(payload.id, update, { new: true }).lean();
    return NextResponse.json({ user: serialize(user) });
  } catch (err) {
    console.error("profile update error", err);
    return NextResponse.json({ error: "Could not update profile." }, { status: 500 });
  }
}
