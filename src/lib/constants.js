import {
  LayoutDashboard,
  Map,
  Compass,
  CalendarDays,
  Users,
  User,
  Building2,
  ShieldCheck,
} from "lucide-react";

export const APP_NAME = "GlobeTrotter";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "My Trips", icon: Map },
  { href: "/cities", label: "Explore Cities", icon: Building2 },
  { href: "/activities", label: "Activities", icon: Compass },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/community", label: "Community", icon: Users },
];

export const ADMIN_NAV = {
  href: "/admin",
  label: "Admin",
  icon: ShieldCheck,
};

export const PROFILE_NAV = {
  href: "/profile",
  label: "Profile",
  icon: User,
};

export const ACTIVITY_CATEGORIES = [
  "Sightseeing",
  "Adventure",
  "Food & Dining",
  "Culture & History",
  "Nature & Outdoors",
  "Nightlife",
  "Shopping",
  "Relaxation",
  "Water Sports",
  "Family",
];

export const REGIONS = [
  "Europe",
  "Asia",
  "North America",
  "South America",
  "Africa",
  "Oceania",
  "Middle East",
];

export const TRIP_STATUS_META = {
  ongoing: { label: "Ongoing", className: "bg-brand-100 text-brand-700 ring-brand-200" },
  upcoming: { label: "Upcoming", className: "bg-coral-100 text-coral-700 ring-coral-200" },
  completed: { label: "Completed", className: "bg-ink-100 text-ink-600 ring-ink-200" },
};

export const COST_INDEX_LABELS = {
  1: "Budget-friendly",
  2: "Affordable",
  3: "Moderate",
  4: "Premium",
  5: "Luxury",
};
