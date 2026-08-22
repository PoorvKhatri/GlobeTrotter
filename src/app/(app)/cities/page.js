"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Compass } from "lucide-react";
import CityCard from "@/components/CityCard";
import SearchToolbar from "@/components/ui/SearchToolbar";
import AddToTripModal from "@/components/AddToTripModal";
import { EmptyState, Skeleton } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import { useUser } from "@/components/UserProvider";
import { REGIONS } from "@/lib/constants";
import api from "@/lib/api";

export default function CitiesPage() {
  const toast = useToast();
  const user = useUser();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [sort, setSort] = useState("popularity");
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addCity, setAddCity] = useState(null);
  const [saved, setSaved] = useState(new Set(user?.savedDestinations || []));

  // seed query from URL on mount
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (region !== "all") params.set("region", region);
    params.set("sort", sort);
    const t = setTimeout(() => {
      api
        .get(`/api/cities?${params.toString()}`)
        .then((d) => setCities(d.cities || []))
        .catch(() => toast.error("Could not load cities"))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query, region, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleSave(city) {
    const next = new Set(saved);
    next.has(city.name) ? next.delete(city.name) : next.add(city.name);
    setSaved(next);
    try {
      await api.put("/api/profile", { savedDestinations: [...next] });
    } catch {
      toast.error("Could not update saved destinations");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold text-ink-900">
          <Building2 className="h-6 w-6 text-brand-500" /> Explore Cities
        </h1>
        <p className="text-ink-500">Discover destinations by country, region, popularity, and cost.</p>
      </div>

      <SearchToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search cities or countries…"
        groupOptions={[{ value: "all", label: "All regions" }, ...REGIONS.map((r) => ({ value: r, label: r }))]}
        groupValue={region}
        onGroupChange={setRegion}
        sortOptions={[
          { value: "popularity", label: "Most popular" },
          { value: "name", label: "Name (A–Z)" },
          { value: "costLow", label: "Cost: low → high" },
          { value: "costHigh", label: "Cost: high → low" },
        ]}
        sortValue={sort}
        onSortChange={setSort}
      />

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : cities.length === 0 ? (
        <EmptyState icon={Compass} title="No cities found" description="Try a different search term or region filter." />
      ) : (
        <>
          <p className="text-sm text-ink-400">{cities.length} destinations</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cities.map((c) => (
              <CityCard
                key={c.id}
                city={c}
                onAdd={setAddCity}
                onSave={toggleSave}
                saved={saved.has(c.name)}
              />
            ))}
          </div>
        </>
      )}

      <AddToTripModal open={!!addCity} onClose={() => setAddCity(null)} item={addCity} type="city" />
    </div>
  );
}
