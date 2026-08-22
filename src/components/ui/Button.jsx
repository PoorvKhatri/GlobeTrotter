import Link from "next/link";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "btn-primary",
  coral: "btn-coral",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

const SIZES = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

/**
 * Flexible button. Renders a <Link> when `href` is provided, else a <button>.
 * Works in both server and client components (no hooks).
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  href,
  type = "button",
  ...props
}) {
  const classes = cn("btn", VARIANTS[variant], SIZES[size], className);

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
