"use client";

import { useEffect, useState } from "react";
import { Compass, SearchX } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import SearchToolbar from "@/components/ui/SearchToolbar";
import AddToTripModal from "@/components/AddToTripModal";
import { EmptyState, Skeleton } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import { ACTIVITY_CATEGORIES } from "@/lib/constants";
import api from "@/lib/api";

export default function ActivitiesPage() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("popularity");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addActivity, setAddActivity] = useState(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category !== "all") params.set("category", category);
    params.set("sort", sort);
    const t = setTimeout(() => {
      api
        .get(`/api/activities?${params.toString()}`)
        .then((d) => setActivities(d.activities || []))
        .catch(() => toast.error("Could not load activities"))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query, category, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold text-ink-900">
          <Compass className="h-6 w-6 text-brand-500" /> Discover Activities
        </h1>
        <p className="text-ink-500">Find things to do — sightseeing, food tours, adventure, and more.</p>
      </div>

      <SearchToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search activities, e.g. Paragliding, food tour…"
        groupOptions={[{ value: "all", label: "All categories" }, ...ACTIVITY_CATEGORIES.map((c) => ({ value: c, label: c }))]}
        groupValue={category}
        onGroupChange={setCategory}
        sortOptions={[
          { value: "popularity", label: "Most popular" },
          { value: "rating", label: "Top rated" },
          { value: "costLow", label: "Cost: low → high" },
          { value: "costHigh", label: "Cost: high → low" },
          { value: "name", label: "Name (A–Z)" },
        ]}
        sortValue={sort}
        onSortChange={setSort}
      />

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : activities.length === 0 ? (
        <EmptyState icon={SearchX} title="No activities found" description="Try a different keyword or category." />
      ) : (
        <>
          <p className="text-sm text-ink-400">{activities.length} results</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((a) => (
              <ActivityCard key={a.id} activity={a} onAdd={setAddActivity} />
            ))}
          </div>
        </>
      )}

      <AddToTripModal open={!!addActivity} onClose={() => setAddActivity(null)} item={addActivity} type="activity" />
    </div>
  );
}
