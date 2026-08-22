"use client";

import { MapPin, TrendingUp, Plus, Heart } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { unsplash, formatCurrency, cn } from "@/lib/utils";
import { COST_INDEX_LABELS } from "@/lib/constants";

export default function CityCard({ city, onAdd, onSave, saved }) {
  const img = city.image || unsplash(city.name);
  return (
    <div className="group card overflow-hidden transition hover:shadow-glow hover:-translate-y-0.5">
      <div className="relative h-36 overflow-hidden bg-ink-100">
        <img src={img} alt={city.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
        {onSave && (
          <button
            onClick={() => onSave(city)}
            className={cn(
              "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition",
              saved ? "bg-coral-500 text-white" : "bg-white/80 text-ink-500 hover:bg-white"
            )}
          >
            <Heart className={cn("h-4 w-4", saved && "fill-current")} />
          </button>
        )}
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="truncate font-display text-lg font-bold text-white">{city.name}</h3>
          <p className="flex items-center gap-1 text-xs text-white/80">
            <MapPin className="h-3 w-3" /> {city.country}
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          {city.region && <Badge tone="brand">{city.region}</Badge>}
          <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-400">
            <TrendingUp className="h-3.5 w-3.5 text-brand-500" /> {city.popularity}% popular
          </span>
        </div>

        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-ink-500">{city.description}</p>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-0.5" title={COST_INDEX_LABELS[city.costIndex]}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "text-sm font-bold",
                    i <= city.costIndex ? "text-amber-500" : "text-ink-200"
                  )}
                >
                  $
                </span>
              ))}
            </div>
            <p className="text-[11px] text-ink-400">
              {city.avgDailyCost ? `~${formatCurrency(city.avgDailyCost)}/day` : COST_INDEX_LABELS[city.costIndex]}
            </p>
          </div>

          {onAdd && (
            <button onClick={() => onAdd(city)} className="btn btn-primary btn-sm">
              <Plus className="h-4 w-4" /> Add to trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
