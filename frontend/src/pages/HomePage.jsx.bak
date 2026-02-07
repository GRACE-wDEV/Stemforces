import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Star, 
  Play, 
  User, 
  Award,
  Calendar,
  ChevronRight,
  Timer,
  Flame,
  Medal,
  Swords,
  Crown,
  ArrowRight,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { calculateLevel, getLevelProgress } from '../utils/levelUtils';
import api from '../api/axios';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Get subjects and quiz collections from API - use api instance for auth token
  const { data: homeData, isLoading, refetch } = useQuery({
    queryKey: ['home-page-data', isAuthenticated],
    queryFn: async () => {
      const response = await api.get('/home/data');
      return response.data;
    },
    // Refetch when auth status changes
    staleTime: 30000
  });

  const subjects = homeData?.data?.subjects || [];
  const userStats = homeData?.data?.userStats || {
    totalQuestions: 0,
    correctAnswers: 0,
    streak: 0,
    xp: 0,
    level: 1,
    rank: 0,
    timeSpent: 0,
    averageScore: 0
  };
  const recentAchievements = homeData?.data?.recentAchievements || [];

  // Calculate user level and progress using shared utility
  const currentLevel = calculateLevel(userStats.xp);
  const levelProgress = getLevelProgress(userStats.xp);
  const xpProgress = levelProgress.percentage;

  const startQuiz = (subject, topic) => {
    navigate(`/quiz/${subject.id}/${topic.id}`, { 
      state: { 
        subjectName: subject.name, 
        topicName: topic.name,
        difficulty: topic.difficulty,
        estimatedTime: topic.estimatedTime
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="spinner spinner-lg mx-auto mb-4"></div>
          <p className="text-[var(--text-tertiary)]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-28 sm:pb-12">
      {/* Hero Section */}
      <div className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Welcome Message */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
                Welcome back{isAuthenticated ? `, ${user?.name?.split(' ')[0] || 'Student'}` : ''}! 👋
              </h1>
              <p className="text-[var(--text-secondary)] text-lg mb-8">
                Ready to challenge yourself today? Pick a subject and start learning.
              </p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="stat-value">{userStats.totalQuestions}</div>
                  <div className="stat-label">Questions Solved</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value flex items-center gap-1">
                    {userStats.streak}
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="stat-label">Day Streak</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{userStats.averageScore}%</div>
                  <div className="stat-label">Accuracy</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value flex items-center gap-1">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    #{userStats.rank || '—'}
                  </div>
                  <div className="stat-label">Global Rank</div>
                </div>
              </div>
            </div>

            {/* Level Card */}
            <div className="card p-6">
              <div className="text-center mb-4">
                <div className="level-badge w-16 h-16 text-2xl mx-auto mb-3">
                  {currentLevel}
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Level {currentLevel}</h3>
                <p className="text-sm text-[var(--text-tertiary)]">{userStats.xp.toLocaleString()} XP</p>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[var(--text-tertiary)]">Next Level</span>
                  <span className="font-medium text-[var(--text-primary)]">{Math.round(xpProgress)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${xpProgress}%` }}></div>
                </div>
              </div>
              
              <p className="text-xs text-[var(--text-tertiary)] text-center">
                {levelProgress.remaining} XP to level up
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Challenge */}
          <Link to="/daily-challenge" className="featured-card featured-card-daily group">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Daily Challenge</span>
                </div>
                <h3 className="text-xl font-bold mb-1">Today's Challenge</h3>
                <p className="text-sm opacity-80 mb-4">Complete for bonus XP & maintain your streak</p>
                <div className="flex items-center text-sm font-medium">
                  <span>Start Challenge</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <div className="text-5xl opacity-30">🔥</div>
            </div>
          </Link>

          {/* Battle Mode */}
          <Link to="/battle" className="featured-card featured-card-battle group">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Swords className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Multiplayer</span>
                </div>
                <h3 className="text-xl font-bold mb-1">Quiz Battle</h3>
                <p className="text-sm opacity-80 mb-4">Challenge friends in real-time battles</p>
                <div className="flex items-center text-sm font-medium">
                  <span>Join Battle</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <div className="text-5xl opacity-30">⚔️</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Subject Categories */}
          <div className="lg:col-span-3">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[var(--brand-primary)]" />
                  Subjects
                </h2>
                <span className="text-sm text-[var(--text-tertiary)]">
                  {subjects.length} available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((subject) => (
                  <div 
                    key={subject.id}
                    className="card card-interactive p-5"
                    onClick={() => setSelectedSubject(selectedSubject === subject.id ? null : subject.id)}
                  >
                    {/* Subject Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${subject.color || 'bg-[var(--brand-primary)]'} rounded-lg flex items-center justify-center text-xl`}>
                          {subject.icon || '📚'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--text-primary)]">
                            {subject.name}
                          </h3>
                          <p className="text-sm text-[var(--text-tertiary)]">
                            {subject.totalQuestions} questions
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${selectedSubject === subject.id ? 'rotate-90' : ''}`} />
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-1.5">
                        <span>Progress</span>
                        <span>{subject.completedQuestions || 0}/{subject.totalQuestions}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-bar-fill"
                          style={{ width: `${((subject.completedQuestions || 0) / (subject.totalQuestions || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Topics (Expandable) */}
                    {selectedSubject === subject.id && (
                      <div className="space-y-3 pt-4 border-t border-[var(--border-primary)] animate-scale-in">
                        <h4 className="text-sm font-medium text-[var(--text-secondary)]">
                          Available Topics:
                        </h4>
                        {subject.topics?.length > 0 ? subject.topics.map((topic) => (
                          <div 
                            key={topic.id}
                            className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-[var(--text-primary)]">
                                {topic.name}
                              </h5>
                              <span className={`badge ${
                                topic.difficulty === 'Beginner' ? 'difficulty-easy' :
                                topic.difficulty === 'Intermediate' ? 'difficulty-medium' :
                                'difficulty-hard'
                              }`}>
                                {topic.difficulty}
                              </span>
                            </div>
                            
                            {topic.source && (
                              <p className="text-xs text-[var(--brand-primary)] mb-2">
                                📚 {topic.source}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-[var(--text-tertiary)] mb-3">
                              <span className="flex items-center gap-1">
                                <Target className="w-3.5 h-3.5" />
                                {topic.questions} questions
                              </span>
                              <span className="flex items-center gap-1">
                                <Timer className="w-3.5 h-3.5" />
                                ~{topic.estimatedTime}min
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startQuiz(subject, topic);
                              }}
                              className="btn btn-primary w-full"
                            >
                              <Play className="w-4 h-4" />
                              Start Quiz
                            </button>
                          </div>
                        )) : (
                          <div className="text-center py-6">
                            <BookOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2" />
                            <p className="text-sm text-[var(--text-tertiary)]">
                              No content available yet
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {subjects.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">No subjects yet</h3>
                  <p className="text-[var(--text-tertiary)]">Check back soon for new content!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <div className="card p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Recent Achievements
              </h3>
              <div className="space-y-3">
                {recentAchievements.length > 0 ? recentAchievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-[var(--text-primary)] truncate">
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {achievement.unlocked}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4">
                    <Medal className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--text-tertiary)]">Complete quizzes to earn badges!</p>
                  </div>
                )}
              </div>
              <Link 
                to="/achievements"
                className="block text-center text-sm font-medium text-[var(--brand-primary)] hover:underline mt-4"
              >
                View All →
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="card p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[var(--brand-primary)]" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/leaderboard')}
                  className="btn btn-secondary w-full justify-start"
                >
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  View Leaderboard
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className="btn btn-secondary w-full justify-start"
                >
                  <User className="w-4 h-4 text-[var(--brand-primary)]" />
                  My Profile
                </button>
                <button 
                  onClick={() => navigate('/achievements')}
                  className="btn btn-secondary w-full justify-start"
                >
                  <Medal className="w-4 h-4 text-orange-500" />
                  All Achievements
                </button>
              </div>
            </div>

            {/* Streak Card */}
            <div className="card p-5 bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
              <div className="text-center">
                <Flame className="w-10 h-10 mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">{userStats.streak} Day</div>
                <div className="text-sm opacity-90 mb-4">Study Streak</div>
                
                {/* Week Progress */}
                <div className="flex justify-center gap-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div 
                      key={i}
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium ${
                        i < userStats.streak % 7 
                          ? 'bg-white text-orange-600' 
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
