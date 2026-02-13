import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  value: string | number;
  label: string;
  labelTamil?: string;
  variant?: "default" | "accent";
  className?: string;
}

export function StatCard({
  value,
  label,
  labelTamil,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "p-5 rounded-lg text-white relative overflow-hidden",
        variant === "default" &&
          "bg-gradient-to-br from-navy-900 to-navy-800",
        variant === "accent" &&
          "bg-gradient-to-br from-teal-700 to-teal-600",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full" />
      <p className="font-display text-3xl font-bold leading-none mb-1.5 relative">
        {value}
      </p>
      <p className="text-sm opacity-85 relative">{label}</p>
      {labelTamil && (
        <p className="font-tamil text-xs opacity-70 mt-1 relative">
          {labelTamil}
        </p>
      )}
    </div>
  );
}
