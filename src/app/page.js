import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Sparkles,
  Map,
  Wallet,
  CalendarDays,
  Users,
  Compass,
  Share2,
  ArrowRight,
  Route,
  Globe2,
  Check,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { unsplash } from "@/lib/utils";
import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: Route, title: "Multi-city itineraries", desc: "Chain destinations into day-by-day plans with stops, notes, and activities." },
  { icon: Wallet, title: "Smart budgets", desc: "Track transport, stay, meals, and activities with visual cost breakdowns." },
  { icon: Compass, title: "Discover & explore", desc: "Search cities and hand-picked activities, then add them to any trip." },
  { icon: CalendarDays, title: "Calendar & timeline", desc: "See every journey on a travel calendar and month-by-month timeline." },
  { icon: Share2, title: "Share your trips", desc: "Publish a beautiful public itinerary others can view and copy." },
  { icon: Users, title: "Travel community", desc: "Share experiences, tips, and hidden gems — and get inspired by others." },
];

const STEPS = [
  { n: "01", title: "Create a trip", desc: "Name it, set your dates, and pick your first destinations." },
  { n: "02", title: "Build the itinerary", desc: "Add cities and activities, then watch your budget update live." },
  { n: "03", title: "Share & travel", desc: "Publish your plan, copy others', and hit the road with confidence." },
];

export default async function Landing() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-ink-100/80 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo href="/" />
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink-600 md:flex">
            <a href="#features" className="hover:text-brand-600">Features</a>
            <a href="#how" className="hover:text-brand-600">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" href="/login">Sign in</Button>
            <Button variant="coral" href="/register"><Sparkles className="h-4 w-4" /> Get started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-[0.06]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
              <Globe2 className="h-4 w-4" /> Personalized travel planning
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] text-ink-900 sm:text-5xl lg:text-6xl">
              Plan trips you&apos;ll actually <span className="text-brand-500">take</span>.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-600">
              GlobeTrotter turns scattered ideas into structured, budget-aware itineraries — build multi-city adventures, estimate costs, and share your journeys with the world.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button variant="coral" size="lg" href="/register">Start planning free <ArrowRight className="h-5 w-5" /></Button>
              <Button variant="outline" size="lg" href="/login">I already have an account</Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500">
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-brand-500" /> Free to use</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-brand-500" /> No credit card</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-brand-500" /> Share in one click</span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-coral-200/50 blur-3xl" />
            <div className="absolute -bottom-10 -left-6 h-48 w-48 rounded-full bg-brand-200/50 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl shadow-card ring-1 ring-ink-100">
              <img
                src={unsplash("bali indonesia beach", 1200, 840)}
                alt="Scenic travel destination"
                className="h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 p-4 shadow-soft backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-ink-900">Southeast Asia Adventure</p>
                    <p className="text-xs text-ink-400">Bangkok · Bali · Singapore · 12 nights</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">$2,480</span>
                </div>
                <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-ink-100">
                  <div className="w-[35%] bg-brand-500" />
                  <div className="w-[30%] bg-coral-500" />
                  <div className="w-[20%] bg-amber-500" />
                  <div className="w-[15%] bg-indigo-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">Everything you need to plan the perfect trip</h2>
          <p className="mt-3 text-lg text-ink-600">From first spark of inspiration to a fully-costed, shareable itinerary.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 transition hover:-translate-y-1 hover:shadow-card">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink-900">{title}</h3>
              <p className="mt-1.5 text-ink-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-ink-50 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">Three steps to your next adventure</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="relative rounded-2xl bg-white p-6 shadow-soft">
                <span className="font-display text-4xl font-extrabold text-brand-100">{n}</span>
                <h3 className="mt-2 font-display text-xl font-bold text-ink-900">{title}</h3>
                <p className="mt-1.5 text-ink-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-hero-gradient p-10 text-center sm:p-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">Ready to plan your journey?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">Join GlobeTrotter and turn your travel dreams into a plan you can actually follow.</p>
            <div className="mt-8 flex justify-center">
              <Button variant="coral" size="lg" href="/register">Create your free account <ArrowRight className="h-5 w-5" /></Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <Logo href="/" />
          <p className="text-sm text-ink-400">© {new Date().getFullYear()} GlobeTrotter. Plan · Budget · Explore · Share.</p>
        </div>
      </footer>
    </div>
  );
}
