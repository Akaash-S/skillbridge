import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Layout } from "@/components/Layout";
import { SkillChip } from "@/components/SkillChip";
import { StepIndicator } from "@/components/StepIndicator";
import { skillsDatabase, ProficiencyLevel } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, ArrowRight, Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const Skills = () => {
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [proficiency, setProficiency] = useState<ProficiencyLevel>("intermediate");
  
  const { userSkills, addSkill, removeSkill, updateSkillProficiency } = useApp();
  const navigate = useNavigate();

  const availableSkills = useMemo(() => {
    return skillsDatabase.filter(
      (skill) =>
        !userSkills.some((s) => s.id === skill.id) &&
        skill.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, userSkills]);

  const groupedSkills = useMemo(() => {
    const groups: Record<string, typeof availableSkills> = {};
    availableSkills.forEach((skill) => {
      if (!groups[skill.category]) {
        groups[skill.category] = [];
      }
      groups[skill.category].push(skill);
    });
    return groups;
  }, [availableSkills]);

  const handleAddSkill = () => {
    if (!selectedSkill) {
      toast({
        title: "Select a skill",
        description: "Please select a skill to add.",
        variant: "destructive",
      });
      return;
    }
    addSkill(selectedSkill, proficiency);
    setSelectedSkill("");
    toast({
      title: "Skill added",
      description: "Your skill has been added to your profile.",
    });
  };

  const handleContinue = () => {
    if (userSkills.length === 0) {
      toast({
        title: "Add at least one skill",
        description: "Please add at least one skill before continuing.",
        variant: "destructive",
      });
      return;
    }
    navigate("/roles");
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Step Indicator */}
        <StepIndicator currentStep={1} />

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Add Your Skills</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tell us what skills you already have. Be honest about your proficiency levels 
            for the most accurate analysis.
          </p>
        </div>

        {/* Add Skill Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add a New Skill</CardTitle>
            <CardDescription>
              Search and select skills, then rate your proficiency level.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {Object.entries(groupedSkills).map(([category, skills]) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {category}
                      </div>
                      {skills.map((skill) => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={proficiency}
                onValueChange={(v) => setProficiency(v as ProficiencyLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddSkill} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          </CardContent>
        </Card>

        {/* Current Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Skills ({userSkills.length})</CardTitle>
            <CardDescription>
              Click on a skill to update proficiency, or remove it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userSkills.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No skills added yet.</p>
                <p className="text-sm">Search and add skills above to get started.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userSkills.map((skill) => (
                  <div key={skill.id} className="group relative">
                    <SkillChip
                      name={skill.name}
                      proficiency={skill.proficiency}
                      onRemove={() => removeSkill(skill.id)}
                    />
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="bg-popover border border-border rounded-lg shadow-lg p-2 flex gap-1">
                        {(["beginner", "intermediate", "advanced"] as ProficiencyLevel[]).map(
                          (level) => (
                            <button
                              key={level}
                              onClick={() => updateSkillProficiency(skill.id, level)}
                              className={`px-2 py-1 text-xs rounded capitalize ${
                                skill.proficiency === level
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                            >
                              {level}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            size="lg"
            className="group"
            disabled={userSkills.length === 0}
          >
            Choose Target Role
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </Layout>
  );
};
