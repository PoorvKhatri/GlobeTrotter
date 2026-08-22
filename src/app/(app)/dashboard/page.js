import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Plus,
  Plane,
  CalendarClock,
  Globe2,
  Wallet,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import Trip from "@/models/Trip";
import City from "@/models/City";
import { getCurrentUser } from "@/lib/auth";
import {
  serializeMany,
  tripStatus,
  tripTotalBudget,
  formatCurrency,
  unsplash,
} from "@/lib/utils";
import HeroSearch from "@/components/dashboard/HeroSearch";
import TripCard from "@/components/TripCard";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Loading";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await connectDB();
  const [tripDocs, cityDocs] = await Promise.all([
    Trip.find({ user: user.id }).sort({ updatedAt: -1 }).lean(),
    City.find().sort({ popularity: -1 }).limit(5).lean(),
  ]);

  const trips = serializeMany(tripDocs);
  const cities = serializeMany(cityDocs);

  const upcoming = trips.filter((t) => tripStatus(t.startDate, t.endDate) === "upcoming");
  const countries = new Set();
  trips.forEach((t) => t.stops?.forEach((s) => s.country && countries.add(s.country)));
  const totalBudget = trips.reduce((sum, t) => sum + tripTotalBudget(t), 0);

  const stats = [
    { label: "Total trips", value: trips.length, icon: Plane, tone: "bg-brand-50 text-brand-600" },
    { label: "Upcoming", value: upcoming.length, icon: CalendarClock, tone: "bg-coral-50 text-coral-600" },
    { label: "Countries", value: countries.size, icon: Globe2, tone: "bg-indigo-50 text-indigo-600" },
    { label: "Planned budget", value: formatCurrency(totalBudget), icon: Wallet, tone: "bg-amber-50 text-amber-600" },
  ];

  const firstName = user.firstName || user.name?.split(" ")[0] || "traveler";

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-3xl bg-hero-gradient p-8 sm:p-12">
        <div
          className="absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1600&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Welcome back, {firstName}!
          </span>
          <h1 className="mt-4 max-w-2xl font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Where will your next journey take you?
          </h1>
          <p className="mt-2 max-w-xl text-white/85">
            Plan multi-city adventures, estimate budgets, and bring your travel dreams to life.
          </p>
          <div className="mt-6">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card flex items-center gap-4 p-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink-900">{value}</p>
              <p className="text-sm text-ink-400">{label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Top Regional Selections */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">
            Top Regional Selections
            <span className="section-rule" />
          </h2>
          <Link href="/cities" className="hidden text-sm font-semibold text-brand-600 hover:underline sm:inline">
            Explore all cities →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {cities.map((c) => (
            <Link
              key={c.id}
              href={`/cities?q=${encodeURIComponent(c.name)}`}
              className="group relative h-40 overflow-hidden rounded-2xl bg-ink-100 shadow-card"
            >
              <img
                src={c.image || unsplash(c.name)}
                alt={c.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-display font-bold text-white">{c.name}</p>
                <p className="text-xs text-white/75">{c.country}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Previous / recent trips */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-title">
            Your Trips
            <span className="section-rule" />
          </h2>
          <Link href="/trips" className="hidden text-sm font-semibold text-brand-600 hover:underline sm:inline">
            View all →
          </Link>
        </div>

        {trips.length === 0 ? (
          <EmptyState
            icon={Plane}
            title="No trips yet"
            description="Start planning your first adventure — add cities, activities, and watch your itinerary come together."
            action={<Button href="/trips/new"><Plus className="h-4 w-4" /> Plan a trip</Button>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trips.slice(0, 6).map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
          </div>
        )}
      </section>

      {/* Floating plan-a-trip CTA */}
      <Link
        href="/trips/new"
        className="btn btn-coral fixed bottom-6 right-6 z-30 shadow-coral lg:hidden"
      >
        <Plus className="h-5 w-5" /> Plan a trip
      </Link>
    </div>
  );
}
