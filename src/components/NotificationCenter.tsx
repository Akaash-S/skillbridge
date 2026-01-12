import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell, 
  BellRing, 
  Clock, 
  Trophy, 
  Target, 
  BookOpen,
  Flame,
  Calendar,
  Settings,
  X,
  Check,
  AlertCircle,
  Info,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: 'reminder' | 'achievement' | 'milestone' | 'streak' | 'goal' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
  action?: () => void;
  actionLabel?: string;
}

interface NotificationSettings {
  dailyReminders: boolean;
  achievementAlerts: boolean;
  streakReminders: boolean;
  weeklyProgress: boolean;
  milestoneAlerts: boolean;
  reminderTime: string;
  reminderDays: string[];
}

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = "" }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyReminders: true,
    achievementAlerts: true,
    streakReminders: true,
    weeklyProgress: true,
    milestoneAlerts: true,
    reminderTime: '09:00',
    reminderDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  });
  const [showSettings, setShowSettings] = useState(false);

  // Mock notifications for demo
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'streak',
        title: '🔥 7-Day Streak!',
        message: "Congratulations! You've maintained a 7-day learning streak. Keep it up!",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        actionable: true,
        action: () => toast.success("Streak celebration! 🎉"),
        actionLabel: "Celebrate"
      },
      {
        id: '2',
        type: 'reminder',
        title: '📚 Daily Learning Reminder',
        message: "Time for your daily 30-minute learning session. You're doing great!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        actionable: true,
        action: () => window.location.href = '/roadmap',
        actionLabel: "Start Learning"
      },
      {
        id: '3',
        type: 'achievement',
        title: '🏆 Skill Mastered!',
        message: "You've completed 'React Fundamentals' and earned 100 XP!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        actionable: true,
        action: () => toast.info("Certificate available for download!"),
        actionLabel: "View Certificate"
      },
      {
        id: '4',
        type: 'milestone',
        title: '🎯 50% Progress Milestone',
        message: "You're halfway through your Full Stack Developer roadmap!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        read: true
      },
      {
        id: '5',
        type: 'goal',
        title: '📈 Weekly Goal Achieved',
        message: "You've completed your weekly learning goal of 10 hours. Excellent work!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        read: true
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder': return Clock;
      case 'achievement': return Trophy;
      case 'milestone': return Target;
      case 'streak': return Flame;
      case 'goal': return BookOpen;
      case 'system': return Info;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'reminder': return 'text-blue-600 bg-blue-100';
      case 'achievement': return 'text-yellow-600 bg-yellow-100';
      case 'milestone': return 'text-green-600 bg-green-100';
      case 'streak': return 'text-orange-600 bg-orange-100';
      case 'goal': return 'text-purple-600 bg-purple-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification deleted");
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const updateSettings = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success("Notification settings updated");
  };

  const scheduleNotification = (title: string, message: string, delay: number = 5000) => {
    setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      }
      toast.info(message);
    }, delay);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success("Browser notifications enabled!");
        scheduleNotification(
          "🎉 Notifications Enabled!",
          "You'll now receive learning reminders and achievement alerts."
        );
      } else {
        toast.error("Notification permission denied");
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Customize when and how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="daily-reminders">Daily Learning Reminders</Label>
                  <Switch
                    id="daily-reminders"
                    checked={settings.dailyReminders}
                    onCheckedChange={(checked) => updateSettings('dailyReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="achievement-alerts">Achievement Alerts</Label>
                  <Switch
                    id="achievement-alerts"
                    checked={settings.achievementAlerts}
                    onCheckedChange={(checked) => updateSettings('achievementAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="streak-reminders">Streak Reminders</Label>
                  <Switch
                    id="streak-reminders"
                    checked={settings.streakReminders}
                    onCheckedChange={(checked) => updateSettings('streakReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-progress">Weekly Progress Reports</Label>
                  <Switch
                    id="weekly-progress"
                    checked={settings.weeklyProgress}
                    onCheckedChange={(checked) => updateSettings('weeklyProgress', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="milestone-alerts">Milestone Alerts</Label>
                  <Switch
                    id="milestone-alerts"
                    checked={settings.milestoneAlerts}
                    onCheckedChange={(checked) => updateSettings('milestoneAlerts', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Timing & Schedule</h4>
                
                <div>
                  <Label htmlFor="reminder-time">Daily Reminder Time</Label>
                  <Select 
                    value={settings.reminderTime} 
                    onValueChange={(value) => updateSettings('reminderTime', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                      <SelectItem value="18:00">6:00 PM</SelectItem>
                      <SelectItem value="20:00">8:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Active Days</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Switch
                          id={day.toLowerCase()}
                          checked={settings.reminderDays.includes(day.toLowerCase())}
                          onCheckedChange={(checked) => {
                            const dayLower = day.toLowerCase();
                            const newDays = checked 
                              ? [...settings.reminderDays, dayLower]
                              : settings.reminderDays.filter(d => d !== dayLower);
                            updateSettings('reminderDays', newDays);
                          }}
                        />
                        <Label htmlFor={day.toLowerCase()} className="text-sm">{day.slice(0, 3)}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button onClick={requestNotificationPermission} className="w-full">
                  <BellRing className="h-4 w-4 mr-2" />
                  Enable Browser Notifications
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                You're all caught up! New notifications will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);
            
            return (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md ${
                  !notification.read ? 'border-primary/50 bg-primary/5' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {notification.actionable && notification.action && (
                        <div className="mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              notification.action?.();
                              markAsRead(notification.id);
                            }}
                          >
                            {notification.actionLabel || 'Take Action'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;