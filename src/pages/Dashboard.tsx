import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { Layout } from "@/components/Layout";
import { ProgressCircle } from "@/components/ProgressCircle";
import { StepIndicator } from "@/components/StepIndicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Certificate } from "@/components/Certificate";
import { LearningResources } from "@/components/LearningResources";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { NotificationCenter } from "@/components/NotificationCenter";
import { toast } from "sonner";
import { 
  Target, 
  BookOpen, 
  Briefcase, 
  TrendingUp, 
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Flame,
  Trophy,
  Calendar,
  Brain,
  Zap,
  TrendingDown,
  AlertTriangle,
  Info,
  Share2,
  Download,
  Bell,
  Settings,
  Users,
  Bookmark,
  PlayCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { cn, isRoadmapCompleted } from "@/lib/utils";
import { getLearningInsights } from "@/data/fixedRoadmaps";
import AnalyticsService from "@/services/analyticsService";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export const Dashboard = () => {
  const { 
    userSkills, 
    selectedRole, 
    analysis, 
    roadmap,
    roadmapProgress,
    loadFixedRoadmap
  } = useAppData();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [learningInsights, setLearningInsights] = useState<any>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showMentorDialog, setShowMentorDialog] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Handle insight actions
  const handleInsightAction = (action: string) => {
    switch (action) {
      case 'Set a daily learning goal':
        setShowGoalDialog(true);
        break;
      case 'Schedule regular learning sessions':
        toast.success("Calendar integration coming soon! For now, try setting reminders on your phone.");
        break;
      case 'Consider mentoring others':
        setShowMentorDialog(true);
        break;
      case 'Update resume and LinkedIn':
        handleUpdateResume();
        break;
      case 'Explore advanced topics':
        navigate('/roadmap');
        toast.info("Check out advanced skills in your roadmap!");
        break;
      case 'Review learning strategy':
        navigate('/analysis');
        toast.info("Review your skill gap analysis to optimize your learning strategy.");
        break;
      case 'Keep the streak alive':
        toast.success("Great job on your learning streak! Keep it up! 🔥");
        break;
      case 'Start a quick learning session':
        navigate('/roadmap');
        toast.info("Let's get back to learning! Pick a skill from your roadmap.");
        break;
      case 'Track your achievements':
        handleShowAchievements();
        break;
      case 'Increase practice time':
        navigate('/roadmap');
        toast.info("Focus on hands-on practice with your roadmap items.");
        break;
      default:
        toast.info("Feature coming soon!");
    }
  };

  // Handle sharing progress
  const handleShareProgress = () => {
    const streakCount = analytics?.currentStreak || 0;
    const shareText = `🚀 I'm ${roadmapProgressPercent}% through my ${selectedRole?.title || 'career'} learning journey! 
    
✅ ${completedItems} skills mastered
� $${analysis?.readinessScore || 0}% job-ready
🔥 ${streakCount} day learning streak ${streakCount > 7 ? '(Amazing consistency!)' : ''}

#SkillBridge #LearningJourney #CareerGrowth`;

    if (navigator.share) {
      navigator.share({
        title: 'My Learning Progress',
        text: shareText,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Progress shared to clipboard!");
    }
  };

  // Handle certificate download
  const handleDownloadCertificate = () => {
    if (!isRoadmapComplete) {
      toast.error("Complete your roadmap first to earn your certificate!");
      return;
    }
    setShowCertificateDialog(true);
  };

  // Handle resume update with comprehensive functionality
  const handleUpdateResume = () => {
    if (!selectedRole || !userSkills.length) {
      toast.error("Complete your profile and add skills first!");
      return;
    }

    // Generate comprehensive resume content
    const resumeContent = generateResumeContent();
    
    // Create and download resume template
    downloadResumeTemplate(resumeContent);
    
    // Open LinkedIn with pre-filled content
    openLinkedInProfile();
    
    toast.success("Resume template downloaded and LinkedIn opened!");
  };

  // Generate comprehensive resume content
  const generateResumeContent = () => {
    const skillsByCategory = userSkills.reduce((acc, skill) => {
      const category = skill.category || 'Technical Skills';
      if (!acc[category]) acc[category] = [];
      acc[category].push(`${skill.name} (${skill.proficiency})`);
      return acc;
    }, {} as Record<string, string[]>);

    const resumeData = {
      personalInfo: {
        name: user?.name || 'Your Name',
        email: user?.email || 'your.email@example.com',
        targetRole: selectedRole?.title || 'Software Developer',
        readinessScore: analysis?.readinessScore || 0
      },
      summary: `Motivated ${selectedRole?.title || 'professional'} with ${analysis?.readinessScore || 0}% job readiness. Successfully completed comprehensive skill development program with ${completedItems} technical competencies mastered. Passionate about continuous learning and applying cutting-edge technologies to solve complex problems.`,
      skills: skillsByCategory,
      achievements: [
        `Achieved ${analysis?.readinessScore || 0}% job readiness for ${selectedRole?.title || 'target role'}`,
        `Completed ${completedItems} technical skills in learning roadmap`,
        `Maintained ${analytics?.currentStreak || 0} day learning streak`,
        `Invested ${Math.round(analytics?.totalTimeSpent || 0)} hours in professional development`
      ],
      projects: [
        {
          name: `${selectedRole?.title || 'Professional'} Skill Development Portfolio`,
          description: `Comprehensive learning journey demonstrating mastery of ${userSkills.length} technical skills`,
          technologies: userSkills.slice(0, 8).map(s => s.name).join(', '),
          achievements: [
            `${roadmapProgressPercent}% completion rate`,
            `${analysis?.matchedSkills?.length || 0} skills at professional level`,
            'Real-world application of learned concepts'
          ]
        }
      ],
      certifications: isRoadmapComplete ? [
        {
          name: `${selectedRole?.title || 'Professional Development'} Certification`,
          issuer: 'SkillBridge Learning Platform',
          date: new Date().toLocaleDateString(),
          skills: userSkills.length
        }
      ] : []
    };

    return resumeData;
  };

  // Download resume template as formatted document
  const downloadResumeTemplate = (resumeData: any) => {
    const resumeHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resumeData.personalInfo.name} - Resume</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .name { font-size: 2.5em; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
        .contact { font-size: 1.1em; color: #6b7280; }
        .target-role { font-size: 1.3em; color: #059669; font-weight: 600; margin-top: 10px; }
        .readiness-badge { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 1.4em; font-weight: bold; color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; }
        .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .skill-category { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; }
        .skill-category h4 { margin: 0 0 10px 0; color: #1e40af; font-weight: 600; }
        .skill-list { list-style: none; padding: 0; margin: 0; }
        .skill-list li { padding: 3px 0; color: #4b5563; }
        .achievement { background: #ecfdf5; padding: 10px; margin: 8px 0; border-radius: 6px; border-left: 4px solid #10b981; }
        .project { background: #fefce8; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #eab308; }
        .project h4 { color: #a16207; margin: 0 0 10px 0; }
        .certification { background: #eff6ff; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .certification h4 { color: #1d4ed8; margin: 0 0 5px 0; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">${resumeData.personalInfo.name}</div>
        <div class="contact">${resumeData.personalInfo.email}</div>
        <div class="target-role">${resumeData.personalInfo.targetRole}</div>
        <div class="readiness-badge">${resumeData.personalInfo.readinessScore}% Job Ready</div>
    </div>

    <div class="section">
        <div class="section-title">Professional Summary</div>
        <p>${resumeData.summary}</p>
    </div>

    <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="skills-grid">
            ${Object.entries(resumeData.skills).map(([category, skills]) => `
                <div class="skill-category">
                    <h4>${category}</h4>
                    <ul class="skill-list">
                        ${(skills as string[]).map(skill => `<li>${skill}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Key Achievements</div>
        ${resumeData.achievements.map((achievement: string) => `
            <div class="achievement">✓ ${achievement}</div>
        `).join('')}
    </div>

    <div class="section">
        <div class="section-title">Projects & Portfolio</div>
        ${resumeData.projects.map((project: any) => `
            <div class="project">
                <h4>${project.name}</h4>
                <p>${project.description}</p>
                <p><strong>Technologies:</strong> ${project.technologies}</p>
                <ul>
                    ${project.achievements.map((ach: string) => `<li>${ach}</li>`).join('')}
                </ul>
            </div>
        `).join('')}
    </div>

    ${resumeData.certifications.length > 0 ? `
    <div class="section">
        <div class="section-title">Certifications</div>
        ${resumeData.certifications.map((cert: any) => `
            <div class="certification">
                <h4>${cert.name}</h4>
                <p><strong>Issuer:</strong> ${cert.issuer} | <strong>Date:</strong> ${cert.date}</p>
                <p><strong>Skills Validated:</strong> ${cert.skills} technical competencies</p>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="footer">
        <p>Generated by SkillBridge Learning Platform | ${new Date().toLocaleDateString()}</p>
        <p>This resume reflects verified skills and achievements from your learning journey</p>
    </div>
</body>
</html>`;

    const blob = new Blob([resumeHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Open LinkedIn with pre-filled profile content
  const openLinkedInProfile = () => {
    const linkedInContent = {
      headline: `${selectedRole?.title || 'Software Developer'} | ${analysis?.readinessScore || 0}% Job Ready | ${userSkills.length} Technical Skills`,
      summary: `🚀 Passionate ${selectedRole?.title || 'developer'} with ${analysis?.readinessScore || 0}% job readiness

🎯 Recently completed comprehensive skill development program:
• ${completedItems} technical skills mastered
• ${Math.round(analytics?.totalTimeSpent || 0)} hours invested in learning
• ${analytics?.currentStreak || 0} day learning streak maintained

💡 Core Competencies:
${userSkills.slice(0, 10).map(skill => `• ${skill.name} (${skill.proficiency})`).join('\n')}

🏆 Achievements:
• ${roadmapProgressPercent}% roadmap completion
• ${analysis?.matchedSkills?.length || 0} skills at professional level
• Continuous learner with growth mindset

Ready to contribute to innovative projects and drive technical excellence!

#${selectedRole?.title?.replace(/\s+/g, '') || 'SoftwareDeveloper'} #TechSkills #ContinuousLearning #JobReady`,
      skills: userSkills.slice(0, 50).map(skill => skill.name).join(', ')
    };

    // Copy LinkedIn content to clipboard
    const clipboardContent = `LinkedIn Profile Update Content:

HEADLINE:
${linkedInContent.headline}

SUMMARY:
${linkedInContent.summary}

SKILLS TO ADD:
${linkedInContent.skills}

---
Copy and paste these sections into your LinkedIn profile for maximum impact!`;

    navigator.clipboard.writeText(clipboardContent);
    
    // Open LinkedIn profile edit page
    window.open('https://www.linkedin.com/in/me/edit/', '_blank');
    
    // Show helpful dialog
    toast.success("LinkedIn content copied to clipboard! Profile edit page opened.", {
      duration: 5000
    });
  };

  // Handle achievements view
  const handleShowAchievements = () => {
    const achievements = [
      `🎯 ${userSkills.length} skills added`,
      `📚 ${completedItems} roadmap items completed`,
      `🔥 ${analytics?.currentStreak || 0} day learning streak`,
      `⏱️ ${Math.round(analytics?.totalTimeSpent || 0)} hours invested`,
      `📈 ${analysis?.readinessScore || 0}% job readiness`
    ];
    
    toast.success(`Your Achievements:\n${achievements.join('\n')}`, {
      duration: 5000
    });
  };

  // Handle notifications
  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Handle settings
  const handleSettings = () => {
    setShowAdvancedAnalytics(!showAdvancedAnalytics);
  };

  // Handle community features
  const handleCommunity = () => {
    toast.info("👥 Community features coming soon! Connect with other learners and share experiences.");
  };

  // Handle bookmarks
  const handleBookmarks = () => {
    toast.info("🔖 Bookmark feature coming soon! Save your favorite resources and track progress.");
  };

  // Handle quick learning session
  const handleQuickLearning = () => {
    if (roadmap.length === 0) {
      navigate('/roles');
      toast.info("Select a role first to start your learning journey!");
      return;
    }
    
    const nextIncompleteItem = roadmap.find(item => !item.completed);
    if (nextIncompleteItem) {
      navigate('/roadmap');
      toast.success(`Let's work on: ${nextIncompleteItem.skillName}!`);
    } else {
      toast.success("🎉 You've completed all roadmap items! Time to apply for jobs!");
    }
  };

  // Calculate enhanced analytics
  const analytics = useMemo(() => {
    if (roadmap.length === 0 || !selectedRole) return null;
    
    console.log('📊 Calculating analytics for role:', selectedRole.title, {
      roadmapLength: roadmap.length,
      completedItems: roadmap.filter(item => item.completed === true).length,
      hasRoadmapProgress: !!roadmapProgress
    });
    
    return AnalyticsService.calculateLearningAnalytics(
      roadmap,
      roadmapProgress,
      [] // Learning sessions would come from backend
    );
  }, [roadmap, roadmapProgress, selectedRole]);

  // Mock advanced analytics data - reset for new roles
  const advancedAnalyticsData = useMemo(() => {
    // If no analytics (new role or no roadmap), return default values
    if (!analytics || !selectedRole) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalTimeSpent: 0,
        learningVelocity: 0,
        completionLikelihood: 50,
        estimatedWeeksRemaining: 12,
        skillsPerWeek: 0,
        consistencyScore: 0,
        focusAreas: [selectedRole?.title || 'No Role Selected'],
        weeklyProgress: [],
        skillDistribution: [],
        learningPattern: []
      };
    }

    return {
      currentStreak: analytics?.currentStreak || 0,
      longestStreak: analytics?.longestStreak || 0,
      totalTimeSpent: analytics?.totalTimeSpent || 0,
      learningVelocity: analytics?.learningVelocity || 0,
      completionLikelihood: analytics?.completionLikelihood || 50,
      estimatedWeeksRemaining: analytics?.estimatedWeeksRemaining || 12,
      skillsPerWeek: analytics?.learningVelocity || 0,
      consistencyScore: Math.round((analytics?.currentStreak || 0) * 10),
      focusAreas: [
        selectedRole?.title || 'Current Role',
        'Core Skills',
        'Practical Projects',
        'Industry Standards'
      ],
      weeklyProgress: [
        { week: 'Week 1', skillsCompleted: 0, timeSpent: 0, consistency: 0 },
        { week: 'Week 2', skillsCompleted: 0, timeSpent: 0, consistency: 0 },
        { week: 'Week 3', skillsCompleted: 0, timeSpent: 0, consistency: 0 },
        { week: 'Week 4', skillsCompleted: 0, timeSpent: 0, consistency: 0 },
        { week: 'Week 5', skillsCompleted: 0, timeSpent: 0, consistency: 0 },
        { week: 'Week 6', skillsCompleted: 0, timeSpent: 0, consistency: 0 }
      ],
      skillDistribution: [
        { category: 'Frontend', completed: 0, remaining: roadmap.filter(item => item.skillName.toLowerCase().includes('frontend') || item.skillName.toLowerCase().includes('react') || item.skillName.toLowerCase().includes('html') || item.skillName.toLowerCase().includes('css') || item.skillName.toLowerCase().includes('javascript')).length },
        { category: 'Backend', completed: 0, remaining: roadmap.filter(item => item.skillName.toLowerCase().includes('backend') || item.skillName.toLowerCase().includes('node') || item.skillName.toLowerCase().includes('api') || item.skillName.toLowerCase().includes('server')).length },
        { category: 'Database', completed: 0, remaining: roadmap.filter(item => item.skillName.toLowerCase().includes('database') || item.skillName.toLowerCase().includes('sql') || item.skillName.toLowerCase().includes('mongo')).length },
        { category: 'DevOps', completed: 0, remaining: roadmap.filter(item => item.skillName.toLowerCase().includes('devops') || item.skillName.toLowerCase().includes('docker') || item.skillName.toLowerCase().includes('aws') || item.skillName.toLowerCase().includes('deploy')).length }
      ],
      learningPattern: [
        { day: 'Mon', morning: 0, afternoon: 0, evening: 0 },
        { day: 'Tue', morning: 0, afternoon: 0, evening: 0 },
        { day: 'Wed', morning: 0, afternoon: 0, evening: 0 },
        { day: 'Thu', morning: 0, afternoon: 0, evening: 0 },
        { day: 'Fri', morning: 0, afternoon: 0, evening: 0 },
        { day: 'Sat', morning: 0, afternoon: 0, evening: 0 },
        { day: 'Sun', morning: 0, afternoon: 0, evening: 0 }
      ]
    };
  }, [analytics, selectedRole, roadmap]);

  // Get learning insights for the selected role
  useEffect(() => {
    if (selectedRole && roadmapProgress) {
      const insights = getLearningInsights(selectedRole.id, roadmapProgress);
      setLearningInsights(insights);
    }
  }, [selectedRole, roadmapProgress]);

  // Auto-load roadmap when role changes
  useEffect(() => {
    if (selectedRole && roadmap.length === 0) {
      console.log('🔄 Dashboard: Auto-loading roadmap for new role:', selectedRole.title);
      loadFixedRoadmap();
    }
  }, [selectedRole, roadmap.length, loadFixedRoadmap]);

  // Track role changes for debugging
  useEffect(() => {
    console.log('🎯 Dashboard: Role change detected:', {
      selectedRole: selectedRole?.title || 'None',
      roadmapLength: roadmap.length,
      hasRoadmapProgress: !!roadmapProgress,
      hasAnalytics: !!analytics
    });
  }, [selectedRole, roadmap.length, roadmapProgress, analytics]);

  // Track analytics changes
  useEffect(() => {
    if (analytics) {
      console.log('📊 Dashboard: Analytics updated:', {
        role: selectedRole?.title,
        progressPercent: analytics.progressPercent,
        learningVelocity: analytics.learningVelocity,
        currentStreak: analytics.currentStreak,
        completionLikelihood: analytics.completionLikelihood
      });
    } else {
      console.log('📊 Dashboard: Analytics cleared (no roadmap or role)');
    }
  }, [analytics, selectedRole]);

  const completedItems = roadmap.filter((item) => item.completed === true).length;
  const roadmapProgressPercent = roadmap.length > 0 ? Math.round((completedItems / roadmap.length) * 100) : 0;
  
  // Debug logging for roadmap progress calculation
  useEffect(() => {
    if (roadmap.length > 0) {
      console.log('🔍 Dashboard Progress Debug:', {
        totalItems: roadmap.length,
        completedItems,
        roadmapProgressPercent,
        roadmapItems: roadmap.map(item => ({
          id: item.id,
          skillName: item.skillName,
          completed: item.completed
        }))
      });
    }
  }, [roadmap, completedItems, roadmapProgressPercent]);
  
  // Check roadmap completion status
  const isRoadmapComplete = isRoadmapCompleted(roadmap);

  const skillsByProficiency = userSkills.reduce((acc, skill) => {
    acc[skill.proficiency] = (acc[skill.proficiency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: "Advanced", value: skillsByProficiency.advanced || 0, fill: "hsl(160, 84%, 39%)" },
    { name: "Intermediate", value: skillsByProficiency.intermediate || 0, fill: "hsl(200, 98%, 48%)" },
    { name: "Beginner", value: skillsByProficiency.beginner || 0, fill: "hsl(38, 92%, 50%)" },
  ].filter(d => d.value > 0);

  const skillsByCategory = userSkills.reduce((acc, skill) => {
    acc[skill.category] = (acc[skill.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(skillsByCategory)
    .map(([name, count]) => ({ name: name.split(" ")[0], count }))
    .slice(0, 5);

  const barColors = ["hsl(220, 90%, 56%)", "hsl(160, 84%, 39%)", "hsl(38, 92%, 50%)", "hsl(200, 98%, 48%)", "hsl(280, 70%, 50%)"];

  const getInitials = (name: string) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  };

  // Calculate current step
  const getCurrentStep = (): 1 | 2 | 3 | 4 => {
    if (roadmap.length > 0) return 4;
    if (analysis) return 3;
    if (selectedRole) return 2;
    return 1;
  };

  const journeySteps = [
    { 
      step: 1, 
      title: "Add Skills", 
      description: "Add your current skills", 
      icon: Target, 
      path: "/skills",
      completed: userSkills.length > 0,
      count: userSkills.length,
      label: "skills added"
    },
    { 
      step: 2, 
      title: "Choose Role", 
      description: "Select target job role", 
      icon: Briefcase, 
      path: "/roles",
      completed: !!selectedRole,
      count: selectedRole ? 1 : 0,
      label: selectedRole?.title || "role selected"
    },
    { 
      step: 3, 
      title: "Analyze Gaps", 
      description: "View skill gap analysis", 
      icon: TrendingUp, 
      path: "/analysis",
      completed: !!analysis,
      count: analysis?.readinessScore || 0,
      label: "% readiness"
    },
    { 
      step: 4, 
      title: "Learn & Grow", 
      description: "Follow your roadmap", 
      icon: BookOpen, 
      path: "/roadmap",
      completed: isRoadmapComplete,
      count: roadmapProgressPercent,
      label: "% complete"
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Avatar className="h-16 w-16 border-4 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {getInitials(user?.name || "User")}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <p className="text-muted-foreground">{getGreeting()},</p>
              <h1 className="text-3xl font-bold">{user?.name || "User"}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* <div className="flex items-center gap-2">
              <Button 
                variant={showNotifications ? "default" : "ghost"} 
                size="sm" 
                onClick={handleNotifications}
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button 
                variant={showAdvancedAnalytics ? "default" : "ghost"} 
                size="sm" 
                onClick={handleSettings}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div> */}
            {/* <Badge variant="secondary" className="gap-1 px-3 py-1.5">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-semibold">{analytics?.currentStreak || 0}</span>
              <span className="text-xs">day streak</span>
            </Badge> */}
            <Badge 
              variant="secondary" 
              className={cn(
                "gap-1 px-3 py-1.5",
                isRoadmapComplete && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              )}
            >
              <Trophy className={cn(
                "h-4 w-4",
                isRoadmapComplete ? "text-green-600" : "text-warning"
              )} />
              <span>{completedItems} completed</span>
            </Badge>
          </div>
        </div>

        {/* Journey Progress */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Your Journey Progress
                </CardTitle>
                <CardDescription>
                  Complete each step to reach your career goals
                </CardDescription>
              </div>
              <div className="hidden sm:block">
                <StepIndicator currentStep={getCurrentStep()} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {journeySteps.map((step) => {
                const Icon = step.icon;
                
                return (
                  <Link
                    key={step.step}
                    to={step.path}
                    className="p-6 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center",
                        step.completed 
                          ? step.step === 4 
                            ? "bg-green-100 dark:bg-green-900" // Special green background for completed roadmap
                            : "bg-accent/10"
                          : "bg-muted"
                      )}>
                        {step.completed ? (
                          <CheckCircle2 className={cn(
                            "h-5 w-5",
                            step.step === 4 
                              ? "text-green-600 dark:text-green-400" // Special green color for completed roadmap
                              : "text-accent"
                          )} />
                        ) : (
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-primary">{step.count}</span>
                      <span className="text-sm text-muted-foreground">{step.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Streak Milestone Celebration */}
        {(analytics?.currentStreak || 0) >= 7 && (
          <Alert className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <Flame className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <strong>🔥 Streak Milestone!</strong> You've maintained a {analytics?.currentStreak} day learning streak! 
                  {(analytics?.currentStreak || 0) >= 30 && " You're a learning champion! 🏆"}
                  {(analytics?.currentStreak || 0) >= 14 && (analytics?.currentStreak || 0) < 30 && " You're building amazing habits! 💪"}
                  {(analytics?.currentStreak || 0) >= 7 && (analytics?.currentStreak || 0) < 14 && " Keep the momentum going! 🚀"}
                </div>
                <div className="flex items-center gap-2 text-2xl">
                  <span className="font-bold text-orange-600">{analytics?.currentStreak}</span>
                  <Flame className="h-6 w-6 text-orange-500 animate-pulse" />
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Roadmap Completion Celebration */}
        {isRoadmapComplete && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
            <Trophy className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              🎉 <strong>Congratulations!</strong> You've completed your entire learning roadmap for {selectedRole?.title || 'your target role'}! 
              You're now ready to apply for positions in this role. Your dedication and hard work have paid off!
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleDownloadCertificate} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Get Certificate
                </Button>
                <Button size="sm" variant="outline" onClick={handleShareProgress}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Achievement
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Boost your learning with these helpful actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={handleQuickLearning}
              >
                <PlayCircle className="h-6 w-6 text-primary" />
                <div className="text-center">
                  <div className="font-medium">Quick Learn</div>
                  <div className="text-xs text-muted-foreground">15 min session</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={handleShareProgress}
              >
                <Share2 className="h-6 w-6 text-blue-600" />
                <div className="text-center">
                  <div className="font-medium">Share Progress</div>
                  <div className="text-xs text-muted-foreground">Social media</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={handleBookmarks}
              >
                <Bookmark className="h-6 w-6 text-yellow-600" />
                <div className="text-center">
                  <div className="font-medium">Bookmarks</div>
                  <div className="text-xs text-muted-foreground">Saved resources</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={handleCommunity}
              >
                <Users className="h-6 w-6 text-green-600" />
                <div className="text-center">
                  <div className="font-medium">Community</div>
                  <div className="text-xs text-muted-foreground">Connect & learn</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Analytics Cards */}
        <div key={`analytics-${selectedRole?.id || 'no-role'}`} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Skills</p>
                  <p className="text-3xl font-bold">{userSkills.length}</p>
                  {analytics && (
                    <p className="text-xs text-muted-foreground mt-1">
                      +{Math.round(analytics.learningVelocity * 4)} this month
                    </p>
                  )}
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Readiness Score</p>
                  <p className="text-3xl font-bold">{analysis?.readinessScore || 0}%</p>
                  {learningInsights && (
                    <p className="text-xs text-green-600 mt-1">
                      {learningInsights.isOnTrack ? "On track" : "Behind schedule"}
                    </p>
                  )}
                </div>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Roadmap Progress</p>
                  <p className="text-3xl font-bold">{roadmapProgressPercent}%</p>
                  {analytics && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(analytics.estimatedWeeksRemaining)}w remaining
                    </p>
                  )}
                </div>
                <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Learning Streak</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-orange-600">{analytics?.currentStreak || 0}</p>
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best: {analytics?.longestStreak || 0} days
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
              </div>
              {(analytics?.currentStreak || 0) > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-orange-100 dark:bg-orange-900/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, ((analytics?.currentStreak || 0) / Math.max(analytics?.longestStreak || 7, 7)) * 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-orange-600 font-medium">
                    {analytics?.currentStreak === analytics?.longestStreak ? '🔥 Record!' : 'Keep going!'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Learning Insights */}
        {analytics && analytics.insights.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Learning Insights
            </h2>
            <div className="grid gap-4">
              {analytics.insights.slice(0, 3).map((insight, index) => (
                <Alert 
                  key={index} 
                  className={`${
                    insight.type === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' :
                    insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20' :
                    insight.type === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' :
                    'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
                  }`}
                >
                  {insight.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                  {insight.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  {insight.type === 'info' && <Info className="h-4 w-4 text-blue-600" />}
                  <AlertDescription className={`${
                    insight.type === 'success' ? 'text-green-800 dark:text-green-200' :
                    insight.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                    insight.type === 'error' ? 'text-red-800 dark:text-red-200' :
                    'text-blue-800 dark:text-blue-200'
                  }`}>
                    <strong>{insight.title}:</strong> {insight.message}
                    {insight.action && (
                      <div className="mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => handleInsightAction(insight.action)}
                        >
                          {insight.action}
                        </Button>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Learning Analytics Chart */}
        {analytics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Learning Analytics
              </CardTitle>
              <CardDescription>
                Your learning progress and predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completion Likelihood</span>
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(analytics.completionLikelihood)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${analytics.completionLikelihood}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on your current pace and consistency
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Learning Velocity</span>
                    <span className="text-2xl font-bold text-accent">
                      {analytics.learningVelocity.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Skills per week • Target: {analytics.recommendedPace.toFixed(1)}
                  </p>
                  <div className="flex items-center gap-2">
                    {analytics.isOnTrack ? (
                      <Badge variant="secondary" className="text-green-600 bg-green-100">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        On Track
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-yellow-600 bg-yellow-100">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Behind
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Est. Completion</span>
                    <span className="text-sm font-bold">
                      {analytics.estimatedCompletionDate.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(analytics.estimatedWeeksRemaining)} weeks remaining
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {analytics.weeksElapsed} weeks elapsed
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Readiness Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Role Readiness</CardTitle>
              <CardDescription>
                {selectedRole ? selectedRole.title : "Select a target role"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {analysis ? (
                <>
                  <ProgressCircle value={analysis.readinessScore} size="lg" />
                  <div className="mt-6 w-full space-y-3">
                    <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-progress-high/10">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-progress-high" />
                        <span>Matched Skills</span>
                      </div>
                      <span className="font-semibold">{analysis.matchedSkills.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-progress-medium/10">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-progress-medium" />
                        <span>Need Improvement</span>
                      </div>
                      <span className="font-semibold">{analysis.partialSkills.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-progress-low/10">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-progress-low" />
                        <span>Missing Skills</span>
                      </div>
                      <span className="font-semibold">{analysis.missingSkills.length}</span>
                    </div>
                  </div>
                  
                  {/* Real-time Update Indicator */}
                  {completedItems > 0 && (
                    <div className="mt-4 w-full p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">Live Updates Active</span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Score updates as you complete roadmap items
                      </p>
                    </div>
                  )}
                  
                  <Link to="/analysis" className="mt-6 w-full">
                    <Button variant="outline" className="w-full">
                      View Full Analysis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Complete your skill analysis to see your readiness score
                  </p>
                  <Link to="/roles">
                    <Button>
                      Select Target Role
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Distribution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Skills Overview</CardTitle>
                  <CardDescription>Your skills by category and proficiency</CardDescription>
                </div>
                <Link to="/skills">
                  <Button variant="outline" size="sm">
                    Manage Skills
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-4">By Category</h4>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                          <XAxis type="number" hide />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            width={80}
                            tick={{ fontSize: 12 }}
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {chartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-4">By Proficiency</h4>
                    <div className="h-[200px] flex items-center justify-center">
                      {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-muted-foreground">No data</p>
                      )}
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                      {pieData.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-2 text-xs">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                          <span>{entry.name}: {entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No skills added yet</p>
                    <Link to="/skills" className="mt-2 inline-block">
                      <Button variant="link" className="p-0">Add your first skill</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Roadmap Progress */}
        {roadmap.length > 0 && (
          <Card className={cn(
            isRoadmapComplete && "border-green-200 bg-green-50/50 dark:bg-green-950/20"
          )}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Learning Roadmap
                  {isRoadmapComplete && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <Trophy className="h-3 w-3 mr-1" />
                      Completed!
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Your personalized path to {selectedRole?.title}</CardDescription>
              </div>
              <Link to="/roadmap">
                <Button variant="outline" size="sm">
                  View Full Roadmap
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>{completedItems} of {roadmap.length} skills completed</span>
                  <span className={cn(
                    "font-medium",
                    isRoadmapComplete ? "text-green-600" : "text-primary"
                  )}>{roadmapProgressPercent}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 ease-out rounded-full",
                      isRoadmapComplete
                        ? "bg-gradient-to-r from-green-500 to-green-600" 
                        : "bg-gradient-to-r from-primary to-accent"
                    )}
                    style={{ width: `${roadmapProgressPercent}%` }}
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4 pt-4">
                  {roadmap.slice(0, 3).map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-4 rounded-xl border transition-all",
                        item.completed 
                          ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" 
                          : "bg-card hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center",
                          item.completed 
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                            : "bg-primary/10 text-primary"
                        )}>
                          {item.completed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-sm font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-medium text-sm truncate",
                            item.completed && "line-through opacity-75"
                          )}>
                            {item.skillName}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {item.estimatedTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Resources */}
        {selectedRole && (
          <LearningResources
            key={`learning-resources-${selectedRole.id}`}
            skillName={selectedRole.title}
            showFilters={false}
            className="max-w-none"
          />
        )}

        {/* Advanced Analytics */}
        {showAdvancedAnalytics && analytics && (
          <AdvancedAnalytics 
            key={`advanced-analytics-${selectedRole?.id || 'no-role'}`}
            data={advancedAnalyticsData}
            className="max-w-none"
          />
        )}

        {/* Notification Center */}
        {showNotifications && (
          <NotificationCenter className="max-w-none" />
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Progress</DialogTitle>
            <DialogDescription>
              Share your learning journey with others to inspire and motivate!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                🚀 I'm {roadmapProgressPercent}% through my {selectedRole?.title || 'career'} learning journey!
                <br />✅ {completedItems} skills mastered
                <br />📈 {analysis?.readinessScore || 0}% job-ready
                <br />🔥 <span className="font-semibold text-orange-600">{analytics?.currentStreak || 0} day</span> learning streak
                {(analytics?.currentStreak || 0) > 7 && <span className="text-green-600"> (Amazing consistency!)</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleShareProgress} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share Now
              </Button>
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🏆 Congratulations!</DialogTitle>
            <DialogDescription>
              You've completed your {selectedRole?.title || 'learning'} roadmap!
            </DialogDescription>
          </DialogHeader>
          <Certificate
            userName={user?.name || 'Learner'}
            userEmail={user?.email}
            roleName={selectedRole?.title || 'Career Development'}
            completionDate={new Date()}
            skillsCompleted={completedItems}
            totalHours={Math.round(analytics?.totalTimeSpent || 0)}
            readinessScore={analysis?.readinessScore || 100}
            onDownload={() => {
              toast.success('Certificate downloaded successfully!');
              setShowCertificateDialog(false);
            }}
            onShare={() => {
              toast.success('Achievement shared successfully!');
              setShowCertificateDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Daily Learning Goal</DialogTitle>
            <DialogDescription>
              Consistency is key to mastering new skills. Set a realistic daily goal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => {
                toast.success("Great! 15 minutes daily is a perfect start!");
                setShowGoalDialog(false);
              }}>
                15 min
              </Button>
              <Button variant="outline" onClick={() => {
                toast.success("Excellent! 30 minutes daily will accelerate your progress!");
                setShowGoalDialog(false);
              }}>
                30 min
              </Button>
              <Button variant="outline" onClick={() => {
                toast.success("Amazing commitment! 1 hour daily will make you a fast learner!");
                setShowGoalDialog(false);
              }}>
                1 hour
              </Button>
            </div>
            <Button variant="ghost" onClick={() => setShowGoalDialog(false)} className="w-full">
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMentorDialog} onOpenChange={setShowMentorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Become a Mentor</DialogTitle>
            <DialogDescription>
              Share your knowledge and help others on their learning journey!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Why mentor others?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Reinforce your own learning</li>
                <li>• Build leadership skills</li>
                <li>• Expand your professional network</li>
                <li>• Give back to the community</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => {
                toast.success("Mentoring features coming soon! We'll notify you when available.");
                setShowMentorDialog(false);
              }} className="flex-1">
                <Users className="h-4 w-4 mr-2" />
                Join Mentor Program
              </Button>
              <Button variant="outline" onClick={() => setShowMentorDialog(false)}>
                Not Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};