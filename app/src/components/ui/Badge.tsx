import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold uppercase tracking-wide rounded",
        variant === "default" && "bg-slate-100 text-navy-700",
        variant === "outline" && "border border-slate-200 text-slate-600",
        className
      )}
    >
      {children}
    </span>
  );
}
