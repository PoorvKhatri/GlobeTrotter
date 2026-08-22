"use client";

import { useEffect, useMemo, useState } from "react";
import { Map, Plus, Trash2 } from "lucide-react";
import TripCard from "@/components/TripCard";
import SearchToolbar from "@/components/ui/SearchToolbar";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { EmptyState, Skeleton } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import { tripStatus, tripTotalBudget } from "@/lib/utils";
import api from "@/lib/api";

const STATUS_ORDER = ["ongoing", "upcoming", "completed"];
const STATUS_LABEL = { ongoing: "Ongoing", upcoming: "Upcoming", completed: "Completed" };

export default function MyTripsPage() {
  const toast = useToast();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("status");
  const [sort, setSort] = useState("recent");
  const [filter, setFilter] = useState("all");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get("/api/trips")
      .then((d) => {
        if (active) setTrips(d.trips || []);
      })
      .catch(() => toast.error("Could not load trips"))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const withStatus = useMemo(
    () => trips.map((t) => ({ ...t, _status: tripStatus(t.startDate, t.endDate) })),
    [trips]
  );

  const processed = useMemo(() => {
    let list = withStatus;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.stops?.some((s) => s.cityName.toLowerCase().includes(q))
      );
    }
    if (filter !== "all") list = list.filter((t) => t._status === filter);

    const sorters = {
      recent: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      name: (a, b) => a.name.localeCompare(b.name),
      budget: (a, b) => tripTotalBudget(b) - tripTotalBudget(a),
      date: (a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0),
    };
    return [...list].sort(sorters[sort] || sorters.recent);
  }, [withStatus, query, filter, sort]);

  const grouped = useMemo(() => {
    const g = { ongoing: [], upcoming: [], completed: [] };
    processed.forEach((t) => g[t._status]?.push(t));
    return g;
  }, [processed]);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.del(`/api/trips/${toDelete.id}`);
      setTrips((ts) => ts.filter((t) => t.id !== toDelete.id));
      toast.success("Trip deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(err.message || "Could not delete trip");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">My Trips</h1>
          <p className="text-ink-500">Manage and revisit all your travel plans.</p>
        </div>
        <Button href="/trips/new"><Plus className="h-4 w-4" /> Plan a trip</Button>
      </div>

      <SearchToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search your trips…"
        groupValue={group}
        onGroupChange={setGroup}
        groupOptions={[
          { value: "status", label: "Status" },
          { value: "none", label: "None" },
        ]}
        filterValue={filter}
        onFilterChange={setFilter}
        filterOptions={[
          { value: "all", label: "All" },
          { value: "ongoing", label: "Ongoing" },
          { value: "upcoming", label: "Upcoming" },
          { value: "completed", label: "Completed" },
        ]}
        sortValue={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: "recent", label: "Recently updated" },
          { value: "date", label: "Start date" },
          { value: "name", label: "Name" },
          { value: "budget", label: "Budget" },
        ]}
      />

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : processed.length === 0 ? (
        <EmptyState
          icon={Map}
          title={query || filter !== "all" ? "No matching trips" : "No trips yet"}
          description="Create a trip to start building itineraries, adding activities, and tracking your budget."
          action={<Button href="/trips/new"><Plus className="h-4 w-4" /> Plan a trip</Button>}
        />
      ) : group === "status" ? (
        <div className="space-y-8">
          {STATUS_ORDER.map((status) =>
            grouped[status].length ? (
              <section key={status}>
                <h2 className="section-title mb-4">
                  {STATUS_LABEL[status]}
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-500">
                    {grouped[status].length}
                  </span>
                  <span className="section-rule" />
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {grouped[status].map((t) => (
                    <TripCard key={t.id} trip={t} manage onDelete={setToDelete} />
                  ))}
                </div>
              </section>
            ) : null
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {processed.map((t) => (
            <TripCard key={t.id} trip={t} manage onDelete={setToDelete} />
          ))}
        </div>
      )}

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete trip?"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setToDelete(null)}>Cancel</Button>
            <Button variant="coral" onClick={confirmDelete} disabled={deleting}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        }
      >
        <p className="text-ink-600">
          Are you sure you want to delete <strong>{toDelete?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
