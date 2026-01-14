import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { skillsDatabase } from "@/data/mockData";
import { Map, Plus, GripVertical, Trash2, Calendar, Flag, Save, Copy, Clock, ArrowDown } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoadmapMilestone {
  id: string;
  skillId: string;
  skillName: string;
  priority: "low" | "medium" | "high";
  deadline: string;
  notes: string;
}

export const RoadmapBuilder = () => {
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([
    { id: "1", skillId: "react", skillName: "React", priority: "high", deadline: "2024-02-01", notes: "Master hooks and state management" },
    { id: "2", skillId: "ts", skillName: "TypeScript", priority: "high", deadline: "2024-02-15", notes: "Learn generics and advanced types" },
    { id: "3", skillId: "nodejs", skillName: "Node.js", priority: "medium", deadline: "2024-03-01", notes: "Build REST APIs" },
  ]);

  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const addMilestone = () => {
    if (!selectedSkill) return;
    const skill = skillsDatabase.find(s => s.id === selectedSkill);
    if (!skill) return;

    const newMilestone: RoadmapMilestone = {
      id: Date.now().toString(),
      skillId: skill.id,
      skillName: skill.name,
      priority: "medium",
      deadline: "",
      notes: "",
    };
    setMilestones([...milestones, newMilestone]);
    setSelectedSkill("");
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const updateMilestone = (id: string, updates: Partial<RoadmapMilestone>) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = milestones.findIndex(m => m.id === draggedItem);
    const targetIndex = milestones.findIndex(m => m.id === targetId);

    const newMilestones = [...milestones];
    const [removed] = newMilestones.splice(draggedIndex, 1);
    newMilestones.splice(targetIndex, 0, removed);
    setMilestones(newMilestones);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const getPriorityColor = (priority: RoadmapMilestone["priority"]) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-muted text-muted-foreground";
    }
  };

  const availableSkills = skillsDatabase.filter(
    skill => !milestones.some(m => m.skillId === skill.id)
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Map className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Roadmap Builder</h1>
                <p className="text-muted-foreground">Create your custom learning path</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Roadmap
              </Button>
            </div>
          </div>
        </div>

        {/* Add Skill Section */}
        <Card>
          <CardHeader>
            <CardTitle>Add Skill to Roadmap</CardTitle>
            <CardDescription>Select a skill to add as a milestone</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a skill..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSkills.map(skill => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name} ({skill.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addMilestone} disabled={!selectedSkill}>
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Your Learning Path</CardTitle>
            <CardDescription>Drag and drop to reorder milestones</CardDescription>
          </CardHeader>
          <CardContent>
            {milestones.length > 0 ? (
              <div className="space-y-0">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id}>
                    <div
                      draggable
                      onDragStart={() => handleDragStart(milestone.id)}
                      onDragOver={(e) => handleDragOver(e, milestone.id)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-start gap-4 p-4 rounded-lg border bg-card transition-all ${
                        draggedItem === milestone.id ? "opacity-50 border-primary" : "hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{milestone.skillName}</h4>
                            <Badge className={getPriorityColor(milestone.priority)}>
                              <Flag className="h-3 w-3 mr-1" />
                              {milestone.priority}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMilestone(milestone.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Priority</label>
                            <Select
                              value={milestone.priority}
                              onValueChange={(value) => updateMilestone(milestone.id, { priority: value as RoadmapMilestone["priority"] })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Deadline</label>
                            <Input
                              id={`milestone-deadline-${milestone.id}`}
                              name={`milestone-deadline-${milestone.id}`}
                              type="date"
                              value={milestone.deadline}
                              onChange={(e) => updateMilestone(milestone.id, { deadline: e.target.value })}
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Notes</label>
                            <Input
                              id={`milestone-notes-${milestone.id}`}
                              name={`milestone-notes-${milestone.id}`}
                              placeholder="Add notes..."
                              value={milestone.notes}
                              onChange={(e) => updateMilestone(milestone.id, { notes: e.target.value })}
                              className="h-8"
                              autoComplete="off"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {index < milestones.length - 1 && (
                      <div className="flex justify-center py-2">
                        <ArrowDown className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No milestones yet. Add skills to build your roadmap!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {milestones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Roadmap Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Milestones</p>
                  <p className="text-2xl font-bold">{milestones.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold text-destructive">
                    {milestones.filter(m => m.priority === "high").length}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">With Deadlines</p>
                  <p className="text-2xl font-bold">
                    {milestones.filter(m => m.deadline).length}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Estimated Time</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <Clock className="h-5 w-5" />
                    {milestones.length * 15}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};
