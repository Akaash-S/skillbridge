import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { Layout } from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiClient } from "@/services/apiClient";
import { 
  User, 
  Mail, 
  Bell, 
  Download,
  Upload,
  Trophy,
  Target,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Save,
  RefreshCw,
  Palette
} from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  education: string;
  experience: string;
  interests: string[];
  notifications: boolean;
  weeklyGoal: number;
  bio?: string;
  location?: string;
  onboardingCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UserStats {
  skillsCount: number;
  skillsByLevel: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  roadmapProgress: number;
  totalMilestones: number;
  completedMilestones: number;
  recentActivityCount: number;
}

export const Profile = () => {
  const { user } = useAuth();
  const { userSkills, selectedRole, analysis } = useAppData();
  
  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data state
  const [profileData, setProfileData] = useState<UserProfile>({
    name: "",
    email: "",
    education: "",
    experience: "",
    interests: [],
    notifications: true,
    weeklyGoal: 10,
    bio: "",
    location: ""
  });
  
  const [userStats, setUserStats] = useState<UserStats>({
    skillsCount: 0,
    skillsByLevel: { beginner: 0, intermediate: 0, advanced: 0 },
    roadmapProgress: 0,
    totalMilestones: 0,
    completedMilestones: 0,
    recentActivityCount: 0
  });

  // Load data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load profile and stats in parallel
      const [profileResponse, statsResponse] = await Promise.allSettled([
        apiClient.get<{ profile: UserProfile }>('/users/profile'),
        apiClient.get<{ stats: UserStats }>('/users/stats')
      ]);

      // Handle profile data
      if (profileResponse.status === 'fulfilled') {
        const profile = profileResponse.value.profile;
        setProfileData({
          name: profile.name || user?.name || "",
          email: profile.email || user?.email || "",
          avatar: profile.avatar || user?.avatar || "",
          education: profile.education || "",
          experience: profile.experience || "",
          interests: profile.interests || [],
          notifications: profile.notifications ?? true,
          weeklyGoal: profile.weeklyGoal || 10,
          bio: profile.bio || "Passionate learner focused on career growth and skill development.",
          location: profile.location || "Remote",
          onboardingCompleted: profile.onboardingCompleted,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        });
      } else {
        console.warn('Failed to load profile:', profileResponse.reason);
        // Use fallback data from auth context
        setProfileData(prev => ({
          ...prev,
          name: user?.name || "",
          email: user?.email || "",
          avatar: user?.avatar || ""
        }));
      }

      // Handle stats data
      if (statsResponse.status === 'fulfilled') {
        setUserStats(statsResponse.value.stats);
      } else {
        console.warn('Failed to load stats:', statsResponse.reason);
        // Use fallback data from context
        setUserStats({
          skillsCount: userSkills.length,
          skillsByLevel: { beginner: 0, intermediate: 0, advanced: 0 },
          roadmapProgress: analysis?.readinessScore || 0,
          totalMilestones: 0,
          completedMilestones: 0,
          recentActivityCount: 0
        });
      }

    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        education: profileData.education,
        experience: profileData.experience,
        interests: profileData.interests,
        notifications: profileData.notifications,
        weeklyGoal: profileData.weeklyGoal,
        bio: profileData.bio,
        location: profileData.location
      };

      const response = await apiClient.put<{ message: string; profile: UserProfile }>('/users/profile', updateData);
      
      // Update local state with response
      setProfileData(prev => ({ ...prev, ...response.profile }));
      setIsEditing(false);
      
      toast.success('Profile updated successfully!');
      
      // Clear cache to ensure fresh data
      apiClient.clearCache('/users');
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Export profile data
      const profileExport = {
        profile: profileData,
        stats: userStats,
        skills: userSkills,
        targetRole: selectedRole,
        readinessScore: analysis?.readinessScore || 0,
        exportDate: new Date().toISOString(),
        version: '2.0'
      };
      
      const blob = new Blob([JSON.stringify(profileExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skillbridge-profile-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Profile data exported successfully!");
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export profile data');
    }
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading profile...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.avatar} alt={profileData.name} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profileData.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{profileData.name}</h1>
                    <p className="text-muted-foreground">{profileData.email}</p>
                    {profileData.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {profileData.location}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => loadProfileData()}
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button 
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      disabled={saving}
                    >
                      {saving ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : isEditing ? (
                        <Save className="h-4 w-4 mr-2" />
                      ) : (
                        <User className="h-4 w-4 mr-2" />
                      )}
                      {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <Badge variant="secondary" className="gap-1">
                    <Trophy className="h-3 w-3" />
                    {userStats.skillsCount} Skills
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Target className="h-3 w-3" />
                    {userStats.roadmapProgress}% Progress
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    Member since {formatDate(profileData.createdAt)}
                  </Badge>
                  {profileData.onboardingCompleted && (
                    <Badge variant="outline" className="gap-1 text-green-600">
                      <GraduationCap className="h-3 w-3" />
                      Onboarded
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and bio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Tell us about yourself and your career goals..."
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="e.g., Remote, New York, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience</Label>
                    <Select
                      value={profileData.experience}
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, experience: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1 years">0-1 years</SelectItem>
                        <SelectItem value="1-2 years">1-2 years</SelectItem>
                        <SelectItem value="2-3 years">2-3 years</SelectItem>
                        <SelectItem value="3-5 years">3-5 years</SelectItem>
                        <SelectItem value="5-10 years">5-10 years</SelectItem>
                        <SelectItem value="10+ years">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="education">Education</Label>
                    <Select
                      value={profileData.education}
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, education: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select education" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High School">High School</SelectItem>
                        <SelectItem value="Associate Degree">Associate Degree</SelectItem>
                        <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                        <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                        <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                        <SelectItem value="Self-taught">Self-taught</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weeklyGoal">Weekly Learning Goal (hours)</Label>
                    <Select
                      value={profileData.weeklyGoal.toString()}
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, weeklyGoal: parseInt(value) }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 hours/week</SelectItem>
                        <SelectItem value="10">10 hours/week</SelectItem>
                        <SelectItem value="15">15 hours/week</SelectItem>
                        <SelectItem value="20">20 hours/week</SelectItem>
                        <SelectItem value="25">25 hours/week</SelectItem>
                        <SelectItem value="30">30 hours/week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notifications"
                        checked={profileData.notifications}
                        onCheckedChange={(checked) => setProfileData(prev => ({ ...prev, notifications: checked }))}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="notifications">Enable Notifications</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Skills Added</span>
                  <Badge variant="outline">{userStats.skillsCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Target Role</span>
                  <Badge variant="outline">{selectedRole?.title || "None"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Roadmap Progress</span>
                  <Badge variant="outline">{userStats.roadmapProgress}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Milestones</span>
                  <Badge variant="outline">{userStats.completedMilestones}/{userStats.totalMilestones}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recent Activity</span>
                  <Badge variant="outline">{userStats.recentActivityCount}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Skills Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Skills by Level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Beginner</span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    {userStats.skillsByLevel.beginner}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Intermediate</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {userStats.skillsByLevel.intermediate}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Advanced</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {userStats.skillsByLevel.advanced}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => toast.info("Import feature coming soon!")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => toast.info("Theme customization coming soon!")}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Customize Theme
                </Button>
              </CardContent>
            </Card>

            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Created:</span> {formatDate(profileData.createdAt)}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {formatDate(profileData.updatedAt)}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {profileData.onboardingCompleted ? 'Active' : 'Pending Setup'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};