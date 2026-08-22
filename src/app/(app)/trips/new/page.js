"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plane,
  Calendar,
  MapPin,
  Search,
  Plus,
  X,
  ImageIcon,
  Sparkles,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { EmptyState, Spinner } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import { unsplash, toDateInput } from "@/lib/utils";
import api from "@/lib/api";

export default function CreateTripPage() {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
    coverPhoto: "",
    startDate: "",
    endDate: "",
    isPublic: false,
  });
  const [destinations, setDestinations] = useState([]);
  const [cityQuery, setCityQuery] = useState("");
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target?.type === "checkbox" ? e.target.checked : e.target.value }));

  useEffect(() => {
    api.get("/api/cities?limit=6").then((d) => setSuggestions(d.cities || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!cityQuery.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      setSearching(true);
      api
        .get(`/api/cities?q=${encodeURIComponent(cityQuery)}&limit=6`)
        .then((d) => setResults(d.cities || []))
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [cityQuery]);

  function addDestination(city) {
    if (destinations.some((d) => d.name === city.name)) {
      toast.info(`${city.name} is already added`);
      return;
    }
    setDestinations((d) => [...d, city]);
    setCityQuery("");
    setResults([]);
  }

  function removeDestination(name) {
    setDestinations((d) => d.filter((c) => c.name !== name));
  }

  async function save(goToBuilder) {
    if (!form.name.trim()) {
      toast.error("Please give your trip a name");
      return;
    }
    setSaving(true);
    try {
      const stops = destinations.map((c, i) => ({
        cityName: c.name,
        country: c.country || "",
        image: c.image || "",
        order: i,
        activities: [],
      }));
      const cover = form.coverPhoto || destinations[0]?.image || "";
      const { trip } = await api.post("/api/trips", { ...form, coverPhoto: cover, stops });
      toast.success("Trip created! Let's build your itinerary.");
      router.push(goToBuilder ? `/trips/${trip.id}/build` : `/trips/${trip.id}`);
    } catch (err) {
      toast.error(err.message || "Could not create trip");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold text-ink-900">
          <Plane className="h-6 w-6 text-brand-500" /> Plan a new trip
        </h1>
        <p className="text-ink-500">Give your journey a name, set the dates, and choose where you&apos;re headed.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Form */}
        <Card className="p-6">
          <div className="space-y-5">
            <div>
              <label className="label">Trip name</label>
              <input
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. European Summer Escape"
                className="input text-lg font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-1.5"><Calendar className="h-4 w-4 text-brand-500" /> Start date</label>
                <input type="date" value={toDateInput(form.startDate)} onChange={set("startDate")} className="input" />
              </div>
              <div>
                <label className="label flex items-center gap-1.5"><Calendar className="h-4 w-4 text-coral-500" /> End date</label>
                <input type="date" value={toDateInput(form.endDate)} min={toDateInput(form.startDate)} onChange={set("endDate")} className="input" />
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={set("description")}
                placeholder="What's this trip about? Any themes, occasions, or must-dos…"
                className="input resize-none"
              />
            </div>

            <div>
              <label className="label flex items-center gap-1.5"><ImageIcon className="h-4 w-4 text-ink-400" /> Cover photo URL <span className="font-normal text-ink-400">(optional)</span></label>
              <input value={form.coverPhoto} onChange={set("coverPhoto")} placeholder="https://…" className="input" />
            </div>

            {/* Destinations */}
            <div>
              <label className="label flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-500" /> Select places to visit</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  placeholder="Search a city…"
                  className="input pl-10"
                />
                {searching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-400" />}
                {results.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-ink-100 bg-white shadow-card">
                    {results.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => addDestination(c)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-ink-50"
                      >
                        <img src={c.image || unsplash(c.name)} alt="" className="h-8 w-8 rounded-lg object-cover" />
                        <span className="text-sm font-medium text-ink-800">{c.name}</span>
                        <span className="text-xs text-ink-400">{c.country}</span>
                        <Plus className="ml-auto h-4 w-4 text-brand-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {destinations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {destinations.map((c) => (
                    <span key={c.name} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-sm font-medium text-brand-700 ring-1 ring-brand-200">
                      <MapPin className="h-3.5 w-3.5" /> {c.name}
                      <button onClick={() => removeDestination(c.name)} className="rounded-full p-0.5 hover:bg-brand-100">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-ink-50 p-3">
              <input id="isPublic" type="checkbox" checked={form.isPublic} onChange={set("isPublic")} className="h-4 w-4 rounded border-ink-300 text-brand-500 focus:ring-brand-400" />
              <label htmlFor="isPublic" className="text-sm text-ink-600">Make this trip public (shareable with others)</label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => save(true)} disabled={saving} size="lg" className="flex-1">
                {saving ? <Spinner className="h-5 w-5 border-white/40 border-t-white" /> : <>Create & build itinerary <ArrowRight className="h-4 w-4" /></>}
              </Button>
              <Button onClick={() => save(false)} disabled={saving} variant="outline" size="lg">
                Save draft
              </Button>
            </div>
          </div>
        </Card>

        {/* Suggestions */}
        <div className="space-y-4">
          <h2 className="section-title">
            <Sparkles className="h-5 w-5 text-amber-500" /> Suggested destinations
          </h2>
          {suggestions.length === 0 ? (
            <EmptyState icon={MapPin} title="Loading ideas…" className="py-10" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {suggestions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => addDestination(c)}
                  className="group relative h-32 overflow-hidden rounded-2xl bg-ink-100 text-left shadow-card"
                >
                  <img src={c.image || unsplash(c.name)} alt={c.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
                    <div>
                      <p className="font-display font-bold text-white">{c.name}</p>
                      <p className="text-xs text-white/75">{c.country}</p>
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-brand-600 opacity-0 transition group-hover:opacity-100">
                      <Plus className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
