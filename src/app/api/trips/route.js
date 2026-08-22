import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Trip from "@/models/Trip";
import { getTokenPayload } from "@/lib/auth";
import { serialize, serializeMany } from "@/lib/utils";

export async function GET() {
  const payload = await getTokenPayload();
  if (!payload?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const trips = await Trip.find({ user: payload.id }).sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ trips: serializeMany(trips) });
}

export async function POST(request) {
  const payload = await getTokenPayload();
  if (!payload?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Trip name is required." }, { status: 400 });
    }

    await connectDB();
    const trip = await Trip.create({
      user: payload.id,
      name: body.name.trim(),
      description: body.description || "",
      coverPhoto: body.coverPhoto || "",
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      isPublic: Boolean(body.isPublic),
      budgetBreakdown: body.budgetBreakdown || {},
      stops: Array.isArray(body.stops) ? body.stops : [],
    });

    return NextResponse.json({ trip: serialize(trip.toObject()) }, { status: 201 });
  } catch (err) {
    console.error("create trip error", err);
    return NextResponse.json({ error: "Could not create trip." }, { status: 500 });
  }
}
