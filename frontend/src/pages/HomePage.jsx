import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen, Trophy, Target, Play, User, Award,
  Calendar, ChevronRight, ChevronDown, Timer, Flame,
  Medal, Swords, Crown, ArrowRight, Zap,
  Sparkles, Brain, Search, X, Eye, CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { calculateLevel, getLevelProgress } from '../utils/levelUtils';
import api from '../api/axios';

/* ─── greeting helper ─── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

/* ─── motivational tips ─── */
const TIPS = [
  "Consistency beats intensity — show up every day.",
  "Review wrong answers — that's where real learning happens.",
  "Try the Daily Challenge to keep your streak alive!",
  "Battle mode is great for pressure-testing what you know.",
  "Aim for 80%+ accuracy before moving to harder topics.",
  "Teach what you learn — that's the ultimate test.",
  "Take breaks! Your brain consolidates while you rest.",
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate tips
  useEffect(() => {
    const t = setInterval(() => setTipIndex(i => (i + 1) % TIPS.length), 8000);
    return () => clearInterval(t);
  }, []);

  // Fetch home data
  const { data: homeData, isLoading } = useQuery({
    queryKey: ['home-page-data', isAuthenticated],
    queryFn: async () => {
      const response = await api.get('/home/data');
      return response.data;
    },
    staleTime: 30000
  });

  const subjects = useMemo(() => homeData?.data?.subjects || [], [homeData]);
  const userStats = homeData?.data?.userStats || {
    totalQuestions: 0, correctAnswers: 0, streak: 0,
    xp: 0, level: 1, rank: 0, timeSpent: 0, averageScore: 0
  };
  const recentAchievements = homeData?.data?.recentAchievements || [];
  const continueData = homeData?.data?.continueData || null;
  const completedQuizIds = useMemo(() => new Set(continueData?.completedQuizIds || []), [continueData]);

  const currentLevel = calculateLevel(userStats.xp);
  const levelProgress = getLevelProgress(userStats.xp);
  const xpProgress = levelProgress.percentage;
  const xpRemaining = levelProgress.required - levelProgress.progress;
  const firstName = user?.name?.split(' ')[0] || 'Student';

  // Filter subjects
  const filteredSubjects = useMemo(() => {
    if (!subjectFilter.trim()) return subjects;
    const q = subjectFilter.toLowerCase();
    return subjects.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.topics?.some(t => t.name.toLowerCase().includes(q))
    );
  }, [subjects, subjectFilter]);

  // Subjects with content first, empty last
  const sortedSubjects = useMemo(() => {
    return [...filteredSubjects].sort((a, b) => (b.totalQuestions || 0) - (a.totalQuestions || 0));
  }, [filteredSubjects]);

  // "Continue where you left off" — subject with most progress but not complete
  const continueSubject = useMemo(() => {
    return subjects
      .filter(s => s.completedQuestions > 0 && s.completedQuestions < s.totalQuestions)
      .sort((a, b) => (b.completedQuestions / (b.totalQuestions || 1)) - (a.completedQuestions / (a.totalQuestions || 1)))[0];
  }, [subjects]);

  // Find the next uncompleted quiz in a subject for direct navigation
  const findNextQuiz = (subject) => {
    if (!subject?.topics) return null;
    // Find first topic (quiz) the user hasn't completed yet
    for (const topic of subject.topics) {
      if (topic.type === 'quiz' && !completedQuizIds.has(topic.id)) {
        return topic;
      }
    }
    // Fallback: first topic of any type
    return subject.topics.find(t => !completedQuizIds.has(t.id)) || subject.topics[0];
  };

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
      <div className="hp-loading">
        <div className="hp-loading-brain">🧠</div>
        <p>Loading your dashboard...</p>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="hp">
      {/* ── HERO ── */}
      <section className="hp-hero">
        <div className="hp-hero-inner">
          {/* Left: greeting + stats */}
          <div className="hp-hero-left">
            <h1 className="hp-greeting">
              {getGreeting()}{isAuthenticated ? `, ${firstName}` : ''} <span className="hp-wave">👋</span>
            </h1>
            <p className="hp-subtitle">
              {isAuthenticated
                ? userStats.totalQuestions === 0
                  ? "Start your first quiz and begin your learning journey!"
                  : `You've solved ${userStats.totalQuestions.toLocaleString()} questions. Let's keep climbing!`
                : "Challenge yourself with quizzes across multiple subjects. Start learning today!"}
            </p>

            {/* Quick stats row */}
            {isAuthenticated && (
              <div className="hp-stats-row">
                <div className="hp-stat">
                  <div className="hp-stat-icon fire"><Flame size={18} /></div>
                  <div>
                    <span className="hp-stat-val">{userStats.streak}</span>
                    <span className="hp-stat-label">Day streak</span>
                  </div>
                </div>
                <div className="hp-stat">
                  <div className="hp-stat-icon accuracy"><Target size={18} /></div>
                  <div>
                    <span className="hp-stat-val">{userStats.averageScore}%</span>
                    <span className="hp-stat-label">Accuracy</span>
                  </div>
                </div>
                <div className="hp-stat">
                  <div className="hp-stat-icon rank"><Crown size={18} /></div>
                  <div>
                    <span className="hp-stat-val">#{userStats.rank || '—'}</span>
                    <span className="hp-stat-label">Global rank</span>
                  </div>
                </div>
                <div className="hp-stat">
                  <div className="hp-stat-icon xp"><Zap size={18} /></div>
                  <div>
                    <span className="hp-stat-val">{userStats.xp.toLocaleString()}</span>
                    <span className="hp-stat-label">Total XP</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Level card */}
          {isAuthenticated && (
            <div className="hp-level-card" onClick={() => navigate('/profile')}>
              <div className="hp-level-badge">{currentLevel}</div>
              <div className="hp-level-info">
                <span className="hp-level-title">Level {currentLevel}</span>
                <div className="hp-level-bar">
                  <div className="hp-level-bar-fill" style={{ width: `${xpProgress}%` }} />
                </div>
                <span className="hp-level-remaining">{xpRemaining} XP to level {currentLevel + 1}</span>
              </div>
              <ChevronRight size={16} className="hp-level-arrow" />
            </div>
          )}
        </div>
      </section>

      {/* ── ACTION CARDS ── */}
      <section className="hp-actions">
        <Link to="/daily-challenge" className="hp-action-card daily">
          <div className="hp-action-icon">🔥</div>
          <div className="hp-action-body">
            <span className="hp-action-badge">Daily</span>
            <h3>Today's Challenge</h3>
            <p>Complete for bonus XP & keep your streak alive</p>
          </div>
          <ArrowRight size={20} className="hp-action-arrow" />
        </Link>

        <Link to="/battle" className="hp-action-card battle">
          <div className="hp-action-icon">⚔️</div>
          <div className="hp-action-body">
            <span className="hp-action-badge">Live</span>
            <h3>Quiz Battle</h3>
            <p>Challenge bots or friends in real-time battles</p>
          </div>
          <ArrowRight size={20} className="hp-action-arrow" />
        </Link>

        <Link to="/leaderboard" className="hp-action-card leaderboard">
          <div className="hp-action-icon">🏆</div>
          <div className="hp-action-body">
            <span className="hp-action-badge">Rankings</span>
            <h3>Leaderboard</h3>
            <p>See where you stand among all learners</p>
          </div>
          <ArrowRight size={20} className="hp-action-arrow" />
        </Link>
      </section>

      {/* ── CONTINUE WHERE YOU LEFT OFF ── */}
      {isAuthenticated && (continueData?.lastQuiz || continueSubject) && (
        <section className="hp-continue">
          {/* Last quiz you took — direct link */}
          {continueData?.lastQuiz && (
            <div
              className="hp-continue-card hp-continue-quiz"
              onClick={() => {
                const q = continueData.lastQuiz;
                // Find the subject slug
                const subjectSlug = (q.subject || '').toLowerCase().replace(/\s+/g, '-');
                navigate(`/quiz/${subjectSlug}/${q.id}`, {
                  state: { subjectName: q.subject, topicName: q.title }
                });
              }}
            >
              <div className="hp-continue-left">
                <Play size={18} className="hp-continue-play" />
                <div>
                  <span className="hp-continue-label">Last Quiz</span>
                  <h4 className="hp-continue-title">{continueData.lastQuiz.title}</h4>
                </div>
              </div>
              <div className="hp-continue-right">
                <div className="hp-continue-score">
                  <span className="hp-continue-score-val">{continueData.lastQuiz.score || 0}%</span>
                  <span className="hp-continue-score-sub">{continueData.lastQuiz.questionsCorrect}/{continueData.lastQuiz.questionsTotal}</span>
                </div>
                <div className="hp-continue-action">
                  {completedQuizIds.has(continueData.lastQuiz.id) ? 'Review' : 'Retake'}
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          )}

          {/* Next uncompleted subject/quiz — smart navigation */}
          {continueSubject && (
            <div
              className="hp-continue-card"
              onClick={() => {
                const nextQuiz = findNextQuiz(continueSubject);
                if (nextQuiz) {
                  startQuiz(continueSubject, nextQuiz);
                } else {
                  setExpandedSubject(expandedSubject === continueSubject.id ? null : continueSubject.id);
                }
              }}
            >
              <div className="hp-continue-left">
                <Sparkles size={18} className="hp-continue-spark" />
                <span className="hp-continue-label">Continue where you left off</span>
              </div>
              <div className="hp-continue-right">
                <div className={`hp-subj-icon ${continueSubject.color}`}>{continueSubject.icon}</div>
                <div>
                  <h4>{continueSubject.name}</h4>
                  <div className="hp-continue-progress">
                    <div className="hp-continue-bar">
                      <div className="hp-continue-bar-fill" style={{ width: `${Math.round((continueSubject.completedQuestions / (continueSubject.totalQuestions || 1)) * 100)}%` }} />
                    </div>
                    <span>{continueSubject.completedQuestions}/{continueSubject.totalQuestions}</span>
                  </div>
                </div>
                <ArrowRight size={16} />
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── MAIN CONTENT ── */}
      <section className="hp-main">
        <div className="hp-subjects-col">
          {/* Header + search */}
          <div className="hp-subjects-header">
            <h2><BookOpen size={20} /> Subjects</h2>
            <div className="hp-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Filter subjects or topics..."
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
              />
              {subjectFilter && (
                <button className="hp-search-clear" onClick={() => setSubjectFilter('')}><X size={14} /></button>
              )}
            </div>
          </div>

          {/* Subjects grid */}
          <div className="hp-subjects-grid">
            {sortedSubjects.map((subject) => {
              const isExpanded = expandedSubject === subject.id;
              const pct = subject.totalQuestions > 0
                ? Math.round((subject.completedQuestions || 0) / subject.totalQuestions * 100)
                : 0;

              return (
                <div
                  key={subject.id}
                  className={`hp-subject-card ${isExpanded ? 'expanded' : ''} ${subject.totalQuestions === 0 ? 'empty' : ''}`}
                >
                  <div
                    className="hp-subject-top"
                    onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                  >
                    <div className={`hp-subj-icon ${subject.color}`}>{subject.icon}</div>
                    <div className="hp-subject-info">
                      <h3>{subject.name}</h3>
                      <span className="hp-subject-meta">
                        {subject.totalQuestions} questions · {subject.topics?.length || 0} topics
                      </span>
                    </div>
                    {subject.totalQuestions > 0 && (
                      <div className="hp-subject-pct" title={`${pct}% complete`}>
                        <svg viewBox="0 0 36 36" className="hp-ring">
                          <path
                            className="hp-ring-bg"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="hp-ring-fill"
                            strokeDasharray={`${pct}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="hp-ring-text">{pct}%</span>
                      </div>
                    )}
                    {isExpanded
                      ? <ChevronDown size={18} className="hp-subject-chevron" />
                      : <ChevronRight size={18} className="hp-subject-chevron" />
                    }
                  </div>

                  {/* Expanded topics */}
                  {isExpanded && (
                    <div className="hp-topics-list">
                      {subject.topics?.length > 0 ? subject.topics.map((topic) => {
                        const topicCompleted = completedQuizIds.has(topic.id);
                        return (
                        <div key={topic.id} className={`hp-topic ${topicCompleted ? 'hp-topic-done' : ''}`}>
                          <div className="hp-topic-top">
                            <h4>
                              {topicCompleted && <CheckCircle size={14} className="hp-topic-check" />}
                              {topic.name}
                            </h4>
                            <span className={`hp-diff-badge ${(topic.difficulty || '').toLowerCase()}`}>
                              {topic.difficulty || 'Mixed'}
                            </span>
                          </div>
                          {topic.source && <span className="hp-topic-source">📚 {topic.source}</span>}
                          <div className="hp-topic-meta">
                            <span><Target size={13} /> {topic.questions} Qs</span>
                            <span><Timer size={13} /> ~{topic.estimatedTime}min</span>
                          </div>
                          <button
                            className={`hp-start-btn ${topicCompleted ? 'hp-start-btn-review' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (topicCompleted) {
                                navigate(`/quiz/${topic.id}/review`);
                              } else {
                                startQuiz(subject, topic);
                              }
                            }}
                          >
                            {topicCompleted ? <><Eye size={14} /> Review</> : <><Play size={14} /> Start Quiz</>}
                          </button>
                        </div>
                        );
                      }) : (
                        <div className="hp-topics-empty">
                          <BookOpen size={24} />
                          <p>No content available yet for {subject.name}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredSubjects.length === 0 && subjectFilter && (
            <div className="hp-no-results">
              <Search size={24} />
              <p>No subjects match &quot;{subjectFilter}&quot;</p>
              <button onClick={() => setSubjectFilter('')}>Clear filter</button>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div className="hp-sidebar">
          {/* Tip of the moment */}
          <div className="hp-tip-card">
            <div className="hp-tip-icon"><Brain size={18} /></div>
            <p className="hp-tip-text" key={tipIndex}>{TIPS[tipIndex]}</p>
          </div>

          {/* Achievements */}
          <div className="hp-sidebar-card">
            <div className="hp-sidebar-title">
              <Award size={18} className="text-yellow-500" />
              <h3>Recent Achievements</h3>
            </div>
            {recentAchievements.length > 0 ? recentAchievements.slice(0, 4).map((a) => (
              <div key={a.id} className="hp-ach-item">
                <span className="hp-ach-icon">{a.icon}</span>
                <div>
                  <span className="hp-ach-title">{a.title}</span>
                  <span className="hp-ach-time">{a.unlocked}</span>
                </div>
              </div>
            )) : (
              <div className="hp-sidebar-empty">
                <Medal size={20} />
                <p>Complete quizzes to earn badges!</p>
              </div>
            )}
            <Link to="/achievements" className="hp-sidebar-link">View all achievements →</Link>
          </div>

          {/* Streak card */}
          {isAuthenticated && (
            <div className="hp-streak-card">
              <Flame size={28} />
              <div className="hp-streak-num">{userStats.streak}</div>
              <div className="hp-streak-label">Day Streak</div>
              <div className="hp-streak-dots">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className={`hp-streak-dot ${i < (userStats.streak % 7) ? 'active' : ''}`}>{d}</div>
                ))}
              </div>
            </div>
          )}

          {/* Quick nav */}
          <div className="hp-sidebar-card">
            <div className="hp-sidebar-title">
              <Zap size={18} />
              <h3>Quick Actions</h3>
            </div>
            <div className="hp-quick-btns">
              <button onClick={() => navigate('/leaderboard')}><Trophy size={16} /> Leaderboard</button>
              <button onClick={() => navigate('/profile')}><User size={16} /> Profile</button>
              <button onClick={() => navigate('/achievements')}><Medal size={16} /> Achievements</button>
              <button onClick={() => navigate('/browse')}><Search size={16} /> Browse All</button>
            </div>
          </div>
        </div>
      </section>

      <style>{styles}</style>
    </div>
  );
};

export default HomePage;

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */
const styles = `
/* ── Loading ── */
.hp-loading {
  min-height: 80vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
  color: var(--text-secondary);
}
.hp-loading-brain { font-size: 48px; animation: hp-bounce 1s infinite; }
@keyframes hp-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

/* ── Page wrapper ── */
.hp { min-height: calc(100vh - 64px); padding-bottom: 100px; background: var(--bg-primary); }

/* ═══ HERO ═══ */
.hp-hero {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 32px 0 28px;
}
.hp-hero-inner {
  max-width: 1200px; margin: 0 auto; padding: 0 20px;
  display: flex; align-items: flex-start; gap: 32px; flex-wrap: wrap;
}
.hp-hero-left { flex: 1; min-width: 280px; }

.hp-greeting {
  font-size: 1.8rem; font-weight: 700; color: var(--text-primary);
  margin: 0 0 6px; line-height: 1.2;
}
.hp-wave { display: inline-block; animation: hp-wave 2s ease-in-out 1; transform-origin: 70% 70%; }
@keyframes hp-wave {
  0%{transform:rotate(0)} 10%{transform:rotate(14deg)} 20%{transform:rotate(-8deg)}
  30%{transform:rotate(14deg)} 40%{transform:rotate(-4deg)} 50%{transform:rotate(10deg)}
  60%{transform:rotate(0)} 100%{transform:rotate(0)}
}
.hp-subtitle { color: var(--text-secondary); margin: 0 0 20px; font-size: 0.95rem; }

/* Stats row */
.hp-stats-row { display: flex; gap: 16px; flex-wrap: wrap; }
.hp-stat {
  display: flex; align-items: center; gap: 10px; padding: 10px 16px;
  background: var(--bg-tertiary); border-radius: 12px; border: 1px solid var(--border-color);
  min-width: 130px;
}
.hp-stat-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.hp-stat-icon.fire { background: rgba(249,115,22,0.15); color: #f97316; }
.hp-stat-icon.accuracy { background: rgba(34,197,94,0.15); color: #22c55e; }
.hp-stat-icon.rank { background: rgba(234,179,8,0.15); color: #eab308; }
.hp-stat-icon.xp { background: rgba(99,102,241,0.15); color: #6366f1; }
.hp-stat-val { display: block; font-weight: 700; font-size: 1.1rem; color: var(--text-primary); line-height: 1.2; }
.hp-stat-label { display: block; font-size: 0.7rem; color: var(--text-tertiary); }

/* Level card */
.hp-level-card {
  display: flex; align-items: center; gap: 14px; padding: 16px 20px;
  background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 16px;
  cursor: pointer; transition: all 0.2s; min-width: 240px; flex-shrink: 0;
}
.hp-level-card:hover { border-color: var(--primary); transform: translateY(-1px); }
.hp-level-badge {
  width: 48px; height: 48px; border-radius: 14px;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: white; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1.3rem; flex-shrink: 0;
}
.hp-level-info { flex: 1; }
.hp-level-title { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); display: block; margin-bottom: 6px; }
.hp-level-bar { height: 6px; background: var(--bg-secondary); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
.hp-level-bar-fill {
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, var(--primary), #8b5cf6);
  transition: width 0.6s ease;
}
.hp-level-remaining { font-size: 0.7rem; color: var(--text-tertiary); }
.hp-level-arrow { color: var(--text-tertiary); flex-shrink: 0; }

/* ═══ ACTION CARDS ═══ */
.hp-actions {
  max-width: 1200px; margin: -20px auto 0; padding: 0 20px;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
  position: relative; z-index: 10;
}
.hp-action-card {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 20px; border-radius: 16px; text-decoration: none;
  color: white; transition: all 0.25s; position: relative; overflow: hidden;
}
.hp-action-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.hp-action-card.daily { background: linear-gradient(135deg, #dc2626, #991b1b); }
.hp-action-card.battle { background: linear-gradient(135deg, #1d4ed8, #1e3a8a); }
.hp-action-card.leaderboard { background: linear-gradient(135deg, #059669, #064e3b); }
.hp-action-icon { font-size: 2rem; flex-shrink: 0; opacity: 0.9; }
.hp-action-body { flex: 1; }
.hp-action-badge {
  display: inline-block; padding: 2px 8px; border-radius: 4px;
  background: rgba(255,255,255,0.25); font-size: 0.65rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
}
.hp-action-body h3 { margin: 0; font-size: 1.05rem; font-weight: 700; }
.hp-action-body p { margin: 2px 0 0; font-size: 0.78rem; opacity: 0.85; }
.hp-action-arrow { flex-shrink: 0; opacity: 0.7; transition: transform 0.2s; }
.hp-action-card:hover .hp-action-arrow { transform: translateX(4px); opacity: 1; }

/* ═══ CONTINUE CARD ═══ */
.hp-continue { max-width: 1200px; margin: 16px auto 0; padding: 0 20px; display: flex; flex-direction: column; gap: 10px; }
.hp-continue-card {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 14px; cursor: pointer; transition: all 0.2s; gap: 16px; flex-wrap: wrap;
}
.hp-continue-card:hover { border-color: var(--primary); }
.hp-continue-quiz {
  border-color: rgba(99,102,241,0.3);
  background: linear-gradient(135deg, var(--bg-secondary), rgba(99,102,241,0.04));
}
.hp-continue-quiz:hover { border-color: var(--primary); box-shadow: 0 4px 16px rgba(99,102,241,0.1); }
.hp-continue-left { display: flex; align-items: center; gap: 10px; }
.hp-continue-play {
  color: var(--primary); background: rgba(99,102,241,0.12);
  padding: 8px; border-radius: 10px; width: 34px; height: 34px; flex-shrink: 0;
}
.hp-continue-spark { color: #f59e0b; }
.hp-continue-label { font-size: 0.72rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; }
.hp-continue-title { margin: 2px 0 0; font-size: 0.95rem; font-weight: 600; color: var(--text-primary); }
.hp-continue-right { display: flex; align-items: center; gap: 12px; }
.hp-continue-right h4 { margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--text-primary); }
.hp-continue-score { display: flex; flex-direction: column; align-items: center; }
.hp-continue-score-val { font-size: 1.1rem; font-weight: 800; color: var(--primary); }
.hp-continue-score-sub { font-size: 0.68rem; color: var(--text-tertiary); }
.hp-continue-action {
  display: flex; align-items: center; gap: 4px; font-size: 0.82rem;
  font-weight: 600; color: var(--primary); white-space: nowrap;
}
.hp-continue-progress { display: flex; align-items: center; gap: 8px; }
.hp-continue-bar { width: 80px; height: 5px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden; }
.hp-continue-bar-fill { height: 100%; background: var(--primary); border-radius: 3px; }
.hp-continue-progress span { font-size: 0.75rem; color: var(--text-tertiary); }

/* ═══ MAIN LAYOUT ═══ */
.hp-main {
  max-width: 1200px; margin: 24px auto 0; padding: 0 20px;
  display: grid; grid-template-columns: 1fr 300px; gap: 24px;
}
.hp-subjects-col { min-width: 0; }

/* Subjects header + search */
.hp-subjects-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px; gap: 12px; flex-wrap: wrap;
}
.hp-subjects-header h2 {
  display: flex; align-items: center; gap: 8px;
  font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin: 0;
}
.hp-search {
  display: flex; align-items: center; gap: 8px; padding: 8px 14px;
  background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px;
  min-width: 200px; color: var(--text-tertiary);
}
.hp-search input {
  border: none; background: none; outline: none; flex: 1;
  font-size: 0.85rem; color: var(--text-primary);
}
.hp-search input::placeholder { color: var(--text-tertiary); }
.hp-search-clear {
  background: none; border: none; cursor: pointer; color: var(--text-tertiary);
  display: flex; align-items: center; padding: 0;
}

/* Subjects grid */
.hp-subjects-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px;
}

/* Subject card */
.hp-subject-card {
  background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 14px;
  overflow: hidden; transition: all 0.2s;
}
.hp-subject-card:hover { border-color: color-mix(in srgb, var(--border-color) 60%, var(--primary)); }
.hp-subject-card.expanded { border-color: var(--primary); }
.hp-subject-card.empty { opacity: 0.55; }

.hp-subject-top {
  display: flex; align-items: center; gap: 12px; padding: 16px; cursor: pointer;
}
.hp-subj-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; flex-shrink: 0; color: white;
}
.hp-subject-info { flex: 1; min-width: 0; }
.hp-subject-info h3 { margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--text-primary); }
.hp-subject-meta { font-size: 0.75rem; color: var(--text-tertiary); }

/* Ring progress */
.hp-subject-pct { position: relative; width: 40px; height: 40px; flex-shrink: 0; }
.hp-ring { width: 40px; height: 40px; transform: rotate(-90deg); }
.hp-ring-bg { fill: none; stroke: var(--bg-tertiary); stroke-width: 3; }
.hp-ring-fill { fill: none; stroke: var(--primary); stroke-width: 3; stroke-linecap: round; transition: stroke-dasharray 0.6s ease; }
.hp-ring-text {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-size: 0.6rem; font-weight: 700; color: var(--text-secondary);
}
.hp-subject-chevron { color: var(--text-tertiary); flex-shrink: 0; transition: transform 0.2s; }

/* Topics */
.hp-topics-list {
  padding: 0 16px 16px; display: flex; flex-direction: column; gap: 10px;
  border-top: 1px solid var(--border-color); padding-top: 12px;
  animation: hp-slideDown 0.2s ease;
}
@keyframes hp-slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

.hp-topic {
  padding: 14px; background: var(--bg-tertiary); border-radius: 10px;
  border: 1px solid var(--border-color);
}
.hp-topic-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.hp-topic-top h4 { margin: 0; font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
.hp-diff-badge {
  font-size: 0.65rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; text-transform: capitalize;
}
.hp-diff-badge.beginner, .hp-diff-badge.easy { background: rgba(34,197,94,0.15); color: #16a34a; }
.hp-diff-badge.intermediate, .hp-diff-badge.medium { background: rgba(234,179,8,0.15); color: #ca8a04; }
.hp-diff-badge.advanced, .hp-diff-badge.hard { background: rgba(239,68,68,0.15); color: #dc2626; }
.hp-diff-badge.mixed { background: rgba(99,102,241,0.15); color: #6366f1; }
.hp-topic-source { font-size: 0.75rem; color: var(--primary); display: block; margin-bottom: 6px; }
.hp-topic-meta { display: flex; gap: 16px; font-size: 0.78rem; color: var(--text-tertiary); margin-bottom: 10px; }
.hp-topic-meta span { display: flex; align-items: center; gap: 4px; }

.hp-start-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 9px; border-radius: 8px; border: none;
  background: var(--primary); color: white; font-weight: 600; font-size: 0.85rem;
  cursor: pointer; transition: all 0.2s;
}
.hp-start-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.hp-start-btn-review {
  background: var(--bg-tertiary); color: var(--text-secondary);
  border: 1px solid var(--border-color);
}
.hp-start-btn-review:hover { border-color: var(--primary); color: var(--text-primary); }
.hp-topic-done {
  border-color: rgba(34,197,94,0.25) !important;
  background: linear-gradient(135deg, var(--bg-tertiary), rgba(34,197,94,0.04));
}
.hp-topic-check { color: #22c55e; margin-right: 4px; vertical-align: -2px; }

.hp-topics-empty {
  text-align: center; padding: 24px; color: var(--text-tertiary);
}
.hp-topics-empty p { margin: 8px 0 0; font-size: 0.85rem; }

.hp-no-results {
  text-align: center; padding: 40px 20px; color: var(--text-tertiary);
}
.hp-no-results p { margin: 8px 0 12px; }
.hp-no-results button {
  background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px;
  padding: 8px 16px; cursor: pointer; color: var(--text-primary); font-size: 0.85rem;
}

/* ═══ SIDEBAR ═══ */
.hp-sidebar { display: flex; flex-direction: column; gap: 16px; }

/* Tip card */
.hp-tip-card {
  display: flex; gap: 12px; padding: 16px;
  background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08));
  border: 1px solid rgba(99,102,241,0.2); border-radius: 14px;
}
.hp-tip-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(99,102,241,0.15); color: var(--primary);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.hp-tip-text {
  font-size: 0.82rem; color: var(--text-secondary); margin: 0; line-height: 1.5;
  animation: hp-fadeIn 0.5s ease;
}
@keyframes hp-fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

/* Sidebar card */
.hp-sidebar-card {
  background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 14px;
  padding: 18px;
}
.hp-sidebar-title {
  display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
}
.hp-sidebar-title h3 { margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--text-primary); }

.hp-ach-item {
  display: flex; align-items: center; gap: 10px; padding: 9px 10px;
  background: var(--bg-tertiary); border-radius: 10px; margin-bottom: 8px;
}
.hp-ach-icon { font-size: 1.4rem; flex-shrink: 0; }
.hp-ach-title { display: block; font-size: 0.82rem; font-weight: 500; color: var(--text-primary); }
.hp-ach-time { display: block; font-size: 0.7rem; color: var(--text-tertiary); }

.hp-sidebar-empty {
  text-align: center; padding: 16px 0; color: var(--text-tertiary);
}
.hp-sidebar-empty p { margin: 6px 0 0; font-size: 0.8rem; }

.hp-sidebar-link {
  display: block; text-align: center; font-size: 0.82rem; font-weight: 500;
  color: var(--primary); margin-top: 10px; text-decoration: none;
}
.hp-sidebar-link:hover { text-decoration: underline; }

/* Streak card */
.hp-streak-card {
  text-align: center; padding: 24px 18px;
  background: linear-gradient(135deg, #f97316, #dc2626); border-radius: 14px;
  color: white;
}
.hp-streak-num { font-size: 2.5rem; font-weight: 800; line-height: 1; margin: 6px 0 2px; }
.hp-streak-label { font-size: 0.85rem; opacity: 0.9; margin-bottom: 14px; }
.hp-streak-dots { display: flex; justify-content: center; gap: 4px; }
.hp-streak-dot {
  width: 28px; height: 28px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: 600; background: rgba(255,255,255,0.2);
}
.hp-streak-dot.active { background: white; color: #ea580c; }

/* Quick action buttons */
.hp-quick-btns { display: flex; flex-direction: column; gap: 6px; }
.hp-quick-btns button {
  display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 14px;
  background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 10px;
  cursor: pointer; font-size: 0.85rem; font-weight: 500; color: var(--text-primary);
  transition: all 0.15s;
}
.hp-quick-btns button:hover { border-color: var(--primary); background: rgba(99,102,241,0.06); }

/* ═══ RESPONSIVE ═══ */
@media (max-width: 900px) {
  .hp-main { grid-template-columns: 1fr; }
  .hp-sidebar { order: -1; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .hp-sidebar > .hp-streak-card { grid-column: 1 / -1; }
  .hp-actions { grid-template-columns: 1fr; }
  .hp-hero-inner { flex-direction: column; }
  .hp-level-card { width: 100%; }
  .hp-subjects-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .hp { padding-bottom: 120px; }
  .hp-hero { padding: 20px 0; }
  .hp-greeting { font-size: 1.4rem; }
  .hp-stats-row { gap: 8px; }
  .hp-stat { min-width: 0; flex: 1; padding: 8px 10px; }
  .hp-stat-val { font-size: 0.95rem; }
  .hp-streak-dots { gap: 2px; }
  .hp-streak-dot { width: 24px; height: 24px; font-size: 0.6rem; }
  .hp-sidebar { grid-template-columns: 1fr; }
  .hp-action-card { padding: 14px 16px; }
  .hp-action-body h3 { font-size: 0.95rem; }
  .hp-action-body p { font-size: 0.72rem; }
}
`;
