import Link from "next/link";
import { Globe2, MapPinned, Wallet, CalendarRange, Users } from "lucide-react";

const HIGHLIGHTS = [
  { icon: MapPinned, text: "Build multi-city itineraries in minutes" },
  { icon: Wallet, text: "Automatic budget estimates & cost breakdowns" },
  { icon: CalendarRange, text: "Visualize your journey on a calendar timeline" },
  { icon: Users, text: "Share plans and get inspired by the community" },
];

/**
 * Split-screen shell for auth pages: branded showcase panel + form panel.
 */
export default function AuthShell({ children, title, subtitle }) {
  return (
    <div className="min-h-screen w-full bg-ink-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Showcase panel */}
      <div className="relative hidden overflow-hidden bg-hero-gradient lg:block">
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-coral-500/30 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-2xl font-extrabold">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Globe2 className="h-6 w-6" strokeWidth={2.5} />
            </span>
            GlobeTrotter
          </Link>

          <div className="max-w-md">
            <h2 className="font-display text-4xl font-extrabold leading-tight">
              Dream it. Design it. <br /> Go there.
            </h2>
            <p className="mt-4 text-lg text-white/85">
              Your all-in-one companion for planning unforgettable multi-city
              adventures — from the first spark of an idea to the final day of the trip.
            </p>

            <ul className="mt-8 space-y-4">
              {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-white/90">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} GlobeTrotter · Empowering personalized travel planning
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 font-display text-2xl font-extrabold text-ink-900">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                <Globe2 className="h-5 w-5" strokeWidth={2.5} />
              </span>
              Globe<span className="-ml-2 text-brand-500">Trotter</span>
            </Link>
          </div>

          <h1 className="font-display text-3xl font-extrabold text-ink-900">{title}</h1>
          {subtitle && <p className="mt-2 text-ink-500">{subtitle}</p>}

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
