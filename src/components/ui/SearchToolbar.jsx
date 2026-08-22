"use client";

import { Search, Layers, SlidersHorizontal, ArrowUpDown } from "lucide-react";

/**
 * Reusable search + Group by / Filter / Sort toolbar used across list screens
 * (Dashboard, My Trips, City/Activity search, Community, Calendar, Admin).
 */
export default function SearchToolbar({
  query = "",
  onQueryChange,
  placeholder = "Search…",
  groupOptions,
  groupValue,
  onGroupChange,
  sortOptions,
  sortValue,
  onSortChange,
  filterOptions,
  filterValue,
  onFilterChange,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center ${className}`}>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => onQueryChange?.(e.target.value)}
          placeholder={placeholder}
          className="input pl-10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {groupOptions && (
          <ToolbarSelect
            icon={Layers}
            label="Group by"
            value={groupValue}
            onChange={onGroupChange}
            options={groupOptions}
          />
        )}
        {filterOptions && (
          <ToolbarSelect
            icon={SlidersHorizontal}
            label="Filter"
            value={filterValue}
            onChange={onFilterChange}
            options={filterOptions}
          />
        )}
        {sortOptions && (
          <ToolbarSelect
            icon={ArrowUpDown}
            label="Sort by"
            value={sortValue}
            onChange={onSortChange}
            options={sortOptions}
          />
        )}
      </div>
    </div>
  );
}

function ToolbarSelect({ icon: Icon, label, value, onChange, options }) {
  return (
    <label className="toolbar-btn cursor-pointer">
      <Icon className="h-4 w-4 text-ink-400" />
      <span className="hidden text-ink-400 sm:inline">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-transparent text-ink-700 font-medium focus:outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
