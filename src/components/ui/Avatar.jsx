import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export default function Avatar({ name, src, size = "md", className }) {
  const sizes = {
    xs: "h-7 w-7 text-[10px]",
    sm: "h-9 w-9 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-24 w-24 text-2xl",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || "avatar"}
        className={cn("rounded-full object-cover ring-2 ring-white", sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-brand-gradient font-semibold text-white ring-2 ring-white",
        sizes[size],
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
