import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Wallet,
  Layers,
  PieChart,
  Pencil,
  Globe,
  Lock,
} from "lucide-react";
import { connectDB } from "@/lib/mongodb";
import Trip from "@/models/Trip";
import { getCurrentUser } from "@/lib/auth";
import {
  serialize,
  tripStatus,
  tripTotalBudget,
  activitiesTotal,
  budgetBreakdown,
  formatCurrency,
  formatDateRange,
  nightsBetween,
  unsplash,
  CATEGORY_META,
} from "@/lib/utils";
import { TRIP_STATUS_META } from "@/lib/constants";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ItineraryDisplay from "@/components/itinerary/ItineraryDisplay";
import ShareButton from "@/components/itinerary/ShareButton";

export const dynamic = "force-dynamic";

export default async function TripViewPage({ params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await connectDB();
  const doc = await Trip.findById(id).lean().catch(() => null);
  if (!doc) notFound();

  const isOwner = String(doc.user) === String(user.id);
  if (!isOwner && !doc.isPublic) redirect("/trips");

  const trip = serialize(doc);
  const status = tripStatus(trip.startDate, trip.endDate);
  const statusMeta = TRIP_STATUS_META[status];
  const total = tripTotalBudget(trip);
  const breakdown = budgetBreakdown(trip);
  const nights = nightsBetween(trip.startDate, trip.endDate);
  const stopCount = trip.stops?.length || 0;
  const activityCount = (trip.stops || []).reduce((n, s) => n + (s.activities?.length || 0), 0);
  const cover = trip.coverPhoto || unsplash(trip.stops?.[0]?.cityName || trip.name, 1600, 600);

  const breakdownRows = Object.entries(CATEGORY_META).map(([key, meta]) => ({
    key,
    label: meta.label,
    color: meta.color,
    value: breakdown[key] || 0,
  }));

  return (
    <div className="space-y-6">
      <Link href="/trips" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> All trips
      </Link>

      {/* Cover header */}
      <section className="relative overflow-hidden rounded-3xl shadow-card">
        <div className="h-56 w-full sm:h-72">
          <img src={cover} alt={trip.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/30 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ring-1 ${statusMeta.className}`}>{statusMeta.label}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur">
              {trip.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {trip.isPublic ? "Public" : "Private"}
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">{trip.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/90">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDateRange(trip.startDate, trip.endDate)}</span>
            {nights > 0 && <span>{nights} {nights === 1 ? "night" : "nights"}</span>}
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {stopCount} {stopCount === 1 ? "stop" : "stops"}</span>
            <span className="inline-flex items-center gap-1.5"><Layers className="h-4 w-4" /> {activityCount} activities</span>
          </div>
        </div>
      </section>

      {/* Action bar (owner only) */}
      {isOwner && (
        <div className="flex flex-wrap items-center gap-2">
          <Button href={`/trips/${trip.id}/build`}><Layers className="h-4 w-4" /> Build itinerary</Button>
          <Button variant="outline" href={`/trips/${trip.id}/budget`}><PieChart className="h-4 w-4" /> Budget</Button>
          <Button variant="outline" href={`/trips/${trip.id}/edit`}><Pencil className="h-4 w-4" /> Edit details</Button>
          <ShareButton tripId={trip.id} isPublic={trip.isPublic} />
        </div>
      )}

      {trip.description && (
        <p className="max-w-3xl text-ink-600">{trip.description}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Itinerary */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Itinerary<span className="section-rule" /></h2>
            {isOwner && stopCount > 0 && (
              <Link href={`/trips/${trip.id}/build`} className="text-sm font-semibold text-brand-600 hover:underline">
                Edit sections →
              </Link>
            )}
          </div>
          <ItineraryDisplay trip={trip} />
        </div>

        {/* Budget summary card */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display font-bold text-ink-900">
                <Wallet className="h-5 w-5 text-amber-500" /> Budget
              </h3>
              <Link href={`/trips/${trip.id}/budget`} className="text-xs font-semibold text-brand-600 hover:underline">
                Details →
              </Link>
            </div>
            <p className="mt-2 font-display text-3xl font-extrabold text-ink-900">{formatCurrency(total)}</p>
            <p className="text-xs text-ink-400">Estimated total{nights > 0 ? ` · ${formatCurrency(Math.round(total / (nights || 1)))}/night` : ""}</p>

            {/* Stacked bar */}
            {total > 0 && (
              <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-ink-100">
                {breakdownRows.map((r) =>
                  r.value > 0 ? (
                    <div key={r.key} style={{ width: `${(r.value / total) * 100}%`, background: r.color }} title={`${r.label}: ${formatCurrency(r.value)}`} />
                  ) : null
                )}
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

          <div className="card p-5">
            <h3 className="mb-3 font-display font-bold text-ink-900">Trip at a glance</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-ink-500">Duration</dt><dd className="font-medium text-ink-800">{nights + (trip.startDate && trip.endDate ? 1 : 0)} days</dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">Destinations</dt><dd className="font-medium text-ink-800">{stopCount}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">Activities</dt><dd className="font-medium text-ink-800">{activityCount}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">Activity spend</dt><dd className="font-medium text-ink-800">{formatCurrency(activitiesTotal(trip))}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
