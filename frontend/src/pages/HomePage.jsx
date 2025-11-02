import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Target, 
  Star, 
  TrendingUp, 
  Play, 
  User, 
  Award,
  Zap,
  Calendar,
  BarChart3,
  ChevronRight,
  Timer,
  CheckCircle2,
  Brain,
  Flame,
  Medal
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Get subjects and quiz collections from API
  const { data: homeData, isLoading } = useQuery({
    queryKey: ['home-page-data'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/api/home/data');
      if (!response.ok) {
        throw new Error('Failed to fetch home page data');
      }
      return response.json();
    }
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

  // Calculate user level and progress
  const getLevel = (xp) => Math.floor(xp / 200) + 1;
  const getXPForNextLevel = (level) => level * 200;
  const currentLevel = getLevel(userStats.xp);
  const xpForNext = getXPForNextLevel(currentLevel);
  const xpProgress = ((userStats.xp % 200) / 200) * 100;

  const startQuiz = (subject, topic) => {
    console.log('Starting quiz with:', { subject, topic });
    console.log('Navigating to:', `/quiz/${subject.id}/${topic.id}`);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Hero Section with User Stats */}
      <div className="bg-gradient-to-br  text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Welcome Message */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {isAuthenticated ? user?.name || 'Student' : 'Guest'}! 🎓
              </h1>
              <p className="text-slate-100 text-lg mb-6">
                Ready to master your subjects? Let's continue your learning journey!
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{userStats.totalQuestions}</div>
                  <div className="text-slate-200 text-sm">Questions Solved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{userStats.streak}🔥</div>
                  <div className="text-slate-200 text-sm">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{userStats.averageScore}%</div>
                  <div className="text-slate-200 text-sm">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">#{userStats.rank}</div>
                  <div className="text-slate-200 text-sm">Class Rank</div>
                </div>
              </div>
            </div>

            {/* Level & XP Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-10 h-10 text-amber-800" />
                </div>
                <h3 className="text-xl font-bold">Level {currentLevel}</h3>
                <p className="text-slate-200">{userStats.xp} XP</p>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress to Level {currentLevel + 1}</span>
                  <span>{Math.round(xpProgress)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${xpProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-xs text-slate-200 text-center">
                {xpForNext - userStats.xp} XP to next level
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Subject Categories */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <BookOpen className="w-7 h-7 mr-3 text-slate-600 dark:text-slate-400" />
                  Subject Categories
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {subjects.length} subjects available
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subjects.map((subject) => (
                  <div 
                    key={subject.id}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 cursor-pointer group hover:shadow-lg bg-white dark:bg-gray-800"
                    onClick={() => setSelectedSubject(selectedSubject === subject.id ? null : subject.id)}
                  >
                    {/* Subject Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 ${subject.color} rounded-xl flex items-center justify-center text-2xl mr-4 group-hover:scale-105 transition-transform`}>
                          {subject.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {subject.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {subject.totalQuestions} questions
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${selectedSubject === subject.id ? 'rotate-90' : ''}`} />
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{subject.completedQuestions}/{subject.totalQuestions}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${subject.color} transition-all duration-300`}
                          style={{ width: `${(subject.completedQuestions / subject.totalQuestions) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Topics (Collapsible) */}
                    {selectedSubject === subject.id && (
                      <div className="space-y-3 animate-fade-in">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 border-t pt-3">
                          Available Content:
                        </h4>
                        {subject.topics.length > 0 ? subject.topics.map((topic) => (
                          <div 
                            key={topic.id}
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">
                                {topic.name}
                              </h5>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  topic.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  topic.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {topic.difficulty}
                                </span>
                                {topic.type === 'quiz' && (
                                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    Collection
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {topic.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {topic.description}
                              </p>
                            )}
                            
                            {topic.source && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                                📚 {topic.source}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <span className="flex items-center">
                                <Target className="w-4 h-4 mr-1" />
                                {topic.questions} questions
                              </span>
                              <span className="flex items-center">
                                <Timer className="w-4 h-4 mr-1" />
                                ~{topic.estimatedTime}min
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startQuiz(subject, topic);
                              }}
                              className="w-full bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start {topic.type === 'quiz' ? 'Collection' : 'Topic'}
                            </button>
                          </div>
                        )) : (
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 text-center">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                              No content available yet
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              This subject is ready for content! Teachers can add quiz collections and questions.
                            </p>
                            {isAuthenticated && (
                              <button
                                onClick={() => navigate('/admin')}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                              >
                                Go to Admin Panel →
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - User Dashboard & Achievements */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-amber-500" />
                Recent Achievements
              </h3>
              <div className="space-y-3">
                {recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                    <div className="text-2xl mr-3">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        {achievement.unlocked}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-blue-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/leaderboard')}
                  className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white py-3 px-4 rounded-lg font-medium hover:from-slate-700 hover:to-slate-800 transition-all flex items-center justify-center"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  View Leaderboard
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center"
                >
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </button>
                <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Study Analytics
                </button>
              </div>
            </div>

            {/* Study Streak */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-6">
              <div className="text-center">
                <Flame className="w-12 h-12 mx-auto mb-3 text-amber-100" />
                <h3 className="text-2xl font-bold mb-1">{userStats.streak} Day</h3>
                <p className="text-amber-100 mb-3">Study Streak</p>
                <p className="text-sm text-amber-200">
                  Keep it up! You're on fire! 🔥
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
