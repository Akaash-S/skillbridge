import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/services/apiClient";
import { 
  Palette, 
  Bell, 
  Shield, 
  User,
  Sun,
  Moon,
  Monitor,
  Download,
  RotateCcw,
  LogOut,
  Loader2,
  Save,
  RefreshCw,
  Settings as SettingsIcon,
  Globe,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  Upload
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
import { MFAManagement } from "@/components/MFAManagement";

// Types based on backend API
interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  learningPace: 'slow' | 'balanced' | 'fast';
  notifications: boolean;
  jobCountries: string[];
  emailNotifications: {
    roadmapUpdates: boolean;
    jobRecommendations: boolean;
    learningReminders: boolean;
    weeklyProgress: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    skillsVisibility: 'public' | 'private';
    progressVisibility: 'public' | 'private';
  };
  preferences: {
    language: string;
    timezone: string;
    weeklyGoal: number;
    difficultyPreference: 'easy' | 'adaptive' | 'challenging';
  };
}

const countries = [
  { code: 'in', name: '🇮🇳 India' },
  { code: 'us', name: '🇺🇸 United States' },
  { code: 'gb', name: '🇬🇧 United Kingdom' },
  { code: 'ca', name: '🇨🇦 Canada' },
  { code: 'au', name: '🇦🇺 Australia' },
  { code: 'de', name: '🇩🇪 Germany' },
];

const languages = [
  { code: 'en', name: '🇺🇸 English' },
  { code: 'es', name: '🇪🇸 Spanish' },
  { code: 'fr', name: '🇫🇷 French' },
  { code: 'de', name: '🇩🇪 German' },
  { code: 'hi', name: '🇮🇳 Hindi' },
  { code: 'zh', name: '🇨🇳 Chinese' },
  { code: 'ja', name: '🇯🇵 Japanese' },
  { code: 'pt', name: '🇧🇷 Portuguese' },
];

const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
];

export const Settings = () => {
  const { toast } = useToast();
  const { isAuthenticated, signOut } = useAuth();
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load user settings from backend
  const loadSettings = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get<{ settings: any }>('/settings');
      setSettings(response.settings);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, toast]);

  // Save settings to backend
  const saveSettings = useCallback(async () => {
    if (!settings || !isAuthenticated) return;
    
    setSaving(true);
    try {
      await apiClient.put('/settings', settings);
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
      
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [settings, isAuthenticated, toast]);

  // Reset settings to defaults
  const resetSettings = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setResetting(true);
    try {
      const response = await apiClient.post<{ settings: any }>('/settings/reset');
      setSettings(response.settings);
      setHasUnsavedChanges(false);
      
      toast({
        title: "Settings reset",
        description: "All settings have been reset to defaults.",
      });
      
    } catch (error) {
      console.error('❌ Failed to reset settings:', error);
      toast({
        title: "Error",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  }, [isAuthenticated, toast]);

  // Update setting helper
  const updateSetting = useCallback((path: string, value: any) => {
    if (!settings) return;
    
    const keys = path.split('.');
    const newSettings = { ...settings };
    let current: any = newSettings;
    
    // Navigate to the nested property
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    // Set the value
    current[keys[keys.length - 1]] = value;
    
    setSettings(newSettings);
    setHasUnsavedChanges(true);
  }, [settings]);

  // Toggle job country
  const toggleJobCountry = useCallback((countryCode: string) => {
    if (!settings) return;
    
    const currentCountries = settings.jobCountries || [];
    const newCountries = currentCountries.includes(countryCode)
      ? currentCountries.filter(c => c !== countryCode)
      : [...currentCountries, countryCode];
    
    updateSetting('jobCountries', newCountries);
  }, [settings, updateSetting]);

  // Export settings
  const handleExportSettings = useCallback(async () => {
    try {
      const response = await apiClient.get('/settings/export');
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skillbridge-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Settings exported",
        description: "Your settings have been downloaded as a JSON file.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export your settings. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Import settings
  const handleImportSettings = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      
      // Validate imported settings structure
      if (importedData.settings) {
        setSettings(importedData.settings);
        setHasUnsavedChanges(true);
        
        toast({
          title: "Settings imported",
          description: "Settings have been imported successfully. Click Save to apply them.",
        });
      } else {
        throw new Error('Invalid settings file format');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: "Failed to import settings. Please check the file format.",
        variant: "destructive",
      });
    }
    
    // Reset file input
    event.target.value = '';
  }, [toast]);

  // Load settings on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated, loadSettings]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            if (hasUnsavedChanges) {
              saveSettings();
            }
            break;
          case 'r':
            event.preventDefault();
            loadSettings();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, saveSettings, loadSettings]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Loading Settings</h3>
            <p className="text-muted-foreground">Fetching your preferences...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <SettingsIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">Please log in to access your settings.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
              <p className="text-muted-foreground">Customize your SkillBridge experience</p>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Learning
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how the application looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Mode */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Theme Mode</Label>
                  <RadioGroup 
                    value={settings?.theme || 'system'} 
                    onValueChange={(value) => updateSetting('theme', value)} 
                    className="flex gap-4"
                  >
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
              </CardContent>
            </Card>

            {/* Language & Region */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Language & Region
                </CardTitle>
                <CardDescription>
                  Set your language and regional preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Language</Label>
                    <Select 
                      value={settings?.preferences?.language || 'en'} 
                      onValueChange={(value) => updateSetting('preferences.language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Timezone</Label>
                    <Select 
                      value={settings?.preferences?.timezone || 'UTC'} 
                      onValueChange={(value) => updateSetting('preferences.timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Settings Tab */}
          <TabsContent value="learning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Learning Preferences
                </CardTitle>
                <CardDescription>
                  Customize how you learn and track progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Learning Pace */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Learning Pace</Label>
                  <p className="text-xs text-muted-foreground">Affects roadmap timelines and recommendations</p>
                  <RadioGroup 
                    value={settings?.learningPace || 'balanced'} 
                    onValueChange={(value) => updateSetting('learningPace', value)} 
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="slow" id="slow" />
                      <Label htmlFor="slow" className="cursor-pointer">Relaxed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="balanced" id="balanced" />
                      <Label htmlFor="balanced" className="cursor-pointer">Balanced</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fast" id="fast" />
                      <Label htmlFor="fast" className="cursor-pointer">Fast-paced</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Weekly Goal */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-sm font-medium">Weekly Learning Goal</Label>
                    <span className="text-sm font-medium text-primary">{settings?.preferences?.weeklyGoal || 10} hours</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Target hours per week for skill development</p>
                  <Slider
                    value={[settings?.preferences?.weeklyGoal || 10]}
                    onValueChange={(value) => updateSetting('preferences.weeklyGoal', value[0])}
                    min={2}
                    max={40}
                    step={2}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>2 hours</span>
                    <span>40 hours</span>
                  </div>
                </div>

                <Separator />

                {/* Difficulty Preference */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Skill Difficulty Preference</Label>
                  <p className="text-xs text-muted-foreground">How challenging should new skills be?</p>
                  <RadioGroup 
                    value={settings?.preferences?.difficultyPreference || 'adaptive'} 
                    onValueChange={(value) => updateSetting('preferences.difficultyPreference', value)} 
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easy" id="easy" />
                      <Label htmlFor="easy" className="cursor-pointer">Start Easy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="adaptive" id="adaptive" />
                      <Label htmlFor="adaptive" className="cursor-pointer">Adaptive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="challenging" id="challenging" />
                      <Label htmlFor="challenging" className="cursor-pointer">Challenging</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Career Focus */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Career Focus & Goals
                </CardTitle>
                <CardDescription>
                  Set your career objectives and job search preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Job Countries */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Job Search Countries</Label>
                  <p className="text-xs text-muted-foreground">Countries to search for job opportunities</p>
                  <div className="grid grid-cols-2 gap-3">
                    {countries.map((country) => (
                      <div key={country.code} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={country.code}
                          checked={settings?.jobCountries?.includes(country.code) || false}
                          onChange={() => toggleJobCountry(country.code)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={country.code} className="cursor-pointer text-sm">
                          {country.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Control when and how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Master Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Enable Notifications</Label>
                    <p className="text-xs text-muted-foreground">Master toggle for all notifications</p>
                  </div>
                  <Switch
                    checked={settings?.notifications || false}
                    onCheckedChange={(checked) => updateSetting('notifications', checked)}
                  />
                </div>

                <Separator />

                {/* Email Notifications */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Roadmap Updates</Label>
                        <p className="text-xs text-muted-foreground">When your roadmap progress changes</p>
                      </div>
                      <Switch
                        checked={settings?.emailNotifications?.roadmapUpdates || false}
                        onCheckedChange={(checked) => updateSetting('emailNotifications.roadmapUpdates', checked)}
                        disabled={!settings?.notifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Job Recommendations</Label>
                        <p className="text-xs text-muted-foreground">New job opportunities matching your skills</p>
                      </div>
                      <Switch
                        checked={settings?.emailNotifications?.jobRecommendations || false}
                        onCheckedChange={(checked) => updateSetting('emailNotifications.jobRecommendations', checked)}
                        disabled={!settings?.notifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Learning Reminders</Label>
                        <p className="text-xs text-muted-foreground">Daily and weekly learning reminders</p>
                      </div>
                      <Switch
                        checked={settings?.emailNotifications?.learningReminders || false}
                        onCheckedChange={(checked) => updateSetting('emailNotifications.learningReminders', checked)}
                        disabled={!settings?.notifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Weekly Progress</Label>
                        <p className="text-xs text-muted-foreground">Weekly progress summaries</p>
                      </div>
                      <Switch
                        checked={settings?.emailNotifications?.weeklyProgress || false}
                        onCheckedChange={(checked) => updateSetting('emailNotifications.weeklyProgress', checked)}
                        disabled={!settings?.notifications}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Data Control
                </CardTitle>
                <CardDescription>
                  Manage your data and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Visibility */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Profile Visibility</Label>
                  <p className="text-xs text-muted-foreground">Control who can see your profile information</p>
                  <RadioGroup 
                    value={settings?.privacy?.profileVisibility || 'private'} 
                    onValueChange={(value) => updateSetting('privacy.profileVisibility', value)} 
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="profile-private" />
                      <Label htmlFor="profile-private" className="cursor-pointer">Private</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="profile-public" />
                      <Label htmlFor="profile-public" className="cursor-pointer">Public</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Skills Visibility */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Skills Visibility</Label>
                  <p className="text-xs text-muted-foreground">Control who can see your skills and progress</p>
                  <RadioGroup 
                    value={settings?.privacy?.skillsVisibility || 'private'} 
                    onValueChange={(value) => updateSetting('privacy.skillsVisibility', value)} 
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="skills-private" />
                      <Label htmlFor="skills-private" className="cursor-pointer">Private</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="skills-public" />
                      <Label htmlFor="skills-public" className="cursor-pointer">Public</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Progress Visibility */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Progress Visibility</Label>
                  <p className="text-xs text-muted-foreground">Control who can see your learning progress</p>
                  <RadioGroup 
                    value={settings?.privacy?.progressVisibility || 'private'} 
                    onValueChange={(value) => updateSetting('privacy.progressVisibility', value)} 
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="progress-private" />
                      <Label htmlFor="progress-private" className="cursor-pointer">Private</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="progress-public" />
                      <Label htmlFor="progress-public" className="cursor-pointer">Public</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* MFA Security Card */}
            <MFAManagement />
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Export, import, and manage your account data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Data Actions</Label>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={handleExportSettings}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Settings
                    </Button>
                    
                    <div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportSettings}
                        className="hidden"
                        id="import-settings"
                        name="import-settings"
                      />
                      <Button variant="outline" asChild>
                        <label htmlFor="import-settings" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Import Settings
                        </label>
                      </Button>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={resetting}>
                          {resetting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4 mr-2" />
                          )}
                          Reset Settings
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset all settings?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will reset all your preferences to default values. Your learning progress and skills will not be affected. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={resetSettings} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Reset Settings
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <Separator />

                {/* Account Actions */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Account Actions</Label>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => signOut()}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between items-center">
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadSettings} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
          <Button onClick={saveSettings} size="lg" className="px-8" disabled={saving || !settings || !hasUnsavedChanges}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Keyboard Shortcuts</p>
              <ul className="space-y-1 text-xs">
                <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+S</kbd> - Save settings</li>
                <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+R</kbd> - Refresh settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};