import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Layout } from "@/components/Layout";
import { RoleCard } from "@/components/RoleCard";
import { SkillChip } from "@/components/SkillChip";
import { StepIndicator } from "@/components/StepIndicator";
import { jobRolesDatabase, skillsDatabase } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, Briefcase, DollarSign, TrendingUp, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const Roles = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  
  const { selectedRole, selectRole } = useApp();
  const navigate = useNavigate();

  const categories = useMemo(() => {
    return [...new Set(jobRolesDatabase.map((role) => role.category))];
  }, []);

  const filteredRoles = useMemo(() => {
    return jobRolesDatabase.filter((role) => {
      const matchesSearch = role.title.toLowerCase().includes(search.toLowerCase()) ||
        role.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || role.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const detailRole = useMemo(() => {
    return jobRolesDatabase.find((r) => r.id === selectedRoleId);
  }, [selectedRoleId]);

  const handleSelectRole = (roleId: string) => {
    const role = jobRolesDatabase.find((r) => r.id === roleId);
    if (role) {
      selectRole(role);
      toast({
        title: "Role selected",
        description: `${role.title} has been set as your target role.`,
      });
    }
  };

  const handleContinue = () => {
    if (!selectedRole) {
      toast({
        title: "Select a role",
        description: "Please select a target role before continuing.",
        variant: "destructive",
      });
      return;
    }
    navigate("/analysis");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Step Indicator */}
        <StepIndicator currentStep={2} />

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Choose Your Target Role</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select the job role you want to work towards. We'll analyze your skills 
            and create a personalized roadmap.
          </p>
        </div>

        {/* Selected Role Banner */}
        {selectedRole && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selected Target Role</p>
                <p className="font-semibold text-lg">{selectedRole.title}</p>
              </div>
            </div>
            <Button onClick={handleContinue} className="group">
              Analyze Skills
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant={categoryFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Role Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              selected={selectedRole?.id === role.id}
              onClick={() => setSelectedRoleId(role.id)}
            />
          ))}
        </div>

        {filteredRoles.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No roles found matching your search.</p>
          </div>
        )}

        {/* Role Detail Dialog */}
        <Dialog open={!!detailRole} onOpenChange={() => setSelectedRoleId(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {detailRole && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        {detailRole.category}
                      </Badge>
                      <DialogTitle className="text-2xl">{detailRole.title}</DialogTitle>
                    </div>
                  </div>
                  <DialogDescription className="text-base">
                    {detailRole.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                  {/* Salary & Demand */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{detailRole.avgSalary}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium capitalize">{detailRole.demand} Demand</span>
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div>
                    <h4 className="font-semibold mb-3">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {detailRole.requiredSkills.map((req) => {
                        const skill = skillsDatabase.find((s) => s.id === req.skillId);
                        return (
                          <SkillChip
                            key={req.skillId}
                            name={skill?.name || req.skillId}
                            proficiency={req.minProficiency}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => {
                        handleSelectRole(detailRole.id);
                        setSelectedRoleId(null);
                      }}
                      className="flex-1"
                    >
                      {selectedRole?.id === detailRole.id ? "Selected ✓" : "Select This Role"}
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedRoleId(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};
