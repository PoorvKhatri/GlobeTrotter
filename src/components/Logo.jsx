import Link from "next/link";
import { Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Logo({ className, variant = "dark", href = "/dashboard" }) {
  const text = variant === "light" ? "text-white" : "text-ink-900";
  const inner = (
    <span className={cn("inline-flex items-center gap-2 font-display font-extrabold tracking-tight", text, className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
        <Globe2 className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className="text-xl">
        Globe<span className="text-brand-500">Trotter</span>
      </span>
    </span>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}
