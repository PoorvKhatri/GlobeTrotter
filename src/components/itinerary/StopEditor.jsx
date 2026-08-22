"use client";

import { useState } from "react";
import {
  MapPin,
  Calendar,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Wallet,
  Clock,
  GripVertical,
} from "lucide-react";
import Select from "@/components/ui/Select";
import { ACTIVITY_CATEGORIES } from "@/lib/constants";
import { formatCurrency, toDateInput } from "@/lib/utils";

const BLANK_ACTIVITY = { name: "", category: "Sightseeing", time: "", duration: "", cost: 0 };

/**
 * Editable "section" for a single city stop within the itinerary builder.
 */
export default function StopEditor({ stop, index, total, onChange, onRemove, onMove }) {
  const [draft, setDraft] = useState(BLANK_ACTIVITY);

  const activities = stop.activities || [];
  const sectionBudget = activities.reduce((s, a) => s + (Number(a.cost) || 0), 0);

  const update = (patch) => onChange({ ...stop, ...patch });

  function updateActivity(i, patch) {
    const next = activities.map((a, idx) => (idx === i ? { ...a, ...patch } : a));
    update({ activities: next });
  }
  function removeActivity(i) {
    update({ activities: activities.filter((_, idx) => idx !== i) });
  }
  function addActivity() {
    if (!draft.name.trim()) return;
    update({ activities: [...activities, { ...draft, cost: Number(draft.cost) || 0 }] });
    setDraft(BLANK_ACTIVITY);
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-ink-100 bg-ink-50/60 px-5 py-3">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-sm font-bold text-white">
          {index + 1}
        </span>
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500" />
          <input
            value={stop.cityName}
            onChange={(e) => update({ cityName: e.target.value })}
            placeholder="City / section name"
            className="input h-10 pl-9 font-semibold"
          />
        </div>
        <input
          value={stop.country || ""}
          onChange={(e) => update({ country: e.target.value })}
          placeholder="Country"
          className="input h-10 hidden w-36 sm:block"
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 disabled:opacity-30"
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => onMove(index, index + 1)}
            disabled={index === total - 1}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 disabled:opacity-30"
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            onClick={() => onRemove(index)}
            className="rounded-lg p-1.5 text-coral-500 hover:bg-coral-50"
            title="Remove section"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {/* Dates + notes */}
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="label flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Arrive</label>
            <input type="date" value={toDateInput(stop.startDate)} onChange={(e) => update({ startDate: e.target.value })} className="input h-10" />
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Depart</label>
            <input type="date" value={toDateInput(stop.endDate)} min={toDateInput(stop.startDate)} onChange={(e) => update({ endDate: e.target.value })} className="input h-10" />
          </div>
          <div className="flex flex-col justify-end">
            <span className="label">Section budget</span>
            <div className="flex h-10 items-center gap-1.5 rounded-xl bg-amber-50 px-3 font-semibold text-amber-700">
              <Wallet className="h-4 w-4" /> {formatCurrency(sectionBudget)}
            </div>
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            rows={2}
            value={stop.notes || ""}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="Hotel, travel details, or anything worth remembering for this leg…"
            className="input resize-none"
          />
        </div>

        {/* Activities */}
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-700">Activities & plans</p>
          <div className="space-y-2">
            {activities.map((a, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-ink-100 bg-white p-2">
                <GripVertical className="hidden h-4 w-4 text-ink-300 sm:block" />
                <input
                  value={a.name}
                  onChange={(e) => updateActivity(i, { name: e.target.value })}
                  className="input h-9 flex-1 min-w-[140px]"
                  placeholder="Activity name"
                />
                <Select value={a.category} onChange={(e) => updateActivity(i, { category: e.target.value })} className="h-9 w-40">
                  {ACTIVITY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
                <div className="relative w-28">
                  <Clock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
                  <input type="time" value={a.time || ""} onChange={(e) => updateActivity(i, { time: e.target.value })} className="input h-9 pl-8" />
                </div>
                <div className="relative w-28">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-ink-400">$</span>
                  <input type="number" min="0" value={a.cost} onChange={(e) => updateActivity(i, { cost: e.target.value })} className="input h-9 pl-6" placeholder="0" />
                </div>
                <button onClick={() => removeActivity(i)} className="rounded-lg p-2 text-coral-500 hover:bg-coral-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add activity row */}
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-ink-200 bg-ink-50/50 p-2">
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addActivity()}
              className="input h-9 flex-1 min-w-[140px]"
              placeholder="Add an activity…"
            />
            <Select value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} className="h-9 w-40">
              {ACTIVITY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
            <div className="relative w-28">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-ink-400">$</span>
              <input type="number" min="0" value={draft.cost} onChange={(e) => setDraft((d) => ({ ...d, cost: e.target.value }))} className="input h-9 pl-6" placeholder="0" />
            </div>
            <button onClick={addActivity} className="btn btn-primary btn-sm">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
