import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { educationLevels, experienceLevels, careerInterests } from "@/data/mockData";
import { 
  User, 
  Mail, 
  GraduationCap, 
  Briefcase, 
  Heart, 
  Bell, 
  Target,
  Camera,
  Save,
  Trash2,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const avatarOptions = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
];

export const Profile = () => {
  const { updateUserProfile, resetProgress, loading, error, clearError } = useAppData();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: avatarOptions[0],
    education: "",
    experience: "",
    interests: [] as string[],
    notifications: true,
    weeklyGoal: 10,
  });

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load user profile data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || avatarOptions[0],
        education: user.education || "",
        experience: user.experience || "",
        interests: user.interests || [],
        notifications: user.notifications ?? true,
        weeklyGoal: user.weeklyGoal || 10,
      });
      setHasChanges(false);
    }
  }, [user]);

  // Track changes to enable/disable save button
  useEffect(() => {
    if (user) {
      const hasChanged = 
        formData.name !== (user.name || "") ||
        formData.email !== (user.email || "") ||
        formData.avatar !== (user.avatar || avatarOptions[0]) ||
        formData.education !== (user.education || "") ||
        formData.experience !== (user.experience || "") ||
        JSON.stringify(formData.interests) !== JSON.stringify(user.interests || []) ||
        formData.notifications !== (user.notifications ?? true) ||
        formData.weeklyGoal !== (user.weeklyGoal || 10);
      
      setHasChanges(hasChanged);
    }
  }, [formData, user]);

  const handleSave = async () => {
    if (!hasChanges) {
      toast({
        title: "No changes to save",
        description: "Your profile is already up to date.",
      });
      return;
    }

    try {
      setIsLoading(true);
      await updateUserProfile(formData);
      setHasChanges(false);
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleReset = () => {
    resetProgress();
    toast({
      title: "Progress reset",
      description: "Your skill analysis and roadmap have been cleared.",
    });
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Show loading state while user data is being loaded
  if (!user && loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-muted-foreground">Loading profile...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            className="gap-2" 
            disabled={!hasChanges || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-destructive">
                  <span className="font-medium">Error:</span>
                  <span>{error}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Changes Indicator */}
        {hasChanges && (
          <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <span className="font-medium">Unsaved Changes:</span>
                <span>You have unsaved changes. Click "Save Changes" to persist them.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Profile Picture
            </CardTitle>
            <CardDescription>
              Choose an avatar to personalize your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={formData.avatar} alt={formData.name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials(formData.name || "U")}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
                Change Avatar
              </Button>
            </div>
            
            {showAvatarPicker && (
              <div className="grid grid-cols-6 gap-3 p-4 bg-muted/50 rounded-lg">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => {
                      setFormData({ ...formData, avatar });
                      setShowAvatarPicker(false);
                    }}
                    className={cn(
                      "p-1 rounded-full transition-all",
                      formData.avatar === avatar 
                        ? "ring-2 ring-primary ring-offset-2" 
                        : "hover:scale-110"
                    )}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={avatar} />
                    </Avatar>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your basic profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Background */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Background
            </CardTitle>
            <CardDescription>
              Your education and experience help us tailor recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Education Level</Label>
                <Select
                  value={formData.education}
                  onValueChange={(value) => setFormData({ ...formData, education: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select education" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select
                  value={formData.experience}
                  onValueChange={(value) => setFormData({ ...formData, experience: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Career Interests
            </CardTitle>
            <CardDescription>
              Select areas you're interested in pursuing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {careerInterests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={cn(
                    "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                    formData.interests.includes(interest)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary hover:text-primary"
                  )}
                >
                  {interest}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Customize your learning experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your progress
                </p>
              </div>
              <Switch
                checked={formData.notifications}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, notifications: checked })
                }
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Weekly Learning Goal
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Hours per week: {formData.weeklyGoal}
                  </p>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {formData.weeklyGoal}h
                </span>
              </div>
              <Slider
                value={[formData.weeklyGoal]}
                onValueChange={([value]) => 
                  setFormData({ ...formData, weeklyGoal: value })
                }
                min={1}
                max={40}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              These actions cannot be undone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={handleReset}>
                Reset Progress
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
