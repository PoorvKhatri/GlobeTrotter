"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Save,
  Wallet,
  Eye,
  Layers,
  ArrowLeft,
  MapPinned,
  PieChart,
} from "lucide-react";
import StopEditor from "@/components/itinerary/StopEditor";
import Button from "@/components/ui/Button";
import { PageLoader, EmptyState } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import api from "@/lib/api";

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    api
      .get(`/api/trips/${id}`)
      .then((d) => {
        setTrip(d.trip);
        setStops(d.trip.stops || []);
      })
      .catch((e) => toast.error(e.message || "Could not load trip"))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  function mutate(next) {
    setStops(next);
    setDirty(true);
  }

  const updateStop = (i, updated) => mutate(stops.map((s, idx) => (idx === i ? updated : s)));
  const removeStop = (i) => mutate(stops.filter((_, idx) => idx !== i));
  const addStop = () =>
    mutate([...stops, { cityName: "", country: "", activities: [], order: stops.length }]);

  function moveStop(from, to) {
    if (to < 0 || to >= stops.length) return;
    const next = [...stops];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    mutate(next.map((s, i) => ({ ...s, order: i })));
  }

  async function save(thenView) {
    setSaving(true);
    try {
      const cleaned = stops.map((s, i) => ({ ...s, order: i }));
      const { trip: updated } = await api.put(`/api/trips/${id}`, { stops: cleaned });
      setTrip(updated);
      setStops(updated.stops || []);
      setDirty(false);
      toast.success("Itinerary saved");
      if (thenView) router.push(`/trips/${id}`);
    } catch (e) {
      toast.error(e.message || "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader label="Loading your itinerary…" />;
  if (!trip) return <EmptyState icon={MapPinned} title="Trip not found" />;

  const total = stops.reduce(
    (sum, s) => sum + (s.activities || []).reduce((a, act) => a + (Number(act.cost) || 0), 0),
    0
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-28">
      <Link href={`/trips/${id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to trip
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center gap-2 text-brand-600">
          <Layers className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Itinerary Builder</span>
        </div>
        <input
          value={trip.name}
          onChange={(e) => { setTrip({ ...trip, name: e.target.value }); }}
          onBlur={() => api.put(`/api/trips/${id}`, { name: trip.name }).catch(() => {})}
          className="mt-1 w-full border-none bg-transparent p-0 font-display text-2xl font-extrabold text-ink-900 focus:outline-none focus:ring-0"
        />
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-500">
          <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
          <span className="inline-flex items-center gap-1.5"><MapPinned className="h-4 w-4 text-coral-500" /> {stops.length} sections</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-amber-600"><Wallet className="h-4 w-4" /> {formatCurrency(total)}</span>
          <Link href={`/trips/${id}/budget`} className="inline-flex items-center gap-1.5 text-brand-600 hover:underline">
            <PieChart className="h-4 w-4" /> View budget breakdown
          </Link>
        </div>
      </div>

      {/* Sections */}
      {stops.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Start building your itinerary"
          description="Add sections for each city, hotel, or leg of your journey — then fill them with activities."
          action={<Button onClick={addStop}><Plus className="h-4 w-4" /> Add first section</Button>}
        />
      ) : (
        <div className="space-y-4">
          {stops.map((stop, i) => (
            <StopEditor
              key={i}
              stop={stop}
              index={i}
              total={stops.length}
              onChange={(u) => updateStop(i, u)}
              onRemove={removeStop}
              onMove={moveStop}
            />
          ))}
        </div>
      )}

      {stops.length > 0 && (
        <button
          onClick={addStop}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 py-5 font-semibold text-ink-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
        >
          <Plus className="h-5 w-5" /> Add another Section
        </button>
      )}

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="text-sm text-ink-500">
            {dirty ? <span className="font-medium text-coral-600">Unsaved changes</span> : "All changes saved"}
            <span className="ml-3 font-semibold text-ink-800">Total {formatCurrency(total)}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" href={`/trips/${id}`}><Eye className="h-4 w-4" /> Preview</Button>
            <Button onClick={() => save(false)} disabled={saving || !dirty}>
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
