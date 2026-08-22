import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import City from "@/models/City";
import { serializeMany } from "@/lib/utils";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const region = searchParams.get("region");
  const sort = searchParams.get("sort") || "popularity";
  const limit = Math.min(Number(searchParams.get("limit")) || 60, 200);

  await connectDB();

  const filter = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
    ];
  }
  if (region && region !== "all") filter.region = region;

  const sortMap = {
    popularity: { popularity: -1 },
    name: { name: 1 },
    costLow: { costIndex: 1 },
    costHigh: { costIndex: -1 },
  };

  const cities = await City.find(filter)
    .sort(sortMap[sort] || sortMap.popularity)
    .limit(limit)
    .lean();

  return NextResponse.json({ cities: serializeMany(cities) });
}
