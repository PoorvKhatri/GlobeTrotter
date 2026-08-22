"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { MapPin, Calendar, Wallet, MoreVertical, Eye, Pencil, Trash2, Layers } from "lucide-react";
import Badge from "@/components/ui/Badge";
import {
  formatDateRange,
  tripStatus,
  tripTotalBudget,
  formatCurrency,
  unsplash,
  cn,
} from "@/lib/utils";
import { TRIP_STATUS_META } from "@/lib/constants";

export default function TripCard({ trip, manage = false, onDelete, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const status = tripStatus(trip.startDate, trip.endDate);
  const meta = TRIP_STATUS_META[status];
  const cover =
    trip.coverPhoto ||
    trip.stops?.[0]?.image ||
    unsplash(trip.stops?.[0]?.cityName || trip.name);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className={cn("group card overflow-hidden transition hover:shadow-glow hover:-translate-y-0.5", className)}>
      <Link href={`/trips/${trip.id}`} className="block">
        <div className="relative h-40 overflow-hidden bg-ink-100">
          <img
            src={cover}
            alt={trip.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
          <div className="absolute left-3 top-3">
            <Badge className={cn("ring-0", meta.className)}>{meta.label}</Badge>
          </div>
          <h3 className="absolute bottom-3 left-3 right-3 truncate font-display text-lg font-bold text-white">
            {trip.name}
          </h3>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-brand-500" />
            {formatDateRange(trip.startDate, trip.endDate)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-coral-500" />
            {trip.stops?.length || 0} {trip.stops?.length === 1 ? "city" : "cities"}
          </span>
        </div>

        {trip.description && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-400">{trip.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-800">
            <Wallet className="h-4 w-4 text-amber-500" />
            {formatCurrency(tripTotalBudget(trip))}
          </span>

          {manage ? (
            <div className="relative flex items-center gap-2" ref={ref}>
              <Link href={`/trips/${trip.id}`} className="btn btn-outline btn-sm">
                <Eye className="h-4 w-4" /> View
              </Link>
              <button
                onClick={() => setOpen((o) => !o)}
                className="rounded-lg border border-ink-200 p-2 text-ink-500 hover:bg-ink-100"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {open && (
                <div className="absolute bottom-11 right-0 z-10 w-40 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-card animate-fade-in">
                  <Link href={`/trips/${trip.id}/build`} className="flex items-center gap-2 px-3 py-2 text-sm text-ink-600 hover:bg-ink-100">
                    <Layers className="h-4 w-4" /> Build itinerary
                  </Link>
                  <Link href={`/trips/${trip.id}/edit`} className="flex items-center gap-2 px-3 py-2 text-sm text-ink-600 hover:bg-ink-100">
                    <Pencil className="h-4 w-4" /> Edit details
                  </Link>
                  <button
                    onClick={() => { setOpen(false); onDelete?.(trip); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-coral-600 hover:bg-coral-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href={`/trips/${trip.id}`} className="text-sm font-semibold text-brand-600 hover:underline">
              View trip →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
