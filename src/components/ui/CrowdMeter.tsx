"use client";

import { motion } from "framer-motion";
import { cn, getCrowdLevel, getCrowdPercentage, getCrowdLabel } from "@/lib/utils";

interface CrowdMeterProps {
  currentCount: number;
  maxCapacity: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CrowdMeter({
  currentCount,
  maxCapacity,
  showLabel = true,
  size = "md",
  className,
}: CrowdMeterProps) {
  const percentage = getCrowdPercentage(currentCount, maxCapacity);
  const level = getCrowdLevel(currentCount, maxCapacity);
  const label = getCrowdLabel(currentCount, maxCapacity);

  const heights = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const colors = {
    low: "from-emerald-500 to-emerald-400",
    medium: "from-amber-500 to-amber-400",
    high: "from-red-500 to-red-400",
  };

  const dotColors = {
    low: "bg-emerald-500",
    medium: "bg-amber-500",
    high: "bg-red-500",
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Label */}
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.div
              className={cn("w-2 h-2 rounded-full", dotColors[level])}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-pearl-muted">
              {label}
            </span>
          </div>
          <span className="text-xs font-medium text-pearl">
            {currentCount}/{maxCapacity}
          </span>
        </div>
      )}

      {/* Bar */}
      <div
        className={cn(
          "w-full bg-white/10 rounded-full overflow-hidden",
          heights[size]
        )}
      >
        <motion.div
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            colors[level]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// Compact version for cards
export function CrowdMeterCompact({
  currentCount,
  maxCapacity,
}: {
  currentCount: number;
  maxCapacity: number;
}) {
  const percentage = getCrowdPercentage(currentCount, maxCapacity);
  const level = getCrowdLevel(currentCount, maxCapacity);

  const colors = {
    low: "text-emerald-500",
    medium: "text-amber-500",
    high: "text-red-500",
  };

  const bgColors = {
    low: "bg-emerald-500/10",
    medium: "bg-amber-500/10",
    high: "bg-red-500/10",
  };

  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full", bgColors[level])}>
      <motion.div
        className={cn("w-1.5 h-1.5 rounded-full", colors[level].replace("text-", "bg-"))}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span className={cn("text-xs font-medium", colors[level])}>
        {percentage}% Full
      </span>
    </div>
  );
}

export default CrowdMeter;
