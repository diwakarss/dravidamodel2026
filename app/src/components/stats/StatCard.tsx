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
        "p-3 sm:p-5 rounded-lg text-white relative overflow-hidden min-w-0",
        variant === "default" &&
          "bg-gradient-to-br from-navy-900 to-navy-800",
        variant === "accent" &&
          "bg-gradient-to-br from-teal-700 to-teal-600",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full" />
      <p className="font-display text-2xl sm:text-3xl font-bold leading-none mb-1 sm:mb-1.5 relative">
        {value}
      </p>
      <p className="text-xs sm:text-sm opacity-85 relative leading-tight">{label}</p>
      {labelTamil && (
        <p className="font-tamil text-[10px] sm:text-xs opacity-70 mt-0.5 sm:mt-1 relative leading-tight">
          {labelTamil}
        </p>
      )}
    </div>
  );
}
