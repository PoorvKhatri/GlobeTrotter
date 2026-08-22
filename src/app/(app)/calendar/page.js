"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  ListTree,
  CalendarRange,
  Plane,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { PageLoader, EmptyState } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import {
  formatDateRange,
  nightsBetween,
  tripStatus,
  tripTotalBudget,
  formatCurrency,
} from "@/lib/utils";
import { TRIP_STATUS_META } from "@/lib/constants";
import api from "@/lib/api";

const TRIP_COLORS = ["#14a89f", "#ff5a36", "#f59e0b", "#6366f1", "#ec4899", "#0ea5e9", "#22c55e"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function CalendarPage() {
  const toast = useToast();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("timeline");
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });

  useEffect(() => {
    api
      .get("/api/trips")
      .then((d) => setTrips(d.trips || []))
      .catch(() => toast.error("Could not load your trips"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Assign a stable color per trip
  const colored = useMemo(
    () =>
      trips
        .filter((t) => t.startDate)
        .map((t, i) => ({ ...t, color: TRIP_COLORS[i % TRIP_COLORS.length] }))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
    [trips]
  );

  if (loading) return <PageLoader label="Loading your calendar…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold text-ink-900">
            <CalendarDays className="h-6 w-6 text-brand-500" /> Trip Calendar
          </h1>
          <p className="text-ink-500">See all your journeys on one timeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-ink-200 bg-white p-1">
            <button
              onClick={() => setView("timeline")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${view === "timeline" ? "bg-brand-500 text-white" : "text-ink-500 hover:text-ink-800"}`}
            >
              <ListTree className="h-4 w-4" /> Timeline
            </button>
            <button
              onClick={() => setView("month")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${view === "month" ? "bg-brand-500 text-white" : "text-ink-500 hover:text-ink-800"}`}
            >
              <CalendarRange className="h-4 w-4" /> Month
            </button>
          </div>
          <Button href="/trips/new"><Plus className="h-4 w-4" /> New trip</Button>
        </div>
      </div>

      {colored.length === 0 ? (
        <EmptyState
          icon={Plane}
          title="Nothing on the calendar yet"
          description="Plan a trip with dates and it'll show up here on your travel timeline."
          action={<Button href="/trips/new"><Plus className="h-4 w-4" /> Plan a trip</Button>}
        />
      ) : view === "timeline" ? (
        <TimelineView trips={colored} />
      ) : (
        <MonthView trips={colored} cursor={cursor} setCursor={setCursor} />
      )}
    </div>
  );
}

function TimelineView({ trips }) {
  // Group by "Month Year" of start date
  const groups = {};
  trips.forEach((t) => {
    const d = new Date(t.startDate);
    const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    (groups[key] ||= []).push(t);
  });

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([label, group]) => (
        <div key={label}>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="font-display text-lg font-bold text-ink-900">{label}</h2>
            <span className="h-px flex-1 bg-ink-100" />
            <span className="text-sm text-ink-400">{group.length} {group.length === 1 ? "trip" : "trips"}</span>
          </div>
          <div className="relative space-y-4 pl-6">
            <span className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-ink-100" />
            {group.map((t) => {
              const status = tripStatus(t.startDate, t.endDate);
              const meta = TRIP_STATUS_META[status];
              const nights = nightsBetween(t.startDate, t.endDate);
              const cities = (t.stops || []).map((s) => s.cityName).filter(Boolean);
              return (
                <Link
                  key={t.id}
                  href={`/trips/${t.id}`}
                  className="group relative block"
                >
                  <span
                    className="absolute -left-[22px] top-4 h-3.5 w-3.5 rounded-full border-2 border-white ring-2"
                    style={{ background: t.color, boxShadow: `0 0 0 2px ${t.color}` }}
                  />
                  <div className="card p-4 transition group-hover:-translate-y-0.5 group-hover:shadow-card">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-bold text-ink-900 group-hover:text-brand-600">{t.name}</h3>
                        <p className="text-sm text-ink-500">{formatDateRange(t.startDate, t.endDate)} · {nights} {nights === 1 ? "night" : "nights"}</p>
                      </div>
                      <span className={`badge ring-1 ${meta.className}`}>{meta.label}</span>
                    </div>
                    {/* Duration bar */}
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(8, nights * 8))}%`, background: t.color }} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {cities.slice(0, 4).map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2 py-0.5 text-xs text-ink-600">
                          <MapPin className="h-3 w-3 text-coral-500" /> {c}
                        </span>
                      ))}
                      {cities.length > 4 && <span className="text-xs text-ink-400">+{cities.length - 4} more</span>}
                      <span className="ml-auto text-sm font-semibold text-amber-600">{formatCurrency(tripTotalBudget(t))}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function MonthView({ trips, cursor, setCursor }) {
  const { year, month } = cursor;
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build 42 cells
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const today = startOfDay(new Date());

  function tripsOnDay(day) {
    const t0 = startOfDay(day).getTime();
    return trips.filter((t) => {
      if (!t.startDate) return false;
      const s = startOfDay(t.startDate).getTime();
      const e = startOfDay(t.endDate || t.startDate).getTime();
      return t0 >= s && t0 <= e;
    });
  }

  const prev = () => setCursor(month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
  const next = () => setCursor(month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });

  // Trips overlapping this month for the legend
  const monthStart = startOfDay(new Date(year, month, 1)).getTime();
  const monthEnd = startOfDay(new Date(year, month, daysInMonth)).getTime();
  const monthTrips = trips.filter((t) => {
    const s = startOfDay(t.startDate).getTime();
    const e = startOfDay(t.endDate || t.startDate).getTime();
    return s <= monthEnd && e >= monthStart;
  });

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-100 p-4">
        <h2 className="font-display text-xl font-bold text-ink-900">{MONTHS[month]} {year}</h2>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={() => setCursor({ year: new Date().getFullYear(), month: new Date().getMonth() })} className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-500 hover:bg-ink-100">Today</button>
          <button onClick={next} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-ink-100 bg-ink-50/50">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-400">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const dayTrips = day ? tripsOnDay(day) : [];
          const isToday = day && startOfDay(day).getTime() === today.getTime();
          return (
            <div key={i} className={`min-h-[92px] border-b border-r border-ink-100 p-1.5 ${!day ? "bg-ink-50/40" : ""} ${i % 7 === 6 ? "border-r-0" : ""}`}>
              {day && (
                <>
                  <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday ? "bg-coral-500 text-white" : "text-ink-500"}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayTrips.slice(0, 3).map((t) => (
                      <Link
                        key={t.id}
                        href={`/trips/${t.id}`}
                        className="block truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium text-white"
                        style={{ background: t.color }}
                        title={t.name}
                      >
                        {t.name}
                      </Link>
                    ))}
                    {dayTrips.length > 3 && <p className="px-1 text-[11px] text-ink-400">+{dayTrips.length - 3} more</p>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {monthTrips.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 p-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">This month</span>
          {monthTrips.map((t) => (
            <Link key={t.id} href={`/trips/${t.id}`} className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />
              {t.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
