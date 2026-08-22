"use client";

import { Star, Clock, Plus, MapPin } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { unsplash, formatCurrency, cn } from "@/lib/utils";

const CATEGORY_TONE = {
  Adventure: "coral",
  "Food & Dining": "amber",
  "Culture & History": "indigo",
  "Nature & Outdoors": "brand",
  Sightseeing: "brand",
  Nightlife: "indigo",
  Relaxation: "brand",
  "Water Sports": "brand",
};

export default function ActivityCard({ activity, onAdd, compact = false }) {
  const img = activity.image || unsplash(`${activity.name} ${activity.city}`);
  const tone = CATEGORY_TONE[activity.category] || "ink";

  return (
    <div className={cn("group card overflow-hidden transition hover:shadow-soft", compact ? "flex" : "")}>
      <div className={cn("relative overflow-hidden bg-ink-100", compact ? "h-auto w-28 flex-shrink-0" : "h-36")}>
        <img src={img} alt={activity.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight text-ink-900">{activity.name}</h3>
          <Badge tone={tone} className="flex-shrink-0">{activity.category}</Badge>
        </div>

        <p className="flex items-center gap-1 text-xs text-ink-400">
          <MapPin className="h-3 w-3" /> {activity.city}
          {activity.country ? `, ${activity.country}` : ""}
        </p>

        {!compact && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-500">{activity.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center gap-3 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1 font-medium text-amber-600">
              <Star className="h-3.5 w-3.5 fill-current" /> {activity.rating?.toFixed(1)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {activity.duration}
            </span>
            <span className="font-semibold text-ink-800">{formatCurrency(activity.cost)}</span>
          </div>

          {onAdd && (
            <button onClick={() => onAdd(activity)} className="btn btn-outline btn-sm">
              <Plus className="h-4 w-4" /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
