import { X } from "lucide-react";
import { ProficiencyLevel } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface SkillChipProps {
  name: string;
  proficiency?: ProficiencyLevel;
  onRemove?: () => void;
  onClick?: () => void;
  selected?: boolean;
  size?: "sm" | "md" | "lg";
  showProficiency?: boolean;
}

const proficiencyColors: Record<ProficiencyLevel, string> = {
  beginner: "bg-skill-beginner/10 text-skill-beginner border-skill-beginner/30",
  intermediate: "bg-skill-intermediate/10 text-skill-intermediate border-skill-intermediate/30",
  advanced: "bg-skill-advanced/10 text-skill-advanced border-skill-advanced/30",
};

const proficiencyLabels: Record<ProficiencyLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const SkillChip = ({
  name,
  proficiency,
  onRemove,
  onClick,
  selected,
  size = "md",
  showProficiency = true,
}: SkillChipProps) => {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border transition-all duration-200",
        sizeClasses[size],
        proficiency && showProficiency
          ? proficiencyColors[proficiency]
          : "bg-secondary text-secondary-foreground border-border",
        onClick && "cursor-pointer hover:scale-105",
        selected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <span className="font-medium">{name}</span>
      {proficiency && showProficiency && (
        <span className="text-xs opacity-75">• {proficiencyLabels[proficiency]}</span>
      )}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};
