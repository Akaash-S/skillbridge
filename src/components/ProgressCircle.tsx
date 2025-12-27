import { cn } from "@/lib/utils";

interface ProgressCircleProps {
  value: number;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { size: 60, stroke: 6, fontSize: "text-sm" },
  md: { size: 100, stroke: 8, fontSize: "text-xl" },
  lg: { size: 150, stroke: 10, fontSize: "text-3xl" },
  xl: { size: 200, stroke: 12, fontSize: "text-4xl" },
};

export const ProgressCircle = ({
  value,
  size = "md",
  showLabel = true,
  className,
}: ProgressCircleProps) => {
  const config = sizeConfig[size];
  const radius = (config.size - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value >= 70) return "stroke-progress-high";
    if (value >= 40) return "stroke-progress-medium";
    return "stroke-progress-low";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={config.size}
        height={config.size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700 ease-out", getColor())}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", config.fontSize)}>{value}%</span>
        </div>
      )}
    </div>
  );
};
