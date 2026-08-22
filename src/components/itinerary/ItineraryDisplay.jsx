import {
  MapPin,
  Clock,
  CalendarDays,
  Wallet,
  Sparkles,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDateRange, nightsBetween } from "@/lib/utils";

/**
 * Read-only day-wise itinerary display used on the trip view and public
 * share pages. Renders each stop as a section with an activity timeline
 * and a per-activity expense column.
 */
export default function ItineraryDisplay({ trip }) {
  const stops = trip.stops || [];

  if (stops.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-10 text-center text-ink-500">
        <Sparkles className="mx-auto mb-3 h-8 w-8 text-brand-300" />
        This itinerary doesn&apos;t have any stops yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stops.map((stop, i) => {
        const activities = stop.activities || [];
        const stopBudget = activities.reduce((s, a) => s + (Number(a.cost) || 0), 0);
        const nights = nightsBetween(stop.startDate, stop.endDate);

        return (
          <section key={stop._id || i} className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-gradient-to-r from-brand-50 to-transparent px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink-900">
                    {stop.cityName}
                    {stop.country ? <span className="font-normal text-ink-400">, {stop.country}</span> : ""}
                  </h3>
                  <p className="flex items-center gap-2 text-xs text-ink-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDateRange(stop.startDate, stop.endDate)}
                    {nights > 0 && <span>· {nights} {nights === 1 ? "night" : "nights"}</span>}
                  </p>
                </div>
              </div>
              <Badge tone="amber" className="text-sm">
                <Wallet className="h-3.5 w-3.5" /> {formatCurrency(stopBudget)}
              </Badge>
            </div>

            <div className="p-5">
              {stop.notes && (
                <p className="mb-4 rounded-xl bg-ink-50 px-4 py-2.5 text-sm text-ink-600">{stop.notes}</p>
              )}

              {activities.length === 0 ? (
                <p className="text-sm text-ink-400">No activities planned for this stop yet.</p>
              ) : (
                <>
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-400">
                    <span>Activity</span>
                    <span>Expense</span>
                  </div>
                  <ol className="relative space-y-0">
                    {activities.map((a, idx) => (
                      <li key={a._id || idx} className="relative flex items-start gap-4 pb-5 pl-6 last:pb-0">
                        {/* timeline line + dot */}
                        <span className="absolute left-[7px] top-2 h-full w-px bg-ink-100 last:hidden" />
                        <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-brand-400 bg-white" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-ink-900">{a.name}</p>
                            <Badge tone="ink">{a.category}</Badge>
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-ink-400">
                            {a.time && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {a.time}</span>}
                            {a.duration && <span>{a.duration}</span>}
                            {a.description && <span className="line-clamp-1">{a.description}</span>}
                          </div>
                        </div>
                        <span className="flex-shrink-0 font-semibold text-ink-800">
                          {a.cost > 0 ? formatCurrency(a.cost) : <span className="text-ink-300">Free</span>}
                        </span>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
