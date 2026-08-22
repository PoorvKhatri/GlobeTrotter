import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Trip from "@/models/Trip";
import { getTokenPayload } from "@/lib/auth";
import { serialize } from "@/lib/utils";

/**
 * Clone a public (or owned) trip into the current user's account.
 */
export async function POST(request, { params }) {
  const payload = getTokenPayload();
  if (!payload?.id) {
    return NextResponse.json({ error: "Please sign in to copy this trip." }, { status: 401 });
  }

  await connectDB();

  let source;
  try {
    source = await Trip.findById(params.id).lean();
  } catch {
    source = null;
  }
  if (!source) return NextResponse.json({ error: "Trip not found." }, { status: 404 });

  const isOwner = String(source.user) === payload.id;
  if (!source.isPublic && !isOwner) {
    return NextResponse.json({ error: "This trip is private." }, { status: 403 });
  }

  // Strip subdocument ids so Mongoose assigns fresh ones.
  const stops = (source.stops || []).map((s) => ({
    cityName: s.cityName,
    country: s.country,
    image: s.image,
    startDate: s.startDate,
    endDate: s.endDate,
    order: s.order,
    notes: s.notes,
    activities: (s.activities || []).map((a) => ({
      name: a.name,
      description: a.description,
      category: a.category,
      date: a.date,
      time: a.time,
      cost: a.cost,
      duration: a.duration,
    })),
  }));

  const copy = await Trip.create({
    user: payload.id,
    name: `${source.name} (Copy)`,
    description: source.description,
    coverPhoto: source.coverPhoto,
    startDate: source.startDate,
    endDate: source.endDate,
    isPublic: false,
    budgetBreakdown: source.budgetBreakdown || {},
    stops,
  });

  return NextResponse.json({ trip: serialize(copy.toObject()) }, { status: 201 });
}
