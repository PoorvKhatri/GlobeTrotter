import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Activity from "@/models/Activity";
import { serializeMany } from "@/lib/utils";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const city = searchParams.get("city");
  const sort = searchParams.get("sort") || "popularity";
  const limit = Math.min(Number(searchParams.get("limit")) || 60, 200);

  await connectDB();

  const filter = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
    ];
  }
  if (category && category !== "all") filter.category = category;
  if (city) filter.city = { $regex: city, $options: "i" };

  const sortMap = {
    popularity: { popularity: -1 },
    rating: { rating: -1 },
    costLow: { cost: 1 },
    costHigh: { cost: -1 },
    name: { name: 1 },
  };

  const activities = await Activity.find(filter)
    .sort(sortMap[sort] || sortMap.popularity)
    .limit(limit)
    .lean();

  return NextResponse.json({ activities: serializeMany(activities) });
}
