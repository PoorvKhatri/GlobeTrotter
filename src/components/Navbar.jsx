"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Menu, X, LogOut, ChevronDown } from "lucide-react";
import Logo from "@/components/Logo";
import Avatar from "@/components/ui/Avatar";
import { useUser } from "@/components/UserProvider";
import { useToast } from "@/components/ui/Toast";
import { NAV_ITEMS, ADMIN_NAV, PROFILE_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function Navbar() {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const links = [...NAV_ITEMS];
  if (user?.role === "admin") links.push(ADMIN_NAV);

  useEffect(() => {
    function onClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [pathname]);

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  async function logout() {
    try {
      await api.post("/api/auth/logout");
      toast.success("Signed out");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Could not sign out");
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                isActive(href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-500 hover:bg-ink-100 hover:text-ink-800"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link href="/trips/new" className="btn btn-coral btn-sm sm:btn-md">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Plan a trip</span>
          </Link>

          {/* Profile dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-full p-0.5 transition hover:ring-2 hover:ring-brand-100"
            >
              <Avatar name={user?.name} src={user?.photo} size="sm" />
              <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:block" />
            </button>

            {dropOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card animate-fade-in">
                <div className="border-b border-ink-100 p-4">
                  <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
                  <p className="truncate text-xs text-ink-400">{user?.email}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    href={PROFILE_NAV.href}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-600 hover:bg-ink-100"
                  >
                    <PROFILE_NAV.icon className="h-4 w-4" /> {PROFILE_NAV.label}
                  </Link>
                  {user?.role === "admin" && (
                    <Link
                      href={ADMIN_NAV.href}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-600 hover:bg-ink-100"
                    >
                      <ADMIN_NAV.icon className="h-4 w-4" /> Admin panel
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-coral-600 hover:bg-coral-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-xl p-2 text-ink-500 hover:bg-ink-100 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="border-t border-ink-100 bg-white px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium",
                  isActive(href) ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
