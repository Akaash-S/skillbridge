import { useState, useEffect, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { apiClient } from "@/services/apiClient";
import jsPDF from 'jspdf';
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
  Palette,
  FileText,
  BarChart3,
  CheckCircle2,
  Clock,
  Star,
  Award
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
  const { userSkills, selectedRole, analysis, roadmap, analysisProgress } = useAppData();
  const pdfRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  
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
        // console.warn('Failed to load profile:', profileResponse.reason);
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
        // console.warn('Failed to load stats:', statsResponse.reason);
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
        // Note: email is not included as it's managed by Google
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
      setExportingPDF(true);
      toast.info('Generating comprehensive PDF report...', { duration: 3000 });
      
      await generateComprehensivePDF();
      
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export profile data');
    } finally {
      setExportingPDF(false);
    }
  };

  const generateComprehensivePDF = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    let yPosition = margin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with word wrap
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return lines.length * (fontSize * 0.35); // Return height used
    };

    // Header with logo and title
    pdf.setFillColor(59, 130, 246); // Blue background
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SkillBridge Profile Report', margin, 25);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 35);

    yPosition = 50;
    pdf.setTextColor(0, 0, 0);

    // Personal Information Section
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Personal Information', margin, yPosition);
    yPosition += 10;

    // Draw section separator
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const personalInfo = [
      ['Name:', profileData.name || 'Not specified'],
      ['Email:', profileData.email || 'Not specified'],
      ['Location:', profileData.location || 'Not specified'],
      ['Experience:', profileData.experience || 'Not specified'],
      ['Education:', profileData.education || 'Not specified'],
      ['Weekly Goal:', `${profileData.weeklyGoal} hours/week`],
      ['Member Since:', formatDate(profileData.createdAt)]
    ];

    personalInfo.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, margin + 40, yPosition);
      yPosition += 6;
    });

    // Bio section
    if (profileData.bio) {
      yPosition += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bio:', margin, yPosition);
      yPosition += 6;
      pdf.setFont('helvetica', 'normal');
      const bioHeight = addWrappedText(profileData.bio, margin, yPosition, contentWidth - 10, 10);
      yPosition += bioHeight + 5;
    }

    // Target Role Section
    checkPageBreak(30);
    yPosition += 10;
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Career Focus', margin, yPosition);
    yPosition += 10;

    pdf.setDrawColor(59, 130, 246);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    if (selectedRole) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Target Role:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(selectedRole.title, margin + 30, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Description:', margin, yPosition);
      yPosition += 6;
      pdf.setFont('helvetica', 'normal');
      const descHeight = addWrappedText(selectedRole.description, margin, yPosition, contentWidth - 10, 10);
      yPosition += descHeight + 8;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Category:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(selectedRole.category, margin + 25, yPosition);
      yPosition += 6;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Salary Range:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(selectedRole.avgSalary, margin + 35, yPosition);
      yPosition += 6;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Market Demand:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(selectedRole.demand.toUpperCase(), margin + 40, yPosition);
      yPosition += 10;
    } else {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'italic');
      pdf.text('No target role selected yet.', margin, yPosition);
      yPosition += 15;
    }

    // Skills Analysis Section
    checkPageBreak(40);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Skills Analysis', margin, yPosition);
    yPosition += 10;

    pdf.setDrawColor(59, 130, 246);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Skills summary
    const skillsByLevel = userSkills.reduce((acc, skill) => {
      acc[skill.proficiency] = (acc[skill.proficiency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total Skills: ${userSkills.length}`, margin, yPosition);
    yPosition += 8;

    const skillLevels = [
      ['Beginner:', skillsByLevel.beginner || 0],
      ['Intermediate:', skillsByLevel.intermediate || 0],
      ['Advanced:', skillsByLevel.advanced || 0]
    ];

    skillLevels.forEach(([level, count]) => {
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${level} ${count}`, margin + 10, yPosition);
      yPosition += 5;
    });

    // Job Readiness Score
    if (analysis) {
      yPosition += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Job Readiness Score: ${analysis.readinessScore}%`, margin, yPosition);
      yPosition += 8;

      // Draw progress bar for readiness score
      const barWidth = 100;
      const barHeight = 6;
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition, barWidth, barHeight, 'FD');
      
      const fillWidth = (analysis.readinessScore / 100) * barWidth;
      pdf.setFillColor(59, 130, 246);
      pdf.rect(margin, yPosition, fillWidth, barHeight, 'F');
      yPosition += 15;

      // Skills breakdown
      pdf.setFont('helvetica', 'bold');
      pdf.text('Skills Breakdown:', margin, yPosition);
      yPosition += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.text(`✓ Matched Skills: ${analysis.matchedSkills.length}`, margin + 5, yPosition);
      yPosition += 5;
      pdf.text(`⚠ Partial Skills: ${analysis.partialSkills.length}`, margin + 5, yPosition);
      yPosition += 5;
      pdf.text(`✗ Missing Skills: ${analysis.missingSkills.length}`, margin + 5, yPosition);
      yPosition += 10;
    }

    // Skills List
    checkPageBreak(30);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Skills Inventory', margin, yPosition);
    yPosition += 8;

    pdf.setDrawColor(59, 130, 246);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Group skills by category
    const skillsByCategory = userSkills.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, typeof userSkills>);

    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      checkPageBreak(20 + skills.length * 5);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(category, margin, yPosition);
      yPosition += 8;

      skills.forEach(skill => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`• ${skill.name}`, margin + 5, yPosition);
        
        // Proficiency badge
        const proficiencyColors = {
          beginner: [255, 193, 7],
          intermediate: [0, 123, 255],
          advanced: [40, 167, 69]
        };
        
        const color = proficiencyColors[skill.proficiency] || [128, 128, 128];
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        
        const badgeX = margin + 120;
        const badgeY = yPosition - 3;
        const badgeWidth = 25;
        const badgeHeight = 4;
        
        pdf.rect(badgeX, badgeY, badgeWidth, badgeHeight, 'F');
        pdf.text(skill.proficiency.toUpperCase(), badgeX + 2, yPosition - 0.5);
        
        pdf.setTextColor(0, 0, 0);
        yPosition += 6;
      });
      yPosition += 5;
    });

    // Roadmap Progress Section
    if (roadmap && roadmap.length > 0) {
      checkPageBreak(40);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Learning Roadmap Progress', margin, yPosition);
      yPosition += 10;

      pdf.setDrawColor(59, 130, 246);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      const completedItems = roadmap.filter(item => item.completed).length;
      const progressPercent = Math.round((completedItems / roadmap.length) * 100);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Progress: ${completedItems}/${roadmap.length} items completed (${progressPercent}%)`, margin, yPosition);
      yPosition += 8;

      // Progress bar
      const barWidth = 120;
      const barHeight = 8;
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition, barWidth, barHeight, 'FD');
      
      const fillWidth = (progressPercent / 100) * barWidth;
      pdf.setFillColor(40, 167, 69);
      pdf.rect(margin, yPosition, fillWidth, barHeight, 'F');
      yPosition += 15;

      // Roadmap items
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Roadmap Items:', margin, yPosition);
      yPosition += 8;

      roadmap.slice(0, 15).forEach((item, index) => { // Limit to first 15 items
        checkPageBreak(8);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const status = item.completed ? '✓' : '○';
        const statusColor = item.completed ? [40, 167, 69] : [128, 128, 128];
        
        pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        pdf.text(status, margin, yPosition);
        
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${item.skillName}`, margin + 8, yPosition);
        pdf.text(`(${item.difficulty})`, margin + 100, yPosition);
        pdf.text(item.estimatedTime, margin + 130, yPosition);
        
        yPosition += 5;
      });

      if (roadmap.length > 15) {
        yPosition += 3;
        pdf.setFont('helvetica', 'italic');
        pdf.text(`... and ${roadmap.length - 15} more items`, margin, yPosition);
        yPosition += 8;
      }
    }

    // Progress Analytics Section
    if (analysisProgress) {
      checkPageBreak(30);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Progress Analytics', margin, yPosition);
      yPosition += 10;

      pdf.setDrawColor(59, 130, 246);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      const analytics = [
        ['Initial Readiness Score:', `${analysisProgress.initialScore}%`],
        ['Current Readiness Score:', `${analysisProgress.currentScore}%`],
        ['Score Improvement:', `+${analysisProgress.scoreImprovement}%`],
        ['Skills Improvement:', `+${analysisProgress.skillsImprovement} skills`],
        ['Completed Roadmap Items:', `${analysisProgress.completedRoadmapItems}`],
        ['Last Updated:', formatDate(analysisProgress.lastUpdated)]
      ];

      pdf.setFontSize(12);
      analytics.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 60, yPosition);
        yPosition += 6;
      });
    }

    // Footer
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated by SkillBridge - Page ${i} of ${totalPages}`, margin, pageHeight - 10);
      pdf.text(`Export Date: ${new Date().toLocaleString()}`, pageWidth - margin - 50, pageHeight - 10);
    }

    // Save the PDF
    const fileName = `skillbridge-profile-${profileData.name?.replace(/\s+/g, '-').toLowerCase() || 'user'}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    toast.success('Comprehensive PDF report generated successfully!', { duration: 4000 });
  };

  const handleExportJSON = async () => {
    try {
      // Export profile data as JSON
      const profileExport = {
        profile: profileData,
        stats: userStats,
        skills: userSkills,
        targetRole: selectedRole,
        analysis: analysis,
        roadmap: roadmap,
        analysisProgress: analysisProgress,
        exportDate: new Date().toISOString(),
        version: '3.0'
      };
      
      const blob = new Blob([JSON.stringify(profileExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skillbridge-data-${profileData.name?.replace(/\s+/g, '-').toLowerCase() || 'user'}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Profile data exported as JSON successfully!");
    } catch (error) {
      console.error('Error exporting JSON data:', error);
      toast.error('Failed to export JSON data');
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
                    <div className="flex items-center gap-2">
                      <p className="text-muted-foreground">{profileData.email}</p>
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                        <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                      </Badge>
                    </div>
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
                      name="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      disabled={true}
                      className="bg-muted/50 cursor-not-allowed"
                      autoComplete="email"
                    />
                    {/* <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email is managed by Google and cannot be changed here
                    </p> */}
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
                      name="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="e.g., Remote, New York, etc."
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience</Label>
                    <Select
                      value={profileData.experience}
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, experience: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger id="experience">
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
                      <SelectTrigger id="education">
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
                      <SelectTrigger id="weeklyGoal">
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
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleExportData}
                  disabled={exportingPDF}
                >
                  {exportingPDF ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  {exportingPDF ? 'Generating PDF...' : 'Export PDF Report'}
                </Button>
                {/* <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleExportJSON}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON Data
                </Button> */}
                {/* <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => toast.info("Import feature coming soon!")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button> */}
                {/* <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => toast.info("Theme customization coming soon!")}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Customize Theme
                </Button> */}
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