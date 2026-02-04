import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  Flame,
  Star,
  BookOpen,
  Brain,
  Trophy,
  Zap,
  Calendar,
  BarChart3
} from 'lucide-react';
import api from '../../api/axios';

export default function ProgressDashboard({ userId }) {
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['user-progress', userId],
    queryFn: async () => {
      const res = await api.get('/daily-challenge/streak');
      return res.data.data;
    },
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-white/10 rounded-2xl"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-white/10 rounded-2xl"></div>
          <div className="h-24 bg-white/10 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Streak Section */}
      <StreakDisplay streak={progressData} />
      
      {/* Weekly Activity Heatmap */}
      <WeeklyActivity activity={progressData?.weeklyActivity} />
      
      {/* Stats Grid */}
      <StatsGrid stats={progressData} />
      
      {/* Milestones */}
      <Milestones milestones={progressData?.milestones} />
    </div>
  );
}

// Streak Display Component
function StreakDisplay({ streak }) {
  const multiplier = streak?.multiplier || 1;
  
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl p-6 text-white">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-10"></div>
      
      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-8 h-8 animate-pulse" />
            <span className="text-sm font-medium opacity-80">Current Streak</span>
          </div>
          <div className="text-6xl font-bold">
            {streak?.currentStreak || 0}
            <span className="text-2xl ml-2">days</span>
          </div>
          {multiplier > 1 && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
              <Zap className="w-4 h-4" />
              <span className="font-bold">{multiplier}x XP Multiplier</span>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-sm opacity-80 mb-1">Longest</div>
          <div className="text-3xl font-bold">{streak?.longestStreak || 0}</div>
          <div className="text-sm opacity-80">days</div>
        </div>
      </div>
      
      {/* Streak freezes */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm opacity-80">Streak Freezes:</span>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                i < (streak?.freezesAvailable || 0) ? 'bg-cyan-400' : 'bg-white/20'
              }`}
            >
              ❄️
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Weekly Activity Heatmap
function WeeklyActivity({ activity }) {
  const days = activity || Array.from({ length: 7 }, (_, i) => ({
    dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
    active: false,
    xpEarned: 0
  }));

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-purple-400" />
        This Week
      </h3>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => (
          <div key={idx} className="text-center">
            <div className="text-xs text-gray-400 mb-2">{day.dayName}</div>
            <div
              className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-all ${
                day.active
                  ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-white/5 text-gray-500'
              }`}
            >
              {day.active ? '✓' : '·'}
            </div>
            {day.xpEarned > 0 && (
              <div className="text-xs text-green-400 mt-1">+{day.xpEarned}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Stats Grid
function StatsGrid({ stats }) {
  const statItems = [
    {
      label: 'Total XP',
      value: stats?.totalXP || 0,
      icon: Star,
      color: 'from-yellow-400 to-orange-500',
      format: (v) => v.toLocaleString()
    },
    {
      label: 'Level',
      value: stats?.level || 1,
      icon: Trophy,
      color: 'from-purple-400 to-pink-500',
      format: (v) => v
    },
    {
      label: 'Questions',
      value: stats?.totalQuestions || 0,
      icon: Target,
      color: 'from-blue-400 to-cyan-500',
      format: (v) => v.toLocaleString()
    },
    {
      label: 'Time Spent',
      value: stats?.timeSpent || 0,
      icon: Clock,
      color: 'from-green-400 to-emerald-500',
      format: (v) => `${Math.round(v / 60)}h`
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 text-center group hover:scale-105 transition-transform"
        >
          <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <stat.icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stat.format(stat.value)}
          </div>
          <div className="text-sm text-gray-400">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// Milestones Component
function Milestones({ milestones = [] }) {
  const allMilestones = [
    { days: 3, icon: '🔥', name: 'Streak Starter' },
    { days: 7, icon: '⚡', name: 'Week Warrior' },
    { days: 14, icon: '💪', name: 'Fortnight Fighter' },
    { days: 30, icon: '👑', name: 'Monthly Master' },
    { days: 60, icon: '🏆', name: 'Dedication King' },
    { days: 100, icon: '🌟', name: 'Century Champion' }
  ];

  const earnedDays = milestones.map(m => m.days);

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-yellow-400" />
        Streak Milestones
      </h3>
      
      <div className="flex items-center justify-between">
        {allMilestones.map((milestone, idx) => {
          const isEarned = earnedDays.includes(milestone.days);
          
          return (
            <React.Fragment key={milestone.days}>
              <div className={`text-center ${!isEarned && 'opacity-40'}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-2 ${
                  isEarned 
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg' 
                    : 'bg-white/10'
                }`}>
                  {isEarned ? milestone.icon : '🔒'}
                </div>
                <div className="text-xs text-gray-400">{milestone.days}d</div>
              </div>
              
              {idx < allMilestones.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full ${
                  earnedDays.includes(allMilestones[idx + 1]?.days)
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'bg-white/10'
                }`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Subject Progress Chart
export function SubjectProgress({ progress = [] }) {
  const subjects = progress.length > 0 ? progress : [
    { subject: 'Math', percentage: 0, color: 'from-blue-400 to-indigo-500' },
    { subject: 'Physics', percentage: 0, color: 'from-purple-400 to-pink-500' },
    { subject: 'Chemistry', percentage: 0, color: 'from-green-400 to-teal-500' },
    { subject: 'Biology', percentage: 0, color: 'from-emerald-400 to-green-500' },
    { subject: 'English', percentage: 0, color: 'from-orange-400 to-red-500' }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-400" />
        Subject Mastery
      </h3>
      
      <div className="space-y-4">
        {subjects.map((subject, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white font-medium">{subject.subject}</span>
              <span className="text-gray-400">{subject.percentage}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${subject.color} transition-all duration-1000`}
                style={{ width: `${subject.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Level Progress Ring
export function LevelProgressRing({ xp = 0, level = 1, size = 120 }) {
  const xpPerLevel = 200;
  const currentLevelXP = xp % xpPerLevel;
  const progress = (currentLevelXP / xpPerLevel) * 100;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#levelGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{level}</span>
        <span className="text-xs text-gray-400">LEVEL</span>
      </div>
    </div>
  );
}
