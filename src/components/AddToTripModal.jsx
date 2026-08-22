"use client";

import { useEffect, useState } from "react";
import { MapPin, Check, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDateRange, unsplash } from "@/lib/utils";
import api from "@/lib/api";

/**
 * Add a city (as a new stop) or an activity (onto a chosen stop) to one of
 * the user's trips. Handles fetching trips + PUT-updating the selected trip.
 */
export default function AddToTripModal({ open, onClose, item, type = "city" }) {
  const toast = useToast();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedStop, setSelectedStop] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedTrip(null);
    setSelectedStop("");
    setLoading(true);
    api
      .get("/api/trips")
      .then((d) => setTrips(d.trips || []))
      .catch(() => toast.error("Could not load your trips"))
      .finally(() => setLoading(false));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd() {
    if (!selectedTrip) return;
    setSaving(true);
    try {
      const trip = trips.find((t) => t.id === selectedTrip);
      const stops = [...(trip.stops || [])];

      if (type === "city") {
        stops.push({
          cityName: item.name,
          country: item.country || "",
          image: item.image || "",
          order: stops.length,
          activities: [],
        });
      } else {
        // activity
        const newActivity = {
          name: item.name,
          description: item.description || "",
          category: item.category || "Sightseeing",
          cost: item.cost || 0,
          duration: item.duration || "",
          time: "",
        };
        if (stops.length === 0) {
          stops.push({
            cityName: item.city || "New stop",
            country: item.country || "",
            image: item.image || "",
            order: 0,
            activities: [newActivity],
          });
        } else {
          const idx = selectedStop
            ? stops.findIndex((s) => s._id === selectedStop || s.cityName === selectedStop)
            : 0;
          const target = idx >= 0 ? idx : 0;
          stops[target] = {
            ...stops[target],
            activities: [...(stops[target].activities || []), newActivity],
          };
        }
      }

      await api.put(`/api/trips/${trip.id}`, { stops });
      toast.success(
        type === "city" ? `Added ${item.name} to ${trip.name}` : `Added activity to ${trip.name}`
      );
      onClose();
    } catch (err) {
      toast.error(err.message || "Could not add to trip");
    } finally {
      setSaving(false);
    }
  }

  const activeTrip = trips.find((t) => t.id === selectedTrip);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={type === "city" ? `Add ${item?.name} to a trip` : `Add "${item?.name}"`}
      footer={
        <div className="flex items-center justify-between">
          <Link href="/trips/new" className="btn btn-ghost btn-sm">
            <Plus className="h-4 w-4" /> New trip
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!selectedTrip || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Add to trip
            </Button>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center py-10 text-ink-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : trips.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-ink-500">You don&apos;t have any trips yet.</p>
          <Button href="/trips/new" className="mt-4"><Plus className="h-4 w-4" /> Create your first trip</Button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="mb-2 text-sm text-ink-500">Choose a trip:</p>
          {trips.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedTrip(t.id); setSelectedStop(""); }}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                selectedTrip === t.id
                  ? "border-brand-400 bg-brand-50 ring-2 ring-brand-100"
                  : "border-ink-200 hover:border-brand-200 hover:bg-ink-50"
              }`}
            >
              <img
                src={t.coverPhoto || t.stops?.[0]?.image || unsplash(t.name)}
                alt=""
                className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink-900">{t.name}</p>
                <p className="text-xs text-ink-400">{formatDateRange(t.startDate, t.endDate)}</p>
              </div>
              {selectedTrip === t.id && <Check className="h-5 w-5 text-brand-500" />}
            </button>
          ))}

          {type === "activity" && activeTrip?.stops?.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm text-ink-500">Attach to which city?</p>
              <div className="flex flex-wrap gap-2">
                {activeTrip.stops.map((s) => (
                  <button
                    key={s._id || s.cityName}
                    onClick={() => setSelectedStop(s._id || s.cityName)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                      selectedStop === (s._id || s.cityName)
                        ? "border-coral-400 bg-coral-50 text-coral-700"
                        : "border-ink-200 text-ink-600 hover:border-coral-200"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" /> {s.cityName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
