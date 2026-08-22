import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Trip from "@/models/Trip";
import { getTokenPayload } from "@/lib/auth";
import { serialize } from "@/lib/utils";

async function findOwned(id, userId) {
  try {
    return await Trip.findOne({ _id: id, user: userId });
  } catch {
    return null;
  }
}

export async function GET(request, { params }) {
  const { id } = await params;
  const payload = await getTokenPayload();
  await connectDB();

  let trip;
  try {
    trip = await Trip.findById(id).lean();
  } catch {
    trip = null;
  }
  if (!trip) return NextResponse.json({ error: "Trip not found." }, { status: 404 });

  const isOwner = payload?.id && String(trip.user) === payload.id;
  if (!trip.isPublic && !isOwner) {
    return NextResponse.json({ error: "This trip is private." }, { status: 403 });
  }

  return NextResponse.json({ trip: serialize(trip), isOwner });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const payload = await getTokenPayload();
  if (!payload?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trip = await connectDB().then(() => findOwned(id, payload.id));
  if (!trip) return NextResponse.json({ error: "Trip not found." }, { status: 404 });

  try {
    const body = await request.json();
    const fields = [
      "name",
      "description",
      "coverPhoto",
      "startDate",
      "endDate",
      "isPublic",
      "budgetBreakdown",
      "stops",
    ];
    for (const f of fields) {
      if (f in body) trip[f] = body[f];
    }
    await trip.save();
    return NextResponse.json({ trip: serialize(trip.toObject()) });
  } catch (err) {
    console.error("update trip error", err);
    return NextResponse.json({ error: "Could not update trip." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const payload = await getTokenPayload();
  if (!payload?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const trip = await findOwned(id, payload.id);
  if (!trip) return NextResponse.json({ error: "Trip not found." }, { status: 404 });

  await trip.deleteOne();
  return NextResponse.json({ ok: true });
}
