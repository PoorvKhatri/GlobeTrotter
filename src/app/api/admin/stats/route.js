import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Trip from "@/models/Trip";
import User from "@/models/User";
import City from "@/models/City";
import Activity from "@/models/Activity";
import CommunityPost from "@/models/CommunityPost";
import { getCurrentUser } from "@/lib/auth";
import {
  tripTotalBudget,
  activitiesTotal,
  nightsBetween,
  serializeMany,
} from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  await connectDB();

  const [users, trips, cityCount, activityCount, postCount] = await Promise.all([
    User.find().select("name email role createdAt city country photo").sort({ createdAt: -1 }).lean(),
    Trip.find().populate("user", "name email").sort({ createdAt: -1 }).lean(),
    City.countDocuments(),
    Activity.countDocuments(),
    CommunityPost.countDocuments(),
  ]);

  // Popular destinations (by appearances in itineraries)
  const destCount = {};
  const categoryCount = {};
  let totalActivities = 0;
  let totalBudget = 0;
  let totalNights = 0;

  trips.forEach((t) => {
    totalBudget += tripTotalBudget(t);
    totalNights += nightsBetween(t.startDate, t.endDate);
    (t.stops || []).forEach((s) => {
      if (s.cityName) destCount[s.cityName] = (destCount[s.cityName] || 0) + 1;
      (s.activities || []).forEach((a) => {
        totalActivities += 1;
        if (a.category) categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
      });
    });
  });

  const popularDestinations = Object.entries(destCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const categoryBreakdown = Object.entries(categoryCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Last 6 months activity (users + trips)
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS[d.getMonth()], users: 0, trips: 0 });
  }
  const idx = Object.fromEntries(months.map((m, i) => [m.key, i]));
  const bucket = (date) => {
    const d = new Date(date);
    return idx[`${d.getFullYear()}-${d.getMonth()}`];
  };
  users.forEach((u) => { const i = bucket(u.createdAt); if (i != null) months[i].users += 1; });
  trips.forEach((t) => { const i = bucket(t.createdAt); if (i != null) months[i].trips += 1; });

  const publicTrips = trips.filter((t) => t.isPublic).length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  const stats = {
    totals: {
      users: users.length,
      trips: trips.length,
      publicTrips,
      cities: cityCount,
      activities: activityCount,
      posts: postCount,
      admins: adminCount,
    },
    engagement: {
      totalBudget: Math.round(totalBudget),
      avgBudget: trips.length ? Math.round(totalBudget / trips.length) : 0,
      totalActivities,
      avgTripNights: trips.length ? Math.round(totalNights / trips.length) : 0,
      tripsPerUser: users.length ? (trips.length / users.length).toFixed(1) : "0",
    },
    popularDestinations,
    categoryBreakdown,
    monthly: months.map(({ label, users, trips }) => ({ label, users, trips })),
    recentUsers: serializeMany(users.slice(0, 6)),
    recentTrips: serializeMany(
      trips.slice(0, 6).map((t) => ({
        _id: t._id,
        name: t.name,
        isPublic: t.isPublic,
        startDate: t.startDate,
        endDate: t.endDate,
        stopsCount: (t.stops || []).length,
        budget: Math.round(tripTotalBudget(t)),
        owner: t.user?.name || "Unknown",
        createdAt: t.createdAt,
      }))
    ),
  };

  return NextResponse.json({ stats });
}
