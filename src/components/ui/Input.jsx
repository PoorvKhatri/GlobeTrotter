import { cn } from "@/lib/utils";

export function Label({ className, children, ...props }) {
  return (
    <label className={cn("label", className)} {...props}>
      {children}
    </label>
  );
}

export function Input({ className, ...props }) {
  return <input className={cn("input", className)} {...props} />;
}

export function Textarea({ className, rows = 4, ...props }) {
  return <textarea rows={rows} className={cn("input resize-none", className)} {...props} />;
}

export function Field({ label, hint, error, children, className }) {
  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-coral-600">{error}</p>}
    </div>
  );
}

export default Input;
