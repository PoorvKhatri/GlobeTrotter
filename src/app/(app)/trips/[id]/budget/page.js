"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  PieChart as PieIcon,
  ArrowLeft,
  Wallet,
  Save,
  TriangleAlert,
  TrendingUp,
  CalendarDays,
  Layers,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Button from "@/components/ui/Button";
import { PageLoader, EmptyState } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import {
  formatCurrency,
  activitiesTotal,
  nightsBetween,
  daysBetween,
  CATEGORY_META,
} from "@/lib/utils";
import api from "@/lib/api";

const FIELDS = [
  { key: "transport", label: "Transport", hint: "Flights, trains, transfers" },
  { key: "stay", label: "Accommodation", hint: "Hotels, hostels, rentals" },
  { key: "meals", label: "Food & Meals", hint: "Restaurants, groceries" },
];

export default function BudgetPage() {
  const { id } = useParams();
  const toast = useToast();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [budget, setBudget] = useState({ transport: 0, stay: 0, meals: 0, activities: 0 });
  const [target, setTarget] = useState("");

  useEffect(() => {
    api
      .get(`/api/trips/${id}`)
      .then((d) => {
        setTrip(d.trip);
        const b = d.trip.budgetBreakdown || {};
        setBudget({
          transport: Number(b.transport) || 0,
          stay: Number(b.stay) || 0,
          meals: Number(b.meals) || 0,
          activities: Number(b.activities) || activitiesTotal(d.trip),
        });
      })
      .catch((e) => toast.error(e.message || "Could not load trip"))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const derivedActivities = useMemo(() => (trip ? activitiesTotal(trip) : 0), [trip]);

  function setField(key, val) {
    setBudget((b) => ({ ...b, [key]: Number(val) || 0 }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      await api.put(`/api/trips/${id}`, { budgetBreakdown: budget });
      setDirty(false);
      toast.success("Budget saved");
    } catch (e) {
      toast.error(e.message || "Could not save budget");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader label="Crunching the numbers…" />;
  if (!trip) return <EmptyState icon={Wallet} title="Trip not found" />;

  const total = budget.transport + budget.stay + budget.meals + budget.activities;
  const days = daysBetween(trip.startDate, trip.endDate) || 1;
  const nights = nightsBetween(trip.startDate, trip.endDate);
  const perDay = Math.round(total / days);

  const pieData = Object.entries(CATEGORY_META)
    .map(([key, meta]) => ({ name: meta.label, key, value: budget[key] || 0, color: meta.color }))
    .filter((d) => d.value > 0);

  // Per-stop activity spend
  const stopData = (trip.stops || []).map((s) => ({
    name: s.cityName || "Stop",
    spend: (s.activities || []).reduce((a, act) => a + (Number(act.cost) || 0), 0),
  }));

  const targetNum = Number(target) || 0;
  const over = targetNum > 0 && total > targetNum;
  const largest = pieData.slice().sort((a, b) => b.value - a.value)[0];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <Link href={`/trips/${id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to trip
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-600">
            <PieIcon className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Budget & Cost Breakdown</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900">{trip.name}</h1>
        </div>
        <Button onClick={save} disabled={saving || !dirty}>
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save budget"}
        </Button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric icon={Wallet} tone="bg-amber-50 text-amber-600" label="Estimated total" value={formatCurrency(total)} />
        <Metric icon={CalendarDays} tone="bg-brand-50 text-brand-600" label="Avg / day" value={formatCurrency(perDay)} sub={`${days} days`} />
        <Metric icon={Layers} tone="bg-indigo-50 text-indigo-600" label="Activities" value={formatCurrency(budget.activities)} sub={`${(trip.stops || []).reduce((n, s) => n + (s.activities?.length || 0), 0)} planned`} />
        <Metric icon={TrendingUp} tone="bg-coral-50 text-coral-600" label="Top category" value={largest ? largest.name : "—"} sub={largest ? formatCurrency(largest.value) : ""} />
      </div>

      {over && (
        <div className="flex items-start gap-3 rounded-2xl border border-coral-200 bg-coral-50 p-4 text-coral-700">
          <TriangleAlert className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Over budget by {formatCurrency(total - targetNum)}</p>
            <p className="text-sm text-coral-600/90">Your estimated total {formatCurrency(total)} exceeds your target of {formatCurrency(targetNum)}. Trim activities or adjust categories below.</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie breakdown */}
        <div className="card p-6">
          <h2 className="mb-1 font-display text-lg font-bold text-ink-900">Where the money goes</h2>
          <p className="mb-4 text-sm text-ink-400">Share of total by category</p>
          {total > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                    {pieData.map((d) => <Cell key={d.key} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-ink-400">Add costs below to see the breakdown.</p>
          )}
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <li key={key} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-1.5 text-sm">
                <span className="inline-flex items-center gap-2 text-ink-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
                  {meta.label}
                </span>
                <span className="font-semibold text-ink-800">{formatCurrency(budget[key] || 0)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Per-stop bar */}
        <div className="card p-6">
          <h2 className="mb-1 font-display text-lg font-bold text-ink-900">Activity spend by stop</h2>
          <p className="mb-4 text-sm text-ink-400">Planned activity costs per destination</p>
          {stopData.some((d) => d.spend > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stopData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f4" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={56} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="spend" radius={[8, 8, 0, 0]} fill="#14a89f" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-ink-400">No activity costs yet. Add activities in the itinerary builder.</p>
          )}
        </div>
      </div>

      {/* Editable categories */}
      <div className="card p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Adjust your estimates</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="label flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_META[f.key].color }} />
                {f.label}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">$</span>
                <input
                  type="number"
                  min="0"
                  value={budget[f.key]}
                  onChange={(e) => setField(f.key, e.target.value)}
                  className="input pl-7"
                />
              </div>
              <p className="mt-1 text-xs text-ink-400">{f.hint}</p>
            </div>
          ))}
          <div>
            <label className="label flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_META.activities.color }} />
              Activities
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">$</span>
              <input
                type="number"
                min="0"
                value={budget.activities}
                onChange={(e) => setField("activities", e.target.value)}
                className="input pl-7"
              />
            </div>
            <button
              type="button"
              onClick={() => setField("activities", derivedActivities)}
              className="mt-1 text-xs font-medium text-brand-600 hover:underline"
            >
              Sync from itinerary ({formatCurrency(derivedActivities)})
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-4 border-t border-ink-100 pt-5">
          <div>
            <label className="label">Budget target (optional)</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">$</span>
              <input
                type="number"
                min="0"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Set a cap to track over-budget"
                className="input w-56 pl-7"
              />
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-ink-400">Estimated total</p>
            <p className={`font-display text-3xl font-extrabold ${over ? "text-coral-600" : "text-ink-900"}`}>{formatCurrency(total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, tone, label, value, sub }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-ink-900">{value}</p>
        <p className="text-xs text-ink-400">{label}{sub ? ` · ${sub}` : ""}</p>
      </div>
    </div>
  );
}
