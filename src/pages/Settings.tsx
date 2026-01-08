import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Palette, 
  BookOpen, 
  Target, 
  Bell, 
  Shield, 
  Accessibility, 
  User,
  Sun,
  Moon,
  Monitor,
  Download,
  Trash2,
  RotateCcw,
  LogOut,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Keyboard,
  Contrast
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Settings = () => {
  const { toast } = useToast();
  
  // Appearance settings
  const [theme, setTheme] = useState("system");
  const [accentColor, setAccentColor] = useState("blue");
  const [fontSize, setFontSize] = useState("medium");
  const [density, setDensity] = useState("comfortable");
  const [animationLevel, setAnimationLevel] = useState("full");
  
  // Learning preferences
  const [learningPace, setLearningPace] = useState("balanced");
  const [roadmapStyle, setRoadmapStyle] = useState("milestone");
  const [difficultyPref, setDifficultyPref] = useState("balanced");
  const [dailyTarget, setDailyTarget] = useState([30]);
  const [resourceType, setResourceType] = useState("mixed");
  
  // Career focus
  const [primaryGoal, setPrimaryGoal] = useState("Frontend Developer");
  const [targetTimeline, setTargetTimeline] = useState("6-12");
  const [careerPriority, setCareerPriority] = useState("job-ready");
  const [opportunityTypes, setOpportunityTypes] = useState(["full-time", "internships"]);
  
  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [skillReminders, setSkillReminders] = useState(true);
  const [roadmapUpdates, setRoadmapUpdates] = useState(true);
  const [readinessAlerts, setReadinessAlerts] = useState(true);
  const [opportunityAlerts, setOpportunityAlerts] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState("daily");
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  
  // Privacy
  const [profileVisibility, setProfileVisibility] = useState("private");
  const [dataUsage, setDataUsage] = useState("recommendations");
  const [activityTracking, setActivityTracking] = useState(true);
  
  // Accessibility
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState(false);

  const accentColors = [
    { value: "blue", color: "hsl(220 90% 56%)", label: "Blue" },
    { value: "indigo", color: "hsl(239 84% 67%)", label: "Indigo" },
    { value: "green", color: "hsl(160 84% 39%)", label: "Green" },
    { value: "purple", color: "hsl(280 65% 60%)", label: "Purple" },
  ];

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data export started",
      description: "You'll receive a download link in your email shortly.",
    });
  };

  const handleResetProgress = () => {
    toast({
      title: "Progress reset",
      description: "All your learning progress has been reset.",
      variant: "destructive",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "Your account will be deleted within 30 days.",
      variant: "destructive",
    });
  };

  const toggleOpportunityType = (type: string) => {
    if (opportunityTypes.includes(type)) {
      setOpportunityTypes(opportunityTypes.filter(t => t !== type));
    } else {
      setOpportunityTypes([...opportunityTypes, type]);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your SkillBridge experience</p>
        </div>

        <Accordion type="multiple" defaultValue={["appearance"]} className="space-y-4">
          {/* 1. Appearance & Interface */}
          <AccordionItem value="appearance" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Appearance & Interface</h3>
                  <p className="text-sm text-muted-foreground">Customize how the app looks and feels</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="space-y-6">
                {/* Theme Mode */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Theme Mode</Label>
                  <RadioGroup value={theme} onValueChange={setTheme} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                        <Sun className="h-4 w-4" /> Light
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                        <Moon className="h-4 w-4" /> Dark
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                        <Monitor className="h-4 w-4" /> System
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Accent Color */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Accent Color</Label>
                  <div className="flex gap-3">
                    {accentColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setAccentColor(color.value)}
                        className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                          accentColor === color.value ? "border-foreground scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color.color }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Font Size */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Font Size</Label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium (Default)</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Interface Density */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Interface Density</Label>
                  <RadioGroup value={density} onValueChange={setDensity} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="compact" id="compact" />
                      <Label htmlFor="compact" className="cursor-pointer">Compact</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="comfortable" id="comfortable" />
                      <Label htmlFor="comfortable" className="cursor-pointer">Comfortable</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="spacious" id="spacious" />
                      <Label htmlFor="spacious" className="cursor-pointer">Spacious</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Animation Level */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Animation Level</Label>
                  <Select value={animationLevel} onValueChange={setAnimationLevel}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Animations</SelectItem>
                      <SelectItem value="reduced">Reduced Motion</SelectItem>
                      <SelectItem value="none">No Animations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Learning Preferences */}
          <AccordionItem value="learning" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <BookOpen className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Learning Preferences</h3>
                  <p className="text-sm text-muted-foreground">Adapt the platform to how you learn best</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="space-y-6">
                {/* Learning Pace */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Learning Pace</Label>
                  <RadioGroup value={learningPace} onValueChange={setLearningPace} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="relaxed" id="relaxed" />
                      <Label htmlFor="relaxed" className="cursor-pointer">Relaxed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="balanced" id="balanced-pace" />
                      <Label htmlFor="balanced-pace" className="cursor-pointer">Balanced</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fast" id="fast" />
                      <Label htmlFor="fast" className="cursor-pointer">Fast-paced</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Roadmap Style */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Roadmap Style</Label>
                  <Select value={roadmapStyle} onValueChange={setRoadmapStyle}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="step-by-step">Step-by-step</SelectItem>
                      <SelectItem value="milestone">Milestone-based</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Difficulty Preference */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Skill Difficulty Preference</Label>
                  <RadioGroup value={difficultyPref} onValueChange={setDifficultyPref} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easy" id="easy" />
                      <Label htmlFor="easy" className="cursor-pointer">Start Easy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="balanced" id="balanced-diff" />
                      <Label htmlFor="balanced-diff" className="cursor-pointer">Balanced</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced" className="cursor-pointer">Jump to Advanced</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Daily Learning Target */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-sm font-medium">Daily Learning Target</Label>
                    <span className="text-sm font-medium text-primary">{dailyTarget[0]} min</span>
                  </div>
                  <Slider
                    value={dailyTarget}
                    onValueChange={setDailyTarget}
                    min={15}
                    max={120}
                    step={15}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>15 min</span>
                    <span>2 hours</span>
                  </div>
                </div>

                <Separator />

                {/* Preferred Resource Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Preferred Resource Type</Label>
                  <Select value={resourceType} onValueChange={setResourceType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="practice">Practice-based</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Career Focus & Goals */}
          <AccordionItem value="career" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Target className="h-5 w-5 text-[hsl(var(--warning))]" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Career Focus & Goals</h3>
                  <p className="text-sm text-muted-foreground">Fine-tune what SkillBridge optimizes for</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="space-y-6">
                {/* Primary Career Goal */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Primary Career Goal</Label>
                  <Input
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value)}
                    placeholder="e.g., Frontend Developer"
                    className="max-w-sm"
                  />
                </div>

                <Separator />

                {/* Target Timeline */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Target Timeline</Label>
                  <RadioGroup value={targetTimeline} onValueChange={setTargetTimeline} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="asap" id="asap" />
                      <Label htmlFor="asap" className="cursor-pointer">ASAP</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3-6" id="3-6" />
                      <Label htmlFor="3-6" className="cursor-pointer">3–6 months</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="6-12" id="6-12" />
                      <Label htmlFor="6-12" className="cursor-pointer">6–12 months</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Career Priority */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Career Priority</Label>
                  <Select value={careerPriority} onValueChange={setCareerPriority}>
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="job-ready">Job-ready ASAP</SelectItem>
                      <SelectItem value="fundamentals">Strong Fundamentals</SelectItem>
                      <SelectItem value="mastery">Long-term Mastery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Opportunity Type Preference */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Opportunity Type Preference</Label>
                  <div className="flex flex-wrap gap-2">
                    {["internships", "full-time", "freelance", "open-source"].map((type) => (
                      <Badge
                        key={type}
                        variant={opportunityTypes.includes(type) ? "default" : "outline"}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleOpportunityType(type)}
                      >
                        {type.replace("-", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Notifications & Activity Control */}
          <AccordionItem value="notifications" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <Bell className="h-5 w-5 text-[hsl(var(--info))]" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Notifications & Activity</h3>
                  <p className="text-sm text-muted-foreground">Control when and how you are notified</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="space-y-6">
                {/* Master Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {notificationsEnabled ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                    <div>
                      <Label className="text-sm font-medium">Enable Notifications</Label>
                      <p className="text-xs text-muted-foreground">Master toggle for all notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>

                <Separator />

                {/* Notification Types */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Notification Types</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm cursor-pointer" htmlFor="skill-reminders">Skill completion reminders</Label>
                      <Switch
                        id="skill-reminders"
                        checked={skillReminders}
                        onCheckedChange={setSkillReminders}
                        disabled={!notificationsEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm cursor-pointer" htmlFor="roadmap-updates">Roadmap updates</Label>
                      <Switch
                        id="roadmap-updates"
                        checked={roadmapUpdates}
                        onCheckedChange={setRoadmapUpdates}
                        disabled={!notificationsEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm cursor-pointer" htmlFor="readiness-alerts">Readiness improvements</Label>
                      <Switch
                        id="readiness-alerts"
                        checked={readinessAlerts}
                        onCheckedChange={setReadinessAlerts}
                        disabled={!notificationsEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm cursor-pointer" htmlFor="opportunity-alerts">New opportunities</Label>
                      <Switch
                        id="opportunity-alerts"
                        checked={opportunityAlerts}
                        onCheckedChange={setOpportunityAlerts}
                        disabled={!notificationsEnabled}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Notification Frequency */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Notification Frequency</Label>
                  <Select value={notificationFrequency} onValueChange={setNotificationFrequency} disabled={!notificationsEnabled}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Quiet Hours */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Quiet Hours</Label>
                      <p className="text-xs text-muted-foreground">Do not disturb time window</p>
                    </div>
                    <Switch
                      checked={quietHoursEnabled}
                      onCheckedChange={setQuietHoursEnabled}
                      disabled={!notificationsEnabled}
                    />
                  </div>
                  {quietHoursEnabled && notificationsEnabled && (
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">From</Label>
                        <Input
                          type="time"
                          value={quietStart}
                          onChange={(e) => setQuietStart(e.target.value)}
                          className="w-32"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">To</Label>
                        <Input
                          type="time"
                          value={quietEnd}
                          onChange={(e) => setQuietEnd(e.target.value)}
                          className="w-32"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 5. Privacy & Data Control */}
          <AccordionItem value="privacy" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Shield className="h-5 w-5 text-destructive" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Privacy & Data Control</h3>
                  <p className="text-sm text-muted-foreground">Manage your data and privacy settings</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="space-y-6">
                {/* Profile Visibility */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Profile Visibility</Label>
                  <RadioGroup value={profileVisibility} onValueChange={setProfileVisibility} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                        <EyeOff className="h-4 w-4" /> Private
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="limited" id="limited" />
                      <Label htmlFor="limited" className="flex items-center gap-2 cursor-pointer">
                        <Eye className="h-4 w-4" /> Limited
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Skill Data Usage */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Skill Data Usage</Label>
                  <Select value={dataUsage} onValueChange={setDataUsage}>
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommendations">Use for recommendations only</SelectItem>
                      <SelectItem value="insights">Allow anonymized insights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Activity Tracking */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Activity Tracking</Label>
                    <p className="text-xs text-muted-foreground">Enable learning analytics</p>
                  </div>
                  <Switch
                    checked={activityTracking}
                    onCheckedChange={setActivityTracking}
                  />
                </div>

                <Separator />

                {/* Data Actions */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Data Actions</Label>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export My Data
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset Progress
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete all your learning progress, completed skills, and roadmap data. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleResetProgress} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Reset Progress
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete your account and all associated data. You will have 30 days to cancel this request. This action cannot be undone after that period.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 6. Accessibility Settings */}
          <AccordionItem value="accessibility" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Accessibility className="h-5 w-5 text-[hsl(var(--success))]" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Accessibility</h3>
                  <p className="text-sm text-muted-foreground">Make the platform more accessible</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Contrast className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">High Contrast Mode</Label>
                      <p className="text-xs text-muted-foreground">Increase contrast for better visibility</p>
                    </div>
                  </div>
                  <Switch checked={highContrast} onCheckedChange={setHighContrast} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Reduced Motion</Label>
                    <p className="text-xs text-muted-foreground">Minimize animations and transitions</p>
                  </div>
                  <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Screen Reader Optimization</Label>
                    <p className="text-xs text-muted-foreground">Improve compatibility with screen readers</p>
                  </div>
                  <Switch checked={screenReader} onCheckedChange={setScreenReader} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Keyboard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">Keyboard Navigation Mode</Label>
                      <p className="text-xs text-muted-foreground">Enhanced focus indicators for keyboard users</p>
                    </div>
                  </div>
                  <Switch checked={keyboardNav} onCheckedChange={setKeyboardNav} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Color-blind Friendly Palette</Label>
                    <p className="text-xs text-muted-foreground">Use colors optimized for color blindness</p>
                  </div>
                  <Switch checked={colorBlindMode} onCheckedChange={setColorBlindMode} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 7. Account Management */}
          <AccordionItem value="account" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <User className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Account Management</h3>
                  <p className="text-sm text-muted-foreground">Manage your account and sessions</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="space-y-6">
                {/* Linked Account */}
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Google Account</p>
                        <p className="text-xs text-muted-foreground">user@gmail.com</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Re-authenticate</Button>
                  </div>
                </div>

                <Separator />

                {/* Session Management */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Session Management</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Current Session</p>
                        <p className="text-xs text-muted-foreground">Chrome on macOS • Active now</p>
                      </div>
                      <Badge variant="secondary">Current</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Logout Options */}
                <div className="flex gap-3">
                  <Button variant="outline">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                  <Button variant="outline">
                    Logout from all devices
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} size="lg" className="px-8">
            Save Settings
          </Button>
        </div>
      </div>
    </Layout>
  );
};