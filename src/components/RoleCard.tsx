import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { JobRole } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RoleCardProps {
  role: JobRole;
  onClick?: () => void;
  selected?: boolean;
}

const demandConfig = {
  high: { icon: TrendingUp, label: "High Demand", className: "bg-success/10 text-success" },
  medium: { icon: Minus, label: "Medium Demand", className: "bg-warning/10 text-warning" },
  low: { icon: TrendingDown, label: "Low Demand", className: "bg-muted text-muted-foreground" },
};

export const RoleCard = ({ role, onClick, selected }: RoleCardProps) => {
  const demand = demandConfig[role.demand];
  const DemandIcon = demand.icon;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        selected && "ring-2 ring-primary shadow-lg"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
            {role.title}
          </CardTitle>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
        <Badge variant="secondary" className="w-fit text-xs">
          {role.category}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {role.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {role.avgSalary}
          </span>
          <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", demand.className)}>
            <DemandIcon className="h-3 w-3" />
            {demand.label}
          </div>
        </div>
        
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {role.requiredSkills.length} required skills
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
