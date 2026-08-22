"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";

export default function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e) {
    e.preventDefault();
    router.push(q.trim() ? `/cities?q=${encodeURIComponent(q.trim())}` : "/cities");
  }

  const suggestions = ["Tokyo", "Paris", "Bali", "New York", "Rome"];

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={submit} className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Where do you want to go? Search cities, countries, activities…"
          className="h-14 w-full rounded-2xl border border-white/40 bg-white/95 pl-12 pr-32 text-ink-900 shadow-card placeholder:text-ink-400 focus:outline-none focus:ring-4 focus:ring-white/30"
        />
        <button type="submit" className="btn btn-coral absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5">
          <Sparkles className="h-4 w-4" /> Explore
        </button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/70">Popular:</span>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => router.push(`/cities?q=${encodeURIComponent(s)}`)}
            className="rounded-full bg-white/15 px-3 py-1 text-sm text-white backdrop-blur transition hover:bg-white/25"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
