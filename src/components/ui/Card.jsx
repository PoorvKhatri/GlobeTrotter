import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("card", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn("p-5 sm:p-6 border-b border-ink-100", className)}>{children}</div>;
}

export function CardBody({ className, children }) {
  return <div className={cn("p-5 sm:p-6", className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return <div className={cn("p-5 sm:p-6 border-t border-ink-100", className)}>{children}</div>;
}

export default Card;
