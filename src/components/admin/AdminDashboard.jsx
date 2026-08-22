"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Map,
  Globe,
  Building2,
  Compass,
  MessageSquareText,
  Wallet,
  TrendingUp,
  CalendarClock,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { PageLoader, EmptyState } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import api from "@/lib/api";

const PIE_COLORS = ["#14a89f", "#ff5a36", "#f59e0b", "#6366f1", "#ec4899", "#0ea5e9", "#22c55e", "#a855f7", "#f43f5e", "#84cc16"];

export default function AdminDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/admin/stats")
      .then((d) => setStats(d.stats))
      .catch((e) => toast.error(e.message || "Could not load analytics"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <PageLoader label="Crunching platform analytics…" />;
  if (!stats) return <EmptyState icon={BarChart3} title="No analytics available" />;

  const { totals, engagement, popularDestinations, categoryBreakdown, monthly, recentUsers, recentTrips } = stats;

  const kpis = [
    { label: "Total users", value: totals.users, icon: Users, tone: "bg-brand-50 text-brand-600" },
    { label: "Total trips", value: totals.trips, icon: Map, tone: "bg-coral-50 text-coral-600" },
    { label: "Public trips", value: totals.publicTrips, icon: Globe, tone: "bg-indigo-50 text-indigo-600" },
    { label: "Cities", value: totals.cities, icon: Building2, tone: "bg-amber-50 text-amber-600" },
    { label: "Activities", value: totals.activities, icon: Compass, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Community posts", value: totals.posts, icon: MessageSquareText, tone: "bg-pink-50 text-pink-600" },
  ];

  const engagementCards = [
    { label: "Total planned budget", value: formatCurrency(engagement.totalBudget), icon: Wallet },
    { label: "Avg budget / trip", value: formatCurrency(engagement.avgBudget), icon: TrendingUp },
    { label: "Avg trip length", value: `${engagement.avgTripNights} nights`, icon: CalendarClock },
    { label: "Trips / user", value: engagement.tripsPerUser, icon: Map },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-ink-900 p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-coral-500/20 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur">
            <ShieldCheck className="h-4 w-4" /> Admin & Analytics
          </span>
          <h1 className="mt-3 font-display text-2xl font-extrabold text-white sm:text-3xl">Platform overview</h1>
          <p className="mt-1 text-white/70">Monitor growth, engagement, and the most popular destinations across GlobeTrotter.</p>
        </div>
      </section>

      {/* KPI grid */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card p-4">
            <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-extrabold text-ink-900">{value}</p>
            <p className="text-sm text-ink-400">{label}</p>
          </div>
        ))}
      </section>

      {/* Growth + categories */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-1 font-display text-lg font-bold text-ink-900">Growth over time</h2>
          <p className="mb-4 text-sm text-ink-400">New users and trips created in the last 6 months</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14a89f" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#14a89f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff5a36" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ff5a36" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f4" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} width={40} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="users" name="Users" stroke="#14a89f" strokeWidth={2.5} fill="url(#gUsers)" />
                <Area type="monotone" dataKey="trips" name="Trips" stroke="#ff5a36" strokeWidth={2.5} fill="url(#gTrips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-1 font-display text-lg font-bold text-ink-900">Activity categories</h2>
          <p className="mb-4 text-sm text-ink-400">Most planned activity types</p>
          {categoryBreakdown.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2}>
                    {categoryBreakdown.map((d, i) => <Cell key={d.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-ink-400">No activity data yet.</p>
          )}
        </div>
      </section>

      {/* Popular destinations + engagement */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-1 font-display text-lg font-bold text-ink-900">Popular destinations</h2>
          <p className="mb-4 text-sm text-ink-400">Cities appearing most often in itineraries</p>
          {popularDestinations.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularDestinations} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef1f4" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#334155" }} tickLine={false} axisLine={false} width={90} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="count" name="Itineraries" radius={[0, 8, 8, 0]} fill="#14a89f" barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-ink-400">No destination data yet.</p>
          )}
        </div>

        <div className="space-y-4">
          {engagementCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="card flex items-center gap-4 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-100 text-ink-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-xl font-extrabold text-ink-900">{value}</p>
                <p className="text-sm text-ink-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tables */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-lg font-bold text-ink-900">Recent users</h2>
          </div>
          <div className="divide-y divide-ink-50">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={u.name} src={u.photo} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-900">{u.name}</p>
                  <p className="truncate text-xs text-ink-400">{u.email}</p>
                </div>
                {u.role === "admin" && <Badge tone="coral">Admin</Badge>}
                <span className="text-xs text-ink-400">{formatDate(u.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-lg font-bold text-ink-900">Recent trips</h2>
          </div>
          <div className="divide-y divide-ink-50">
            {recentTrips.map((t) => (
              <Link key={t.id} href={`/trips/${t.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink-50/60">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-900">{t.name}</p>
                  <p className="truncate text-xs text-ink-400">by {t.owner} · {t.stopsCount} stops</p>
                </div>
                {t.isPublic && <Badge tone="brand">Public</Badge>}
                <span className="text-sm font-semibold text-amber-600">{formatCurrency(t.budget)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
