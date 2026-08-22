import { cn } from "@/lib/utils";

const TONES = {
  brand: "bg-brand-100 text-brand-700 ring-brand-200",
  coral: "bg-coral-100 text-coral-700 ring-coral-200",
  amber: "bg-amber-100 text-amber-700 ring-amber-200",
  ink: "bg-ink-100 text-ink-600 ring-ink-200",
  indigo: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  white: "bg-white/90 text-ink-700 ring-white/60",
};

export default function Badge({ tone = "brand", className, children, ...props }) {
  return (
    <span className={cn("chip", TONES[tone] || TONES.brand, className)} {...props}>
      {children}
    </span>
  );
}
