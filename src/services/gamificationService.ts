import { apiClient } from './apiClient';

// Types
export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: string | null;
  streakContinued?: boolean;
  streakStarted?: boolean;
}

export interface LevelInfo {
  level: number;
  title: string;
  nextLevel: number | null;
  nextTitle: string | null;
  nextLevelXP: number | null;
  currentLevelXP: number;
  progressToNext: number;
}

export interface XPData {
  totalXP: number;
  weeklyXP: number;
  monthlyXP: number;
  level: number;
  levelTitle: string;
  levelInfo: LevelInfo;
  modulesCompleted: number;
  quizzesCompleted: number;
  roadmapsCompleted: number;
  xpAwarded?: number;
  action?: string;
  leveledUp?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface CalendarDay {
  activities: number;
  types: string[];
}

export interface CalendarData {
  [date: string]: CalendarDay;
}

export interface AchievementsSummary {
  unlocked: number;
  total: number;
}

export interface MotivationDashboard {
  streak: StreakData;
  xp: XPData;
  achievements: Achievement[];
  achievementsSummary: AchievementsSummary;
  calendar: CalendarData;
}

export interface GamificationResponse {
  streak: StreakData;
  xp: XPData;
  newAchievements: Achievement[];
}

class GamificationService {
  private static instance: GamificationService;

  private constructor() {}

  public static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  /** Get current/best streak */
  public async getStreak(): Promise<StreakData> {
    return apiClient.get<StreakData>('/gamification/streak', false);
  }

  /** Get XP, level, and stats */
  public async getXP(): Promise<XPData> {
    return apiClient.get<XPData>('/gamification/xp', false);
  }

  /** Get all achievements with unlock status */
  public async getAchievements(): Promise<Achievement[]> {
    return apiClient.get<Achievement[]>('/gamification/achievements', false);
  }

  /** Get learning calendar heatmap data */
  public async getCalendar(months: number = 6): Promise<CalendarData> {
    return apiClient.get<CalendarData>(`/gamification/calendar?months=${months}`, false);
  }

  /** Get aggregated motivation dashboard data */
  public async getDashboard(): Promise<MotivationDashboard> {
    return apiClient.get<MotivationDashboard>('/gamification/dashboard', false);
  }
}

export const gamificationService = GamificationService.getInstance();
export default gamificationService;
