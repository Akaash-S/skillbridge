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
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
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
  Upload,
  Database,
  Trash2,
  Briefcase,
  Clock,
  BarChart3,
  Lock,
  Eye
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
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, signOut, user } = useAuth();

  const getInitials = (name: string) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  };

  const handleClearCache = () => {
    apiClient.clearCache();
    toast({
      title: "Cache cleared",
      description: "Local data cache has been successfully cleared.",
    });
  };

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
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
      if (response.settings.theme) {
        setTheme(response.settings.theme);
      }
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
    setMounted(true);
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated, loadSettings]);

  // Sync next-themes when settings.theme changes
  useEffect(() => {
    if (mounted && settings?.theme) {
      setTheme(settings.theme);
    }
  }, [mounted, settings?.theme, setTheme]);

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
          <div className="overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex w-full md:grid md:grid-cols-5 min-w-max md:min-w-0">
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
          </div>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            {/* Profile Overview Card */}
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile Details
                </CardTitle>
                <CardDescription>
                  Your public profile details synced from Google authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {getInitials(user?.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
                  <h3 className="font-semibold text-lg text-foreground">{user?.name || "User"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                    <Badge variant="secondary" className="text-xs">Google Authenticated</Badge>
                    <Badge variant="outline" className="text-xs">Active Account</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    onValueChange={(value) => {
                      updateSetting('theme', value as any);
                      setTheme(value);
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                      <Label
                        htmlFor="theme-light"
                        className={`flex items-center justify-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all w-full
                          ${(settings?.theme || 'system') === 'light' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted hover:border-muted-foreground'}`}
                      >
                        <Sun className={`h-5 w-5 ${(settings?.theme || 'system') === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-semibold">Light Mode</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                      <Label
                        htmlFor="theme-dark"
                        className={`flex items-center justify-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all w-full
                          ${(settings?.theme || 'system') === 'dark' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted hover:border-muted-foreground'}`}
                      >
                        <Moon className={`h-5 w-5 ${(settings?.theme || 'system') === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-semibold">Dark Mode</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                      <Label
                        htmlFor="theme-system"
                        className={`flex items-center justify-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all w-full
                          ${(settings?.theme || 'system') === 'system' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted hover:border-muted-foreground'}`}
                      >
                        <Monitor className={`h-5 w-5 ${(settings?.theme || 'system') === 'system' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex flex-col">
                          <span className="font-semibold text-center">System Default</span>
                          <span className="text-[10px] text-muted-foreground text-center">(Follows Dark)</span>
                        </div>
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

            {/* System & Storage Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  System & Storage
                </CardTitle>
                <CardDescription>
                  Manage local data, caching, and client performance options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">Local Data Caching</Label>
                    <p className="text-xs text-muted-foreground">Clear client-side cache to force reload fresh database contents</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleClearCache} className="gap-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    Clear Local Cache
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Settings Tab */}
          <TabsContent value="learning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Learning Preferences
                </CardTitle>
                <CardDescription>
                  Customize how you learn and track progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Learning Pace */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Learning Pace</Label>
                  <p className="text-xs text-muted-foreground">Affects roadmap timelines and recommendations</p>
                  <RadioGroup
                    value={settings?.learningPace || 'balanced'}
                    onValueChange={(value) => updateSetting('learningPace', value as any)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="slow" id="slow" className="sr-only" />
                      <Label
                        htmlFor="slow"
                        className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all w-full text-center
                          ${(settings?.learningPace || 'balanced') === 'slow' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted hover:border-muted-foreground'}`}
                      >
                        <span className="font-semibold text-foreground">Relaxed</span>
                        <span className="text-[10px] text-muted-foreground">Slower timeline, ideal for part-time learners</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="balanced" id="balanced" className="sr-only" />
                      <Label
                        htmlFor="balanced"
                        className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all w-full text-center
                          ${(settings?.learningPace || 'balanced') === 'balanced' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted hover:border-muted-foreground'}`}
                      >
                        <span className="font-semibold text-foreground">Balanced</span>
                        <span className="text-[10px] text-muted-foreground">Steady progression, recommended for most users</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fast" id="fast" className="sr-only" />
                      <Label
                        htmlFor="fast"
                        className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all w-full text-center
                          ${(settings?.learningPace || 'balanced') === 'fast' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted hover:border-muted-foreground'}`}
                      >
                        <span className="font-semibold text-foreground">Fast-paced</span>
                        <span className="text-[10px] text-muted-foreground">Aggressive timeline, ideal for full-time bootcamps</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Weekly Goal */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-sm font-semibold">Weekly Learning Goal</Label>
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
                  <Label className="text-sm font-semibold">Skill Difficulty Preference</Label>
                  <p className="text-xs text-muted-foreground">How challenging should new skills be?</p>
                  <RadioGroup
                    value={settings?.preferences?.difficultyPreference || 'adaptive'}
                    onValueChange={(value) => updateSetting('preferences.difficultyPreference', value as any)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easy" id="easy" className="sr-only" />
                      <Label
                        htmlFor="easy"
                        className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all w-full text-center
                          ${(settings?.preferences?.difficultyPreference || 'adaptive') === 'easy' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted hover:border-muted-foreground'}`}
                      >
                        <span className="font-semibold text-foreground">Start Easy</span>
                        <span className="text-[10px] text-muted-foreground">Begin with fundamental topics and build up confidence</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="adaptive" id="adaptive" className="sr-only" />
                      <Label
                        htmlFor="adaptive"
                        className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all w-full text-center
                          ${(settings?.preferences?.difficultyPreference || 'adaptive') === 'adaptive' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted hover:border-muted-foreground'}`}
                      >
                        <span className="font-semibold text-foreground">Adaptive AI</span>
                        <span className="text-[10px] text-muted-foreground">Difficulty adjusts dynamically based on your quiz answers</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="challenging" id="challenging" className="sr-only" />
                      <Label
                        htmlFor="challenging"
                        className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all w-full text-center
                          ${(settings?.preferences?.difficultyPreference || 'adaptive') === 'challenging' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted hover:border-muted-foreground'}`}
                      >
                        <span className="font-semibold text-foreground">Challenging</span>
                        <span className="text-[10px] text-muted-foreground">Jump straight into intermediate and advanced scenarios</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Career Focus */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Career Focus & Goals
                </CardTitle>
                <CardDescription>
                  Set your career objectives and job search preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Job Countries */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Job Search Countries</Label>
                  <p className="text-xs text-muted-foreground">Countries to search for job opportunities</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {countries.map((country) => (
                      <div key={country.code} className="flex items-center space-x-3 p-3 border rounded-xl bg-card/40 hover:bg-card/85 transition-colors">
                        <Checkbox
                          id={country.code}
                          checked={settings?.jobCountries?.includes(country.code) || false}
                          onCheckedChange={() => toggleJobCountry(country.code)}
                        />
                        <Label htmlFor={country.code} className="cursor-pointer text-sm font-medium text-foreground w-full">
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
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Control when and how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Master Toggle */}
                <div className={`flex items-center justify-between p-5 border border-border rounded-xl transition-all duration-300
                  ${settings?.notifications ? 'border-primary bg-primary/5 shadow-md' : 'border-muted bg-card'}`}>
                  <div className="space-y-1">
                    <Label className="text-sm font-bold text-foreground">Enable Notifications</Label>
                    <p className="text-xs text-muted-foreground">Master toggle for receiving all email and platform alerts</p>
                  </div>
                  <Switch
                    id="master-notifications"
                    checked={settings?.notifications || false}
                    onCheckedChange={(checked) => updateSetting('notifications', checked)}
                  />
                </div>

                <Separator />

                {/* Email Notifications */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Email Alerts
                  </Label>
                  <div className="grid gap-4">
                    <div className={`flex items-center justify-between p-4 border rounded-xl bg-card/50 transition-all duration-300
                      ${settings?.notifications ? 'hover:border-muted-foreground/30' : 'opacity-60 cursor-not-allowed'}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                          <Target className="h-4 w-4" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground">Roadmap Updates</Label>
                          <p className="text-xs text-muted-foreground">Receive emails when your custom learning roadmap changes or progresses</p>
                        </div>
                      </div>
                      <Switch
                        id="notify-roadmap"
                        checked={settings?.emailNotifications?.roadmapUpdates || false}
                        onCheckedChange={(checked) => updateSetting('emailNotifications.roadmapUpdates', checked)}
                        disabled={!settings?.notifications}
                      />
                    </div>

                    <div className={`flex items-center justify-between p-4 border rounded-xl bg-card/50 transition-all duration-300
                      ${settings?.notifications ? 'hover:border-muted-foreground/30' : 'opacity-60 cursor-not-allowed'}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground">Job Recommendations</Label>
                          <p className="text-xs text-muted-foreground">Get matched job postings based on your skills and target role</p>
                        </div>
                      </div>
                      <Switch
                        id="notify-jobs"
                        checked={settings?.emailNotifications?.jobRecommendations || false}
                        onCheckedChange={(checked) => updateSetting('emailNotifications.jobRecommendations', checked)}
                        disabled={!settings?.notifications}
                      />
                    </div>

                    <div className={`flex items-center justify-between p-4 border rounded-xl bg-card/50 transition-all duration-300
                      ${settings?.notifications ? 'hover:border-muted-foreground/30' : 'opacity-60 cursor-not-allowed'}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground">Learning Reminders</Label>
                          <p className="text-xs text-muted-foreground">Daily prompts and scheduling reminders to help keep your learning streaks active</p>
                        </div>
                      </div>
                      <Switch
                        id="notify-reminders"
                        checked={settings?.emailNotifications?.learningReminders || false}
                        onCheckedChange={(checked) => updateSetting('emailNotifications.learningReminders', checked)}
                        disabled={!settings?.notifications}
                      />
                    </div>

                    <div className={`flex items-center justify-between p-4 border rounded-xl bg-card/50 transition-all duration-300
                      ${settings?.notifications ? 'hover:border-muted-foreground/30' : 'opacity-60 cursor-not-allowed'}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                          <BarChart3 className="h-4 w-4" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-foreground">Weekly Progress Reports</Label>
                          <p className="text-xs text-muted-foreground">A summary report of your weekly study hours, completed milestones, and skills gained</p>
                        </div>
                      </div>
                      <Switch
                        id="notify-weekly"
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
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy & Data Control
                </CardTitle>
                <CardDescription>
                  Manage your data, profile sharing, and visibility preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Visibility */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Profile Visibility
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Control who can view your main profile card, display name, avatar, and active status.
                    </p>
                  </div>
                  <RadioGroup
                    value={settings?.privacy?.profileVisibility || 'private'}
                    onValueChange={(value) => updateSetting('privacy.profileVisibility', value as any)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="profile-private" className="sr-only" />
                      <Label
                        htmlFor="profile-private"
                        className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 w-full hover:bg-card/85
                          ${(settings?.privacy?.profileVisibility || 'private') === 'private'
                            ? 'border-primary bg-primary/5 shadow-md scale-[1.01]'
                            : 'border-muted bg-card/40 hover:border-muted-foreground/30'}`}
                      >
                        <div className={`p-2 rounded-lg mt-0.5 transition-colors duration-300
                          ${(settings?.privacy?.profileVisibility || 'private') === 'private' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Lock className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-sm text-foreground block">Private Mode</span>
                          <span className="text-[11px] text-muted-foreground block mt-1">
                            Only you can view your profile details. External sharing is disabled.
                          </span>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="profile-public" className="sr-only" />
                      <Label
                        htmlFor="profile-public"
                        className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 w-full hover:bg-card/85
                          ${(settings?.privacy?.profileVisibility || 'private') === 'public'
                            ? 'border-primary bg-primary/5 shadow-md scale-[1.01]'
                            : 'border-muted bg-card/40 hover:border-muted-foreground/30'}`}
                      >
                        <div className={`p-2 rounded-lg mt-0.5 transition-colors duration-300
                          ${(settings?.privacy?.profileVisibility || 'private') === 'public' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Globe className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-sm text-foreground block">Public Profile</span>
                          <span className="text-[11px] text-muted-foreground block mt-1">
                            Anyone can view your profile card. Enables sharing with recruitment partners via unique link.
                          </span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Skills Visibility */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      Skills Visibility
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Control who can view your custom skill trees, currently unlocked nodes, and levels.
                    </p>
                  </div>
                  <RadioGroup
                    value={settings?.privacy?.skillsVisibility || 'private'}
                    onValueChange={(value) => updateSetting('privacy.skillsVisibility', value as any)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="skills-private" className="sr-only" />
                      <Label
                        htmlFor="skills-private"
                        className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 w-full hover:bg-card/85
                          ${(settings?.privacy?.skillsVisibility || 'private') === 'private'
                            ? 'border-primary bg-primary/5 shadow-md scale-[1.01]'
                            : 'border-muted bg-card/40 hover:border-muted-foreground/30'}`}
                      >
                        <div className={`p-2 rounded-lg mt-0.5 transition-colors duration-300
                          ${(settings?.privacy?.skillsVisibility || 'private') === 'private' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Lock className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-sm text-foreground block">Private Mode</span>
                          <span className="text-[11px] text-muted-foreground block mt-1">
                            Only you can see your custom skill trees and achieved badges.
                          </span>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="skills-public" className="sr-only" />
                      <Label
                        htmlFor="skills-public"
                        className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 w-full hover:bg-card/85
                          ${(settings?.privacy?.skillsVisibility || 'private') === 'public'
                            ? 'border-primary bg-primary/5 shadow-md scale-[1.01]'
                            : 'border-muted bg-card/40 hover:border-muted-foreground/30'}`}
                      >
                        <div className={`p-2 rounded-lg mt-0.5 transition-colors duration-300
                          ${(settings?.privacy?.skillsVisibility || 'private') === 'public' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Eye className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-sm text-foreground block">Publicly Visible</span>
                          <span className="text-[11px] text-muted-foreground block mt-1">
                            Display your unlocked skills on your public profile page for recruiters and peers.
                          </span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Progress Visibility */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Progress & Activity Visibility
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Control who can view your motivation dashboard, XP logs, study time graphs, and learning streak statistics.
                    </p>
                  </div>
                  <RadioGroup
                    value={settings?.privacy?.progressVisibility || 'private'}
                    onValueChange={(value) => updateSetting('privacy.progressVisibility', value as any)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="progress-private" className="sr-only" />
                      <Label
                        htmlFor="progress-private"
                        className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 w-full hover:bg-card/85
                          ${(settings?.privacy?.progressVisibility || 'private') === 'private'
                            ? 'border-primary bg-primary/5 shadow-md scale-[1.01]'
                            : 'border-muted bg-card/40 hover:border-muted-foreground/30'}`}
                      >
                        <div className={`p-2 rounded-lg mt-0.5 transition-colors duration-300
                          ${(settings?.privacy?.progressVisibility || 'private') === 'private' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Lock className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-sm text-foreground block">Private Mode</span>
                          <span className="text-[11px] text-muted-foreground block mt-1">
                            Keep your daily activity logs, weekly reports, XP gains, and study duration private.
                          </span>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="progress-public" className="sr-only" />
                      <Label
                        htmlFor="progress-public"
                        className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 w-full hover:bg-card/85
                          ${(settings?.privacy?.progressVisibility || 'private') === 'public'
                            ? 'border-primary bg-primary/5 shadow-md scale-[1.01]'
                            : 'border-muted bg-card/40 hover:border-muted-foreground/30'}`}
                      >
                        <div className={`p-2 rounded-lg mt-0.5 transition-colors duration-300
                          ${(settings?.privacy?.progressVisibility || 'private') === 'public' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Eye className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-sm text-foreground block">Publicly Visible</span>
                          <span className="text-[11px] text-muted-foreground block mt-1">
                            Show your learning consistency, activity graphs, and streak records to inspire others.
                          </span>
                        </div>
                      </Label>
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
            <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Account & Data Management
                </CardTitle>
                <CardDescription>
                  Import/export backups, reset preferences, or manage your active session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Grid of Data Management Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Export Card */}
                  <div className="flex flex-col justify-between p-4 border border-border rounded-xl bg-card/55 hover:border-muted-foreground/35 hover:bg-card/75 transition-all duration-300">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <Download className="h-4 w-4" />
                        </div>
                        <Label className="text-sm font-bold text-foreground">Export Backup</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Download your customized preferences, theme modes, notifications setup, and pace choices in a secure JSON file.
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleExportSettings} className="w-full gap-2 mt-auto">
                      <Download className="h-4 w-4 text-primary" />
                      Export Profile Settings
                    </Button>
                  </div>

                  {/* Import Card */}
                  <div className="flex flex-col justify-between p-4 border border-border rounded-xl bg-card/55 hover:border-muted-foreground/35 hover:bg-card/75 transition-all duration-300">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <Upload className="h-4 w-4" />
                        </div>
                        <Label className="text-sm font-bold text-foreground">Import Profile</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Upload a previously exported `.json` configuration file to instantly restore your custom UI settings and preferences.
                      </p>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportSettings}
                        className="hidden"
                        id="import-settings"
                        name="import-settings"
                      />
                      <Button variant="outline" asChild className="w-full gap-2 mt-auto cursor-pointer">
                        <label htmlFor="import-settings" className="flex items-center justify-center w-full">
                          <Upload className="h-4 w-4 text-primary mr-2" />
                          Import JSON Settings
                        </label>
                      </Button>
                    </div>
                  </div>

                  {/* Reset Settings Card */}
                  <div className="flex flex-col justify-between p-4 border border-border rounded-xl bg-card/55 hover:border-muted-foreground/35 hover:bg-card/75 transition-all duration-300">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
                          <RotateCcw className="h-4 w-4" />
                        </div>
                        <Label className="text-sm font-bold text-foreground">Reset Configuration</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Revert all visual selections, job country metrics, and difficulty ranges to default factory values. Progress remains safe.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" disabled={resetting} className="w-full gap-2 mt-auto border-destructive/25 text-destructive/85 hover:bg-destructive/10 hover:text-destructive">
                          {resetting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4 mr-2" />
                          )}
                          Reset Preferences
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Reset settings to default?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will reset all your theme profiles, notification states, and custom study rates. Your custom skills lists, study logs, and roadmap nodes are NOT affected.
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

                  {/* Logout Session Card */}
                  <div className="flex flex-col justify-between p-4 border border-border rounded-xl bg-card/55 hover:border-muted-foreground/35 hover:bg-card/75 transition-all duration-300">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <Label className="text-sm font-bold text-foreground">Active Session</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Disconnect from your account and log out of the current device. You will be redirected to the sign-in portal.
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => signOut()} className="w-full gap-2 mt-auto">
                      <LogOut className="h-4 w-4 text-primary" />
                      Sign Out Session
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