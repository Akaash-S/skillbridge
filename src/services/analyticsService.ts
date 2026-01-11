/**
 * Analytics Service - Enhanced Learning Analytics
 * Provides comprehensive analytics for user learning progress and insights
 */

import { 
  LearningSession, 
  SkillProgression, 
  LearningAnalytics, 
  LearningInsight,
  ResourceEffectiveness,
  RoadmapItem,
  UserSkill,
  ProficiencyLevel 
} from "@/data/mockData";

export class AnalyticsService {
  
  /**
   * Calculate comprehensive learning analytics for a user's roadmap progress
   */
  static calculateLearningAnalytics(
    roadmap: RoadmapItem[],
    userProgress: any,
    learningSessions: LearningSession[] = []
  ): LearningAnalytics {
    const completedItems = roadmap.filter(item => item.completed).length;
    const totalItems = roadmap.length;
    const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    
    // Calculate learning velocity
    const startDate = userProgress?.startedAt ? new Date(userProgress.startedAt) : new Date();
    const currentDate = new Date();
    const weeksElapsed = Math.max(1, Math.ceil((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    const learningVelocity = completedItems / weeksElapsed;
    
    // Estimate completion
    const remainingSkills = totalItems - completedItems;
    const estimatedWeeksRemaining = learningVelocity > 0 ? Math.ceil(remainingSkills / learningVelocity) : 12;
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + (estimatedWeeksRemaining * 7));
    
    // Calculate completion likelihood
    const completionLikelihood = this.calculateCompletionLikelihood(
      progressPercent, 
      learningVelocity, 
      weeksElapsed,
      learningSessions
    );
    
    // Calculate time metrics
    const totalTimeSpent = learningSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / 60; // hours
    const averageSessionDuration = learningSessions.length > 0 
      ? learningSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / learningSessions.length 
      : 0;
    
    // Calculate streaks
    const { currentStreak, longestStreak } = this.calculateLearningStreaks(learningSessions);
    
    // Generate insights
    const insights = this.generateLearningInsights(
      progressPercent, 
      learningVelocity, 
      weeksElapsed, 
      currentStreak,
      totalTimeSpent
    );
    
    // Recommended pace (skills per week to complete in reasonable time)
    const targetWeeks = Math.max(8, totalItems * 0.5); // At least 8 weeks, or 0.5 weeks per skill
    const recommendedPace = totalItems / targetWeeks;
    const isOnTrack = learningVelocity >= recommendedPace * 0.8; // 80% of recommended pace
    
    return {
      progressPercent,
      learningVelocity,
      weeksElapsed,
      estimatedWeeksRemaining,
      estimatedCompletionDate,
      completionLikelihood,
      isOnTrack,
      recommendedPace,
      insights,
      totalTimeSpent,
      averageSessionDuration,
      currentStreak,
      longestStreak
    };
  }
  
  /**
   * Calculate likelihood of completing the roadmap based on various factors
   */
  private static calculateCompletionLikelihood(
    progressPercent: number,
    learningVelocity: number,
    weeksElapsed: number,
    learningSessions: LearningSession[]
  ): number {
    let likelihood = 50; // Base 50%
    
    // Progress-based factors
    if (progressPercent > 10) likelihood += 15; // Good start
    if (progressPercent > 25) likelihood += 10; // Quarter done
    if (progressPercent > 50) likelihood += 15; // Halfway point
    if (progressPercent > 75) likelihood += 10; // Almost there
    
    // Velocity-based factors
    if (learningVelocity > 1) likelihood += 10; // Good pace
    if (learningVelocity > 2) likelihood += 5; // Excellent pace
    if (learningVelocity < 0.5 && weeksElapsed > 4) likelihood -= 15; // Slow pace
    
    // Consistency factors
    const recentSessions = learningSessions.filter(s => {
      const sessionDate = new Date(s.startTime);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return sessionDate > twoWeeksAgo;
    });
    
    if (recentSessions.length > 5) likelihood += 10; // Active learner
    if (recentSessions.length === 0 && weeksElapsed > 2) likelihood -= 20; // Inactive
    
    // Time-based factors
    if (weeksElapsed < 2) likelihood += 5; // Fresh start
    if (weeksElapsed > 12 && progressPercent < 50) likelihood -= 10; // Stalled
    
    return Math.max(5, Math.min(95, likelihood));
  }
  
  /**
   * Calculate current and longest learning streaks
   */
  private static calculateLearningStreaks(sessions: LearningSession[]): { currentStreak: number; longestStreak: number } {
    if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    // Group sessions by date
    const sessionsByDate = new Map<string, LearningSession[]>();
    sessions.forEach(session => {
      const dateKey = new Date(session.startTime).toDateString();
      if (!sessionsByDate.has(dateKey)) {
        sessionsByDate.set(dateKey, []);
      }
      sessionsByDate.get(dateKey)!.push(session);
    });
    
    const uniqueDates = Array.from(sessionsByDate.keys()).sort();
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    // Check if learned today or yesterday
    if (sessionsByDate.has(today) || sessionsByDate.has(yesterdayStr)) {
      let checkDate = new Date();
      if (!sessionsByDate.has(today)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      while (sessionsByDate.has(checkDate.toDateString())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;
    
    uniqueDates.forEach(dateStr => {
      const currentDate = new Date(dateStr);
      
      if (lastDate && (currentDate.getTime() - lastDate.getTime()) === 24 * 60 * 60 * 1000) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
      lastDate = currentDate;
    });
    
    return { currentStreak, longestStreak };
  }
  
  /**
   * Generate personalized learning insights based on user behavior
   */
  private static generateLearningInsights(
    progressPercent: number,
    learningVelocity: number,
    weeksElapsed: number,
    currentStreak: number,
    totalTimeSpent: number
  ): LearningInsight[] {
    const insights: LearningInsight[] = [];
    
    // Progress-based insights
    if (progressPercent < 10 && weeksElapsed > 2) {
      insights.push({
        type: 'warning',
        title: 'Slow Start',
        message: 'Consider setting aside dedicated learning time each day to build momentum.',
        action: 'Set a daily learning goal',
        priority: 'high'
      });
    }
    
    if (progressPercent > 25 && progressPercent < 50 && learningVelocity < 0.5) {
      insights.push({
        type: 'info',
        title: 'Maintain Momentum',
        message: 'You\'ve made good progress! Try to maintain consistent learning to avoid plateaus.',
        action: 'Schedule regular learning sessions',
        priority: 'medium'
      });
    }
    
    if (progressPercent > 50 && learningVelocity > 1) {
      insights.push({
        type: 'success',
        title: 'Excellent Progress!',
        message: 'You\'re ahead of schedule and learning at a great pace. Keep it up!',
        action: 'Consider mentoring others',
        priority: 'low'
      });
    }
    
    if (progressPercent > 80) {
      insights.push({
        type: 'success',
        title: 'Almost There!',
        message: 'You\'re in the final stretch. Start preparing for job applications and portfolio updates.',
        action: 'Update resume and LinkedIn',
        priority: 'high'
      });
    }
    
    // Velocity-based insights
    if (learningVelocity > 2) {
      insights.push({
        type: 'success',
        title: 'Fast Learner',
        message: 'You\'re learning faster than average. Consider taking on more challenging projects.',
        action: 'Explore advanced topics',
        priority: 'medium'
      });
    }
    
    if (learningVelocity < 0.3 && weeksElapsed > 4) {
      insights.push({
        type: 'warning',
        title: 'Learning Pace',
        message: 'Your learning pace has slowed down. Consider adjusting your schedule or approach.',
        action: 'Review learning strategy',
        priority: 'high'
      });
    }
    
    // Streak-based insights
    if (currentStreak > 7) {
      insights.push({
        type: 'success',
        title: 'Great Consistency!',
        message: `${currentStreak} day learning streak! Consistency is key to mastering new skills.`,
        action: 'Keep the streak alive',
        priority: 'low'
      });
    }
    
    if (currentStreak === 0 && weeksElapsed > 1) {
      insights.push({
        type: 'info',
        title: 'Get Back on Track',
        message: 'It\'s been a while since your last learning session. Even 15 minutes can help maintain momentum.',
        action: 'Start a quick learning session',
        priority: 'medium'
      });
    }
    
    // Time-based insights
    if (totalTimeSpent > 50) {
      insights.push({
        type: 'success',
        title: 'Dedicated Learner',
        message: `You've invested ${Math.round(totalTimeSpent)} hours in learning. That's impressive dedication!`,
        action: 'Track your achievements',
        priority: 'low'
      });
    }
    
    if (totalTimeSpent < 5 && weeksElapsed > 3) {
      insights.push({
        type: 'warning',
        title: 'More Practice Needed',
        message: 'Consider spending more time on hands-on practice to reinforce your learning.',
        action: 'Increase practice time',
        priority: 'medium'
      });
    }
    
    return insights;
  }
  
  /**
   * Analyze resource effectiveness based on user outcomes
   */
  static analyzeResourceEffectiveness(
    resources: any[],
    userSessions: LearningSession[],
    skillProgressions: SkillProgression[]
  ): ResourceEffectiveness[] {
    return resources.map(resource => {
      const resourceSessions = userSessions.filter(s => s.resourceId === resource.id);
      const completedSessions = resourceSessions.filter(s => s.completed);
      
      const completionRate = resourceSessions.length > 0 
        ? (completedSessions.length / resourceSessions.length) * 100 
        : 0;
      
      const averageRating = resourceSessions.length > 0
        ? resourceSessions.reduce((sum, s) => sum + (s.effectiveness || 3), 0) / resourceSessions.length
        : 0;
      
      const timeToComplete = completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length / 60
        : 0;
      
      // Calculate skill improvement rate (simplified)
      const skillImprovementRate = 75; // Placeholder - would need more complex calculation
      
      return {
        resourceId: resource.id,
        completionRate,
        averageRating,
        timeToComplete,
        skillImprovementRate,
        userFeedback: resourceSessions.map(s => ({
          rating: s.effectiveness || 3,
          comment: s.notes,
          timestamp: new Date(s.startTime)
        }))
      };
    });
  }
  
  /**
   * Generate skill progression analytics
   */
  static analyzeSkillProgression(
    userSkills: UserSkill[],
    roadmapCompletions: any[],
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ): SkillProgression[] {
    return userSkills.map(skill => {
      const relatedCompletions = roadmapCompletions.filter(c => c.skillId === skill.id);
      
      // Calculate time to mastery (simplified)
      const timeToMastery = relatedCompletions.length > 0 
        ? relatedCompletions.reduce((sum, c) => sum + (c.timeSpent || 20), 0)
        : 0;
      
      return {
        skillId: skill.id,
        initialLevel: 'beginner' as ProficiencyLevel, // Would track from historical data
        currentLevel: skill.proficiency,
        confidence: 75, // Would come from user assessments
        progressionHistory: [{
          timestamp: new Date(),
          level: skill.proficiency,
          confidence: 75,
          source: 'roadmap_completion' as const,
          notes: 'Completed roadmap items'
        }],
        practicalProjects: relatedCompletions.length,
        timeToMastery
      };
    });
  }
  
  /**
   * Calculate learning ROI and career impact metrics
   */
  static calculateLearningROI(
    timeInvested: number, // hours
    skillsGained: number,
    currentSalary: number,
    targetSalary: number
  ): {
    timeInvestment: number;
    skillsGained: number;
    potentialSalaryIncrease: number;
    roiPercentage: number;
    paybackPeriod: number; // months
  } {
    const potentialSalaryIncrease = targetSalary - currentSalary;
    const costOfTime = timeInvested * 25; // Assuming $25/hour opportunity cost
    const roiPercentage = costOfTime > 0 ? (potentialSalaryIncrease / costOfTime) * 100 : 0;
    const paybackPeriod = potentialSalaryIncrease > 0 ? (costOfTime / (potentialSalaryIncrease / 12)) : 0;
    
    return {
      timeInvestment: timeInvested,
      skillsGained,
      potentialSalaryIncrease,
      roiPercentage,
      paybackPeriod
    };
  }
}

export default AnalyticsService;