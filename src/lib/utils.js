import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names conditionally. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Format a number as currency. */
export function formatCurrency(amount, currency = "USD") {
  const n = Number(amount) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

/** Short date, e.g. "Aug 22, 2026". */
export function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Aug 22 – Sep 3, 2026" style range. */
export function formatDateRange(start, end) {
  if (!start && !end) return "Dates not set";
  const s = start ? new Date(start) : null;
  const e = end ? new Date(end) : null;
  const opts = { month: "short", day: "numeric" };
  if (s && e) {
    const sameYear = s.getFullYear() === e.getFullYear();
    const left = s.toLocaleDateString("en-US", opts);
    const right = e.toLocaleDateString("en-US", { ...opts, year: "numeric" });
    return sameYear ? `${left} – ${right}` : `${s.toLocaleDateString("en-US", { ...opts, year: "numeric" })} – ${right}`;
  }
  return formatDate(s || e);
}

/** Whole number of nights between two dates. */
export function nightsBetween(start, end) {
  if (!start || !end) return 0;
  const ms = new Date(end) - new Date(start);
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

/** Number of days (inclusive) between two dates. */
export function daysBetween(start, end) {
  return nightsBetween(start, end) + (start && end ? 1 : 0);
}

/** Derive a trip status from its date range. */
export function tripStatus(startDate, endDate) {
  const now = new Date();
  const s = startDate ? new Date(startDate) : null;
  const e = endDate ? new Date(endDate) : null;
  if (s && now < s) return "upcoming";
  if (s && e && now >= s && now <= endOfDay(e)) return "ongoing";
  if (e && now > endOfDay(e)) return "completed";
  return "upcoming";
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** Sum every activity cost inside a trip's stops. */
export function activitiesTotal(trip) {
  if (!trip?.stops) return 0;
  return trip.stops.reduce((sum, stop) => {
    const acts = stop.activities || [];
    return sum + acts.reduce((a, act) => a + (Number(act.cost) || 0), 0);
  }, 0);
}

/** Total estimated budget = breakdown overrides + activity costs. */
export function tripTotalBudget(trip) {
  const b = trip?.budgetBreakdown || {};
  const base =
    (Number(b.transport) || 0) +
    (Number(b.stay) || 0) +
    (Number(b.meals) || 0);
  const activities = Number(b.activities) || activitiesTotal(trip);
  return base + activities;
}

/** Build a normalized budget breakdown for charts. */
export function budgetBreakdown(trip) {
  const b = trip?.budgetBreakdown || {};
  return {
    transport: Number(b.transport) || 0,
    stay: Number(b.stay) || 0,
    meals: Number(b.meals) || 0,
    activities: Number(b.activities) || activitiesTotal(trip),
  };
}

export const CATEGORY_META = {
  transport: { label: "Transport", color: "#14a89f", icon: "Plane" },
  stay: { label: "Accommodation", color: "#ff5a36", icon: "Hotel" },
  activities: { label: "Activities", color: "#f59e0b", icon: "Ticket" },
  meals: { label: "Food & Meals", color: "#6366f1", icon: "Utensils" },
};

/**
 * Deterministic, keyword-relevant placeholder image URL (no API key needed).
 * Uses LoremFlickr, which pulls a Flickr photo matching the keywords; the
 * `lock` seed is derived from the keyword so the same subject always resolves
 * to the same image (no layout shift, stable across reloads).
 */
export function unsplash(keyword, w = 800, h = 600) {
  const kw = String(keyword || "travel").toLowerCase().trim();
  // Use the two most meaningful words + "travel" for relevant results.
  const tags = encodeURIComponent(
    [...kw.split(/[\s,]+/).filter(Boolean).slice(0, 2), "travel"].join(",")
  );
  let lock = 7;
  for (let i = 0; i < kw.length; i++) lock = (lock * 31 + kw.charCodeAt(i)) % 100000;
  return `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;
}

/** Avatar fallback via ui-avatars. */
export function avatarUrl(name) {
  const n = encodeURIComponent(name || "Traveler");
  return `https://ui-avatars.com/api/?name=${n}&background=14a89f&color=fff&bold=true`;
}

/** Truncate helper. */
export function truncate(str, n = 120) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n).trim() + "…" : str;
}

export function initials(name) {
  if (!name) return "GT";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Convert a Mongoose lean doc into a plain, JSON-safe object with `id`. */
export function serialize(doc) {
  if (!doc) return doc;
  const obj = JSON.parse(JSON.stringify(doc));
  if (obj._id) {
    obj.id = obj._id;
    delete obj._id;
  }
  return obj;
}

export function serializeMany(docs = []) {
  return docs.map(serialize);
}

/** ISO date string for <input type="date"> value. */
export function toDateInput(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
}
