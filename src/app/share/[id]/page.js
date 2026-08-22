import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Wallet,
  Layers,
  Lock,
  Sparkles,
} from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import Trip from "@/models/Trip";
import User from "@/models/User";
import { getTokenPayload } from "@/lib/auth";
import {
  serialize,
  tripStatus,
  tripTotalBudget,
  budgetBreakdown,
  formatCurrency,
  formatDateRange,
  nightsBetween,
  unsplash,
  initials,
  CATEGORY_META,
} from "@/lib/utils";
import { TRIP_STATUS_META } from "@/lib/constants";
import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import ItineraryDisplay from "@/components/itinerary/ItineraryDisplay";
import CopyTripButton from "@/components/itinerary/CopyTripButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  await connectDB();
  const doc = await Trip.findById(id).lean().catch(() => null);
  if (!doc || !doc.isPublic) return { title: "Shared trip" };
  return {
    title: `${doc.name} — a travel itinerary`,
    description: doc.description || "A trip itinerary shared on GlobeTrotter.",
  };
}

function PublicShell({ children, loggedIn }) {
  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo href="/" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" href={loggedIn ? "/dashboard" : "/login"}>
              {loggedIn ? "My dashboard" : "Sign in"}
            </Button>
            <Button variant="coral" href="/register">
              <Sparkles className="h-4 w-4" /> Start planning
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t border-ink-100 py-8 text-center text-sm text-ink-400">
        Made with <span className="text-coral-500">♥</span> on GlobeTrotter — plan your next adventure.
      </footer>
    </div>
  );
}

export default async function SharePage({ params }) {
  const { id } = await params;
  const payload = await getTokenPayload();
  const loggedIn = Boolean(payload?.id);

  await connectDB();
  const doc = await Trip.findById(id)
    .populate("user", "name firstName photo city country")
    .lean()
    .catch(() => null);

  if (!doc) notFound();

  if (!doc.isPublic) {
    return (
      <PublicShell loggedIn={loggedIn}>
        <div className="mx-auto max-w-md rounded-3xl border border-ink-100 bg-white p-10 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="font-display text-xl font-bold text-ink-900">This trip is private</h1>
          <p className="mt-2 text-ink-500">The owner hasn&apos;t shared this itinerary publicly. Ask them for access, or start planning your own.</p>
          <div className="mt-6"><Button href="/register"><Sparkles className="h-4 w-4" /> Plan your own trip</Button></div>
        </div>
      </PublicShell>
    );
  }

  const author = doc.user || {};
  const trip = serialize({ ...doc, user: undefined });
  const status = tripStatus(trip.startDate, trip.endDate);
  const statusMeta = TRIP_STATUS_META[status];
  const total = tripTotalBudget(trip);
  const breakdown = budgetBreakdown(trip);
  const nights = nightsBetween(trip.startDate, trip.endDate);
  const stopCount = trip.stops?.length || 0;
  const activityCount = (trip.stops || []).reduce((n, s) => n + (s.activities?.length || 0), 0);
  const cover = trip.coverPhoto || unsplash(trip.stops?.[0]?.cityName || trip.name, 1600, 600);
  const authorName = author.firstName || author.name || "A traveler";

  const breakdownRows = Object.entries(CATEGORY_META).map(([key, meta]) => ({
    key, label: meta.label, color: meta.color, value: breakdown[key] || 0,
  }));

  return (
    <PublicShell loggedIn={loggedIn}>
      <div className="space-y-6">
        {/* Cover */}
        <section className="relative overflow-hidden rounded-3xl shadow-card">
          <div className="h-56 w-full sm:h-72">
            <img src={cover} alt={trip.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/30 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <span className={`badge ring-1 ${statusMeta.className}`}>{statusMeta.label}</span>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">{trip.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDateRange(trip.startDate, trip.endDate)}</span>
              {nights > 0 && <span>{nights} {nights === 1 ? "night" : "nights"}</span>}
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {stopCount} stops</span>
              <span className="inline-flex items-center gap-1.5"><Layers className="h-4 w-4" /> {activityCount} activities</span>
            </div>
          </div>
        </section>

        {/* Author + copy CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-3">
            {author.photo ? (
              <img src={author.photo} alt={authorName} className="h-11 w-11 rounded-full object-cover" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gradient font-bold text-white">{initials(authorName)}</span>
            )}
            <div>
              <p className="text-sm text-ink-400">Itinerary by</p>
              <p className="font-semibold text-ink-900">{authorName}{author.city ? ` · ${author.city}` : ""}</p>
            </div>
          </div>
          <CopyTripButton tripId={trip.id} />
        </div>

        {trip.description && <p className="max-w-3xl text-ink-600">{trip.description}</p>}

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <h2 className="section-title">Itinerary<span className="section-rule" /></h2>
            <ItineraryDisplay trip={trip} />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h3 className="flex items-center gap-2 font-display font-bold text-ink-900">
                <Wallet className="h-5 w-5 text-amber-500" /> Estimated budget
              </h3>
              <p className="mt-2 font-display text-3xl font-extrabold text-ink-900">{formatCurrency(total)}</p>
              {total > 0 && (
                <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-ink-100">
                  {breakdownRows.map((r) => r.value > 0 ? (
                    <div key={r.key} style={{ width: `${(r.value / total) * 100}%`, background: r.color }} />
                  ) : null)}
                </div>
              )}
              <ul className="mt-4 space-y-2.5">
                {breakdownRows.map((r) => (
                  <li key={r.key} className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2 text-ink-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                      {r.label}
                    </span>
                    <span className="font-semibold text-ink-800">{formatCurrency(r.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 rounded-2xl bg-hero-gradient p-5 text-white">
              <p className="font-display text-lg font-bold">Love this trip?</p>
              <p className="mt-1 text-sm text-white/85">Copy it to your account and make it your own — adjust dates, activities, and budget.</p>
              <div className="mt-3"><CopyTripButton tripId={trip.id} /></div>
            </div>
          </aside>
        </div>
      </div>
    </PublicShell>
  );
}
