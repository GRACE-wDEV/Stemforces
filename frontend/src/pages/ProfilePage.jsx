import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { getStudyRecommendations } from "../api/ai";
import api from "../api/axios";
import LaTeXRenderer from "../components/common/LaTeXRenderer";
import { calculateLevel, getLevelProgress, getLevelTitle, getLevelColor, formatXP } from "../utils/levelUtils";
import { useToast } from "../stores/toastStore";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid, Cell, PieChart, Pie
} from "recharts";
import {
  User, LogOut, Edit3, Save, X, Flame, Zap, Target, BookOpen,
  Trophy, Clock, TrendingUp, Award, Brain, Key, ChevronRight,
  Calendar, BarChart3, Star, Shield, Crown, Medal, CheckCircle
} from "lucide-react";

/* ─── Constants ─── */
const SUBJECT_COLORS = {
  Math: "#6366f1", Arabic: "#f59e0b", Physics: "#3b82f6",
  Chemistry: "#10b981", English: "#ef4444", Deutsch: "#8b5cf6",
  "Earth Science": "#06b6d4", French: "#ec4899", Biology: "#22c55e",
  default: "#64748b"
};

const getSubjectColor = (name) => SUBJECT_COLORS[name] || SUBJECT_COLORS.default;

/* ─── Custom tooltip ─── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="pp-tooltip">
      <p className="pp-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="pp-tooltip-val" style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // API Key state
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [validatingKey, setValidatingKey] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const res = await api.get("/auth/me/api-key/status");
        setHasApiKey(res.data.hasApiKey);
      } catch (err) {
        console.error("Failed to check API key status", err);
      }
    };
    if (user) checkApiKey();
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, badgesRes] = await Promise.allSettled([
          api.get("/auth/me/stats"),
          api.get("/achievements/badges"),
        ]);
        const sd = statsRes.status === "fulfilled" ? statsRes.value.data?.data : null;
        const bd = badgesRes.status === "fulfilled" ? badgesRes.value.data?.data : null;

        setStats({
          streak: { currentStreak: sd?.currentStreak || 0, longestStreak: sd?.longestStreak || 0 },
          badges: bd?.earned || [],
          xp: sd?.totalXP || user?.score || 0,
          questionsAnswered: sd?.totalQuestions || 0,
          correctAnswers: sd?.correctAnswers || 0,
          accuracy: sd?.accuracy || 0,
          quizzesCompleted: sd?.quizzesCompleted || 0,
          totalTimeSpent: sd?.totalTimeSpent || 0,
          subjectProgress: sd?.subjectProgress || [],
          level: sd?.level || 1,
          dailyActivity: sd?.dailyActivity || [],
          recentQuizzes: sd?.recentQuizzes || [],
          memberSince: sd?.memberSince,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats({
          streak: { currentStreak: 0, longestStreak: 0 }, badges: [], xp: 0,
          questionsAnswered: 0, correctAnswers: 0, accuracy: 0, quizzesCompleted: 0,
          totalTimeSpent: 0, subjectProgress: [], level: 1, dailyActivity: [],
          recentQuizzes: [], memberSince: null,
        });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  // Fetch AI recommendations
  const fetchRecommendations = async () => {
    if (recommendations || loadingRecs) return;
    setLoadingRecs(true);
    try {
      const performanceData = {
        subjects: ["Math", "Physics", "Chemistry", "Biology"],
        accuracy: stats?.accuracy || 0,
        questionsAnswered: stats?.questionsAnswered || 0,
        weakTopics: user?.weakTopics || [],
        strongTopics: user?.strongTopics || [],
      };
      const response = await getStudyRecommendations(performanceData);
      if (response.success) setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "recommendations") fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const res = await api.get("/auth/me/activities");
        setActivities(res.data.activities || []);
      } catch (err) {
        console.error("Failed to fetch activities", err);
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };
    if (activeTab === "overview") fetchActivities();
  }, [activeTab]);

  /* ─── Computed ─── */
  const level = calculateLevel(stats?.xp || user?.score || 0);
  const levelProgress = getLevelProgress(stats?.xp || user?.score || 0);
  const levelTitle = getLevelTitle(level);
  const levelColor = getLevelColor(level);

  // Daily activity chart data (last 14 days, padded)
  const activityChartData = useMemo(() => {
    if (!stats?.dailyActivity) return [];
    const map = {};
    stats.dailyActivity.forEach((d) => {
      const key = new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" });
      map[key] = { date: key, questions: d.questions, xp: d.xp };
    });
    const result = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en", { month: "short", day: "numeric" });
      result.push(map[key] || { date: key, questions: 0, xp: 0 });
    }
    return result;
  }, [stats?.dailyActivity]);

  // Quiz score trend data
  const scoreTrendData = useMemo(() => {
    if (!stats?.recentQuizzes?.length) return [];
    return stats.recentQuizzes.map((q, i) => ({
      name: `#${i + 1}`,
      score: q.score,
      subject: q.subject,
    }));
  }, [stats?.recentQuizzes]);

  // Radar chart for subject mastery
  const radarData = useMemo(() => {
    if (!stats?.subjectProgress?.length) return [];
    return stats.subjectProgress
      .filter((s) => s.questions_attempted > 0)
      .map((s) => ({
        subject: s.subject?.length > 8 ? s.subject.slice(0, 7) + "…" : s.subject,
        fullName: s.subject,
        accuracy: s.questions_correct && s.questions_attempted
          ? Math.round((s.questions_correct / s.questions_attempted) * 100)
          : 0,
        questions: s.questions_attempted,
      }));
  }, [stats?.subjectProgress]);

  // Subject pie data
  const subjectPieData = useMemo(() => {
    if (!stats?.subjectProgress?.length) return [];
    return stats.subjectProgress
      .filter((s) => s.questions_attempted > 0)
      .sort((a, b) => b.questions_attempted - a.questions_attempted)
      .map((s) => ({
        name: s.subject,
        value: s.questions_attempted,
        color: getSubjectColor(s.subject),
      }));
  }, [stats?.subjectProgress]);

  // Time calculation
  const totalHours = Math.round((stats?.totalTimeSpent || 0) / 60);
  const memberDays = stats?.memberSince
    ? Math.max(1, Math.ceil((Date.now() - new Date(stats.memberSince).getTime()) / 86400000))
    : 0;

  if (!user) {
    return (
      <div className="pp-center">
        <div className="pp-card" style={{ textAlign: "center", maxWidth: 400 }}>
          <User size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
          <h3>Please Login</h3>
          <p className="pp-muted">You need to be logged in to view your profile.</p>
          <button className="pp-btn pp-btn-primary" onClick={() => navigate("/login")} style={{ marginTop: 16 }}>
            Go to Login
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      const res = await api.put("/auth/me", { name: editedName });
      useAuthStore.getState().updateProfile({ name: res.data.name });
      setIsEditing(false);
      success("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      showError("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) { showError("Please enter an API key"); return; }
    setSavingApiKey(true);
    setValidatingKey(true);
    try {
      const validateRes = await api.post("/ai/validate-key", { apiKey: apiKeyInput });
      if (!validateRes.data.success) {
        showError(validateRes.data.message || "Invalid API key");
        setValidatingKey(false); setSavingApiKey(false); return;
      }
      setValidatingKey(false);
      await api.put("/auth/me/api-key", { apiKey: apiKeyInput });
      setHasApiKey(true); setShowApiKeyInput(false); setApiKeyInput("");
      success("Gemini API key saved! AI features are now enabled.");
    } catch (err) {
      console.error("Failed to save API key", err);
      showError("Failed to save API key.");
    } finally {
      setSavingApiKey(false); setValidatingKey(false);
    }
  };

  const handleRemoveApiKey = async () => {
    try {
      await api.put("/auth/me/api-key", { apiKey: null });
      setHasApiKey(false);
      success("API key removed");
    } catch {
      showError("Failed to remove API key");
    }
  };

  if (loading) {
    return (
      <div className="pp-center">
        <div className="pp-spinner" /><p className="pp-muted">Loading your profile...</p>
        <style>{styles}</style>
      </div>
    );
  }

  const TABS = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
    { id: "subjects", label: "Subjects", icon: <BookOpen size={16} /> },
    { id: "achievements", label: "Achievements", icon: <Trophy size={16} /> },
    { id: "recommendations", label: "AI Insights", icon: <Brain size={16} /> },
    { id: "settings", label: "Settings", icon: <Shield size={16} /> },
  ];

  return (
    <div className="pp">
      {/* ═══ HERO HEADER ═══ */}
      <section className="pp-hero">
        <div className="pp-hero-bg" />
        <div className="pp-hero-content">
          {/* Avatar */}
          <div className="pp-avatar-wrap">
            <div className="pp-avatar" style={{ borderColor: levelColor }}>
              <span>{user.name?.charAt(0)?.toUpperCase() || "?"}</span>
            </div>
            <div className="pp-level-pip" style={{ background: levelColor }}>{level}</div>
          </div>

          {/* Info */}
          <div className="pp-hero-info">
            {isEditing ? (
              <div className="pp-edit-row">
                <input
                  type="text" value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="pp-name-input"
                  autoFocus
                />
                <button className="pp-icon-btn save" onClick={handleSaveEdit} disabled={isSaving} title="Save">
                  <Save size={16} />
                </button>
                <button className="pp-icon-btn cancel" onClick={() => setIsEditing(false)} title="Cancel">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="pp-name-row">
                <h1 className="pp-name">{user.name}</h1>
                <button className="pp-icon-btn edit" onClick={() => setIsEditing(true)} title="Edit name">
                  <Edit3 size={14} />
                </button>
              </div>
            )}
            <p className="pp-email">{user.email}</p>
            <div className="pp-title-row">
              <span className="pp-title-badge" style={{ background: `${levelColor}22`, color: levelColor, borderColor: `${levelColor}44` }}>
                <Crown size={12} /> {levelTitle}
              </span>
              {memberDays > 0 && (
                <span className="pp-member-since">
                  <Calendar size={12} /> Member for {memberDays > 365 ? `${Math.floor(memberDays / 365)}y` : `${memberDays}d`}
                </span>
              )}
            </div>

            {/* XP Bar */}
            <div className="pp-xp-section">
              <div className="pp-xp-labels">
                <span>Level {level}</span>
                <span>{levelProgress.progress}/{levelProgress.required} XP</span>
              </div>
              <div className="pp-xp-bar">
                <div className="pp-xp-fill" style={{ width: `${levelProgress.percentage}%`, background: levelColor }} />
              </div>
              <span className="pp-xp-until">{levelProgress.required - levelProgress.progress} XP to Level {level + 1}</span>
            </div>
          </div>

          {/* Logout */}
          <button className="pp-logout" onClick={handleLogout}><LogOut size={16} /> Log Out</button>
        </div>
      </section>

      {/* ═══ STAT CARDS ═══ */}
      <section className="pp-stats-row">
        <div className="pp-stat-card fire">
          <Flame size={22} />
          <div className="pp-stat-val">{stats?.streak?.currentStreak || 0}</div>
          <div className="pp-stat-sub">Day Streak</div>
          <div className="pp-stat-extra">Best: {stats?.streak?.longestStreak || 0}</div>
        </div>
        <div className="pp-stat-card purple">
          <Zap size={22} />
          <div className="pp-stat-val">{formatXP(stats?.xp || 0)}</div>
          <div className="pp-stat-sub">Total XP</div>
          <div className="pp-stat-extra">Lvl {level}</div>
        </div>
        <div className="pp-stat-card blue">
          <BookOpen size={22} />
          <div className="pp-stat-val">{stats?.questionsAnswered?.toLocaleString() || 0}</div>
          <div className="pp-stat-sub">Questions</div>
          <div className="pp-stat-extra">{stats?.correctAnswers?.toLocaleString() || 0} correct</div>
        </div>
        <div className="pp-stat-card green">
          <Target size={22} />
          <div className="pp-stat-val">{stats?.accuracy || 0}%</div>
          <div className="pp-stat-sub">Accuracy</div>
          <div className="pp-stat-extra">{stats?.quizzesCompleted || 0} quizzes</div>
        </div>
        <div className="pp-stat-card teal">
          <Clock size={22} />
          <div className="pp-stat-val">{totalHours}h</div>
          <div className="pp-stat-sub">Study Time</div>
          <div className="pp-stat-extra">{stats?.totalTimeSpent || 0}m total</div>
        </div>
      </section>

      {/* ═══ TABS ═══ */}
      <nav className="pp-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`pp-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      {/* ═══ TAB CONTENT ═══ */}
      <section className="pp-content">
        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="pp-overview">
            {/* Activity Graph */}
            <div className="pp-card pp-chart-card">
              <div className="pp-card-header">
                <TrendingUp size={18} /> <h3>Daily Activity (Last 14 Days)</h3>
              </div>
              {activityChartData.some((d) => d.questions > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={activityChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gXP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="xp" name="XP" stroke="#6366f1" fill="url(#gXP)" strokeWidth={2} />
                    <Area type="monotone" dataKey="questions" name="Questions" stroke="#22c55e" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="pp-empty-chart">
                  <BarChart3 size={32} />
                  <p>Complete quizzes to see your activity graph</p>
                </div>
              )}
            </div>

            {/* Quiz Score Trend */}
            <div className="pp-card pp-chart-card">
              <div className="pp-card-header">
                <Star size={18} /> <h3>Quiz Score Trend</h3>
              </div>
              {scoreTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={scoreTrendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="score" name="Score" radius={[4, 4, 0, 0]}>
                      {scoreTrendData.map((entry, i) => (
                        <Cell key={i} fill={getSubjectColor(entry.subject)} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="pp-empty-chart">
                  <TrendingUp size={32} />
                  <p>Take quizzes to see your score trend</p>
                </div>
              )}
            </div>

            {/* Recent Activity Feed */}
            <div className="pp-card">
              <div className="pp-card-header">
                <Clock size={18} /> <h3>Recent Activity</h3>
              </div>
              {loadingActivities ? (
                <div className="pp-loading-sm"><div className="pp-spinner-sm" /> Loading...</div>
              ) : activities.length === 0 ? (
                <div className="pp-empty-sm"><BookOpen size={24} /><p>No recent activity. Take a quiz!</p></div>
              ) : (
                <div className="pp-activity-list">
                  {activities.slice(0, 10).map((act, idx) => (
                    <div key={idx} className="pp-activity-item">
                      <span className="pp-act-icon">
                        {act.type === "achievement" ? (act.icon || "🏆") : "📚"}
                      </span>
                      <div className="pp-act-body">
                        <span className="pp-act-title">{act.title}</span>
                        <span className="pp-act-sub">{act.subtitle}{act.xp ? ` · +${act.xp} XP` : ""}</span>
                      </div>
                      <span className="pp-act-time">
                        {new Date(act.time).toLocaleDateString("en", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SUBJECTS ── */}
        {activeTab === "subjects" && (
          <div className="pp-subjects">
            {/* Radar + Pie row */}
            <div className="pp-charts-row">
              <div className="pp-card pp-chart-card">
                <div className="pp-card-header">
                  <Target size={18} /> <h3>Subject Mastery</h3>
                </div>
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid stroke="var(--border-color)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "var(--text-tertiary)", fontSize: 10 }} />
                      <Radar dataKey="accuracy" name="Accuracy %" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="pp-empty-chart"><Target size={32} /><p>Study subjects to see your mastery radar</p></div>
                )}
              </div>

              <div className="pp-card pp-chart-card">
                <div className="pp-card-header">
                  <BarChart3 size={18} /> <h3>Question Distribution</h3>
                </div>
                {subjectPieData.length > 0 ? (
                  <div className="pp-pie-wrap">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={subjectPieData} dataKey="value" nameKey="name"
                          cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                          stroke="var(--bg-primary)" strokeWidth={3}
                        >
                          {subjectPieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pp-pie-legend">
                      {subjectPieData.map((s, i) => (
                        <div key={i} className="pp-pie-leg-item">
                          <span className="pp-pie-dot" style={{ background: s.color }} />
                          <span>{s.name}</span>
                          <span className="pp-muted">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pp-empty-chart"><BookOpen size={32} /><p>No subject data yet</p></div>
                )}
              </div>
            </div>

            {/* Subject Detail Cards */}
            <div className="pp-subject-grid">
              {(stats?.subjectProgress || [])
                .filter((s) => s.questions_attempted > 0)
                .sort((a, b) => b.questions_attempted - a.questions_attempted)
                .map((s, i) => {
                  const acc = s.questions_correct && s.questions_attempted
                    ? Math.round((s.questions_correct / s.questions_attempted) * 100) : 0;
                  const color = getSubjectColor(s.subject);
                  return (
                    <div key={i} className="pp-subj-card" style={{ borderTopColor: color }}>
                      <div className="pp-subj-head">
                        <h4 style={{ color }}>{s.subject}</h4>
                        <span className="pp-subj-score" style={{ background: `${color}18`, color }}>{acc}%</span>
                      </div>
                      <div className="pp-subj-bar-wrap">
                        <div className="pp-subj-bar">
                          <div className="pp-subj-bar-fill" style={{ width: `${acc}%`, background: color }} />
                        </div>
                      </div>
                      <div className="pp-subj-stats">
                        <span><BookOpen size={13} /> {s.questions_attempted} Qs</span>
                        <span><CheckCircle size={13} /> {s.questions_correct} correct</span>
                        <span><Trophy size={13} /> Best: {s.best_score || 0}%</span>
                      </div>
                      {s.quizzes_completed > 0 && (
                        <div className="pp-subj-quizzes">
                          {s.quizzes_completed} quiz{s.quizzes_completed > 1 ? "zes" : ""} completed
                        </div>
                      )}
                    </div>
                  );
                })}
              {(stats?.subjectProgress || []).filter((s) => s.questions_attempted > 0).length === 0 && (
                <div className="pp-card pp-empty-sm" style={{ gridColumn: "1 / -1" }}>
                  <BookOpen size={32} /><p>Start studying to see per-subject analytics!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ACHIEVEMENTS ── */}
        {activeTab === "achievements" && (
          <div className="pp-card">
            <div className="pp-card-header">
              <Trophy size={18} /> <h3>Your Badges</h3>
            </div>
            {stats?.badges?.length > 0 ? (
              <div className="pp-badges-grid">
                {stats.badges.map((badge, idx) => (
                  <div key={idx} className="pp-badge-card">
                    <span className="pp-badge-icon">{badge.icon || "🏅"}</span>
                    <span className="pp-badge-name">{badge.name}</span>
                    <span className="pp-muted">{badge.description}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pp-empty-sm" style={{ padding: "40px 0" }}>
                <Medal size={40} />
                <p>Keep learning to earn achievements!</p>
              </div>
            )}
          </div>
        )}

        {/* ── AI RECOMMENDATIONS ── */}
        {activeTab === "recommendations" && (
          <div className="pp-card">
            <div className="pp-card-header">
              <Brain size={18} /> <h3>AI Study Insights</h3>
            </div>
            {!hasApiKey ? (
              <div className="pp-empty-sm" style={{ padding: "40px 0" }}>
                <Key size={32} />
                <p>Add your Gemini API key in Settings to unlock AI insights!</p>
                <button className="pp-btn pp-btn-primary" onClick={() => setActiveTab("settings")} style={{ marginTop: 12 }}>
                  Go to Settings
                </button>
              </div>
            ) : loadingRecs ? (
              <div className="pp-loading-sm"><div className="pp-spinner-sm" /> AI is analyzing your performance...</div>
            ) : recommendations ? (
              <div className="pp-recs-content"><LaTeXRenderer content={recommendations} /></div>
            ) : (
              <div className="pp-empty-sm" style={{ padding: "40px 0" }}>
                <Brain size={32} />
                <button className="pp-btn pp-btn-primary" onClick={fetchRecommendations} style={{ marginTop: 12 }}>
                  Get Personalized Recommendations
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === "settings" && (
          <div className="pp-card">
            <div className="pp-card-header">
              <Shield size={18} /> <h3>Settings</h3>
            </div>
            <div className="pp-settings-section">
              <div className="pp-settings-row">
                <div className="pp-settings-icon"><Brain size={20} /></div>
                <div>
                  <h4>Gemini API Key</h4>
                  <p className="pp-muted">Enable AI features with your free Google Gemini API key</p>
                </div>
              </div>

              {hasApiKey && !showApiKeyInput ? (
                <div className="pp-api-configured">
                  <div className="pp-api-badge"><CheckCircle size={16} /> API Key Configured</div>
                  <div className="pp-api-btns">
                    <button className="pp-btn pp-btn-secondary" onClick={() => setShowApiKeyInput(true)}>Update Key</button>
                    <button className="pp-btn pp-btn-danger" onClick={handleRemoveApiKey}>Remove</button>
                  </div>
                </div>
              ) : (
                <>
                  {!showApiKeyInput && !hasApiKey && (
                    <div className="pp-api-info">
                      <div className="pp-info-box">
                        <p><strong>Get your FREE API key:</strong></p>
                        <ol>
                          <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
                          <li>Sign in with your Google account</li>
                          <li>Click "Create API Key"</li>
                          <li>Copy and paste it below</li>
                        </ol>
                      </div>
                      <button className="pp-btn pp-btn-primary" onClick={() => setShowApiKeyInput(true)} style={{ marginTop: 12 }}>Add API Key</button>
                    </div>
                  )}
                  {showApiKeyInput && (
                    <div className="pp-api-form">
                      <input
                        type="password" value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Paste your Gemini API key here..."
                        className="pp-input"
                      />
                      <div className="pp-api-btns">
                        <button className="pp-btn pp-btn-primary" onClick={handleSaveApiKey} disabled={savingApiKey || !apiKeyInput.trim()}>
                          {validatingKey ? "Validating..." : savingApiKey ? "Saving..." : "Save Key"}
                        </button>
                        <button className="pp-btn pp-btn-secondary" onClick={() => { setShowApiKeyInput(false); setApiKeyInput(""); }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </section>

      <style>{styles}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */
const styles = `
/* ── Base ── */
.pp { min-height: calc(100vh - 64px); padding-bottom: 100px; background: var(--bg-primary); }
.pp-center { min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
.pp-muted { color: var(--text-tertiary); font-size: 0.82rem; }

/* ── Spinner ── */
.pp-spinner { width: 40px; height: 40px; border: 3px solid var(--border-color); border-top-color: var(--primary); border-radius: 50%; animation: pp-spin 0.8s linear infinite; }
.pp-spinner-sm { width: 20px; height: 20px; border: 2px solid var(--border-color); border-top-color: var(--primary); border-radius: 50%; animation: pp-spin 0.8s linear infinite; }
@keyframes pp-spin { to { transform: rotate(360deg); } }

/* ═══ HERO ═══ */
.pp-hero {
  position: relative; overflow: hidden;
  background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);
}
.pp-hero-bg {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 50%, transparent 100%);
}
.pp-hero-content {
  position: relative; max-width: 1000px; margin: 0 auto;
  padding: 32px 24px; display: flex; align-items: flex-start; gap: 24px; flex-wrap: wrap;
}

/* Avatar */
.pp-avatar-wrap { position: relative; flex-shrink: 0; }
.pp-avatar {
  width: 88px; height: 88px; border-radius: 22px; border: 3px solid;
  background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center;
  font-size: 2.2rem; font-weight: 800; color: var(--text-primary);
}
.pp-level-pip {
  position: absolute; bottom: -4px; right: -4px;
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 800; color: white;
  border: 2px solid var(--bg-secondary);
}

/* Info */
.pp-hero-info { flex: 1; min-width: 200px; }
.pp-name-row { display: flex; align-items: center; gap: 8px; }
.pp-name { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
.pp-email { margin: 2px 0 0; color: var(--text-tertiary); font-size: 0.85rem; }
.pp-edit-row { display: flex; align-items: center; gap: 8px; }
.pp-name-input {
  background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px;
  padding: 8px 14px; font-size: 1.1rem; font-weight: 600; color: var(--text-primary);
  outline: none; width: 260px;
}
.pp-name-input:focus { border-color: var(--primary); }

/* Icon buttons */
.pp-icon-btn {
  width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--border-color);
  background: var(--bg-tertiary); cursor: pointer; display: flex; align-items: center;
  justify-content: center; color: var(--text-secondary); transition: all 0.15s;
}
.pp-icon-btn:hover { border-color: var(--primary); color: var(--primary); }
.pp-icon-btn.save { border-color: #22c55e; color: #22c55e; }
.pp-icon-btn.cancel { border-color: #ef4444; color: #ef4444; }

/* Title badges */
.pp-title-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
.pp-title-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 6px; font-size: 0.72rem;
  font-weight: 600; border: 1px solid;
}
.pp-member-since { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--text-tertiary); }

/* XP bar */
.pp-xp-section { margin-top: 14px; max-width: 340px; }
.pp-xp-labels { display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-tertiary); margin-bottom: 4px; }
.pp-xp-bar { height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; }
.pp-xp-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
.pp-xp-until { font-size: 0.68rem; color: var(--text-tertiary); margin-top: 3px; display: block; }

/* Logout */
.pp-logout {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  background: transparent; border: 1px solid rgba(239,68,68,0.3); border-radius: 10px;
  color: #ef4444; font-weight: 500; font-size: 0.85rem; cursor: pointer; transition: all 0.15s;
  flex-shrink: 0;
}
.pp-logout:hover { background: rgba(239,68,68,0.08); border-color: #ef4444; }

/* ═══ STAT CARDS ═══ */
.pp-stats-row {
  max-width: 1000px; margin: -16px auto 0; padding: 0 24px; position: relative; z-index: 10;
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
}
.pp-stat-card {
  background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 14px;
  padding: 16px; text-align: center; transition: all 0.2s; position: relative; overflow: hidden;
}
.pp-stat-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
}
.pp-stat-card.fire::before { background: linear-gradient(90deg, #f97316, #ef4444); }
.pp-stat-card.purple::before { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
.pp-stat-card.blue::before { background: linear-gradient(90deg, #3b82f6, #06b6d4); }
.pp-stat-card.green::before { background: linear-gradient(90deg, #22c55e, #10b981); }
.pp-stat-card.teal::before { background: linear-gradient(90deg, #14b8a6, #06b6d4); }
.pp-stat-card:hover { transform: translateY(-2px); border-color: var(--primary); }
.pp-stat-card svg { color: var(--text-tertiary); margin-bottom: 4px; }
.pp-stat-val { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); line-height: 1.2; }
.pp-stat-sub { font-size: 0.72rem; color: var(--text-tertiary); margin-top: 2px; }
.pp-stat-extra { font-size: 0.65rem; color: var(--text-tertiary); opacity: 0.7; margin-top: 4px; }

/* ═══ TABS ═══ */
.pp-tabs {
  max-width: 1000px; margin: 24px auto 0; padding: 0 24px;
  display: flex; gap: 4px; overflow-x: auto;
  border-bottom: 1px solid var(--border-color);
}
.pp-tab {
  display: flex; align-items: center; gap: 6px; padding: 10px 16px;
  background: none; border: none; border-bottom: 2px solid transparent;
  color: var(--text-tertiary); font-weight: 500; font-size: 0.85rem;
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.pp-tab:hover { color: var(--text-primary); }
.pp-tab.active { color: var(--primary); border-bottom-color: var(--primary); }

/* ═══ CONTENT ═══ */
.pp-content { max-width: 1000px; margin: 20px auto 0; padding: 0 24px; }

/* Card */
.pp-card {
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 14px; padding: 20px; margin-bottom: 16px;
}
.pp-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.pp-card-header h3 { margin: 0; font-size: 1rem; font-weight: 600; color: var(--text-primary); }
.pp-card-header svg { color: var(--text-tertiary); }

.pp-chart-card { padding: 20px 16px; }

/* Tooltip */
.pp-tooltip {
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 10px; padding: 10px 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.pp-tooltip-label { margin: 0 0 4px; font-size: 0.75rem; color: var(--text-tertiary); }
.pp-tooltip-val { margin: 0; font-size: 0.82rem; }

/* Empty / loading */
.pp-empty-chart { text-align: center; padding: 40px 20px; color: var(--text-tertiary); }
.pp-empty-chart svg { opacity: 0.4; margin-bottom: 8px; }
.pp-empty-chart p { margin: 0; font-size: 0.85rem; }
.pp-empty-sm { text-align: center; padding: 20px; color: var(--text-tertiary); }
.pp-empty-sm svg { opacity: 0.4; margin-bottom: 8px; }
.pp-empty-sm p { margin: 0; font-size: 0.85rem; }
.pp-loading-sm { display: flex; align-items: center; gap: 10px; padding: 20px; color: var(--text-tertiary); font-size: 0.85rem; }

/* ═══ OVERVIEW ═══ */
.pp-overview { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.pp-overview > .pp-card:last-child { grid-column: 1 / -1; }

/* Activity feed */
.pp-activity-list { display: flex; flex-direction: column; gap: 6px; }
.pp-activity-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 10px; background: var(--bg-tertiary);
}
.pp-act-icon { font-size: 1.2rem; flex-shrink: 0; }
.pp-act-body { flex: 1; min-width: 0; }
.pp-act-title { display: block; font-size: 0.85rem; font-weight: 500; color: var(--text-primary); }
.pp-act-sub { display: block; font-size: 0.72rem; color: var(--text-tertiary); }
.pp-act-time { font-size: 0.7rem; color: var(--text-tertiary); flex-shrink: 0; }

/* ═══ SUBJECTS TAB ═══ */
.pp-charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }

.pp-pie-wrap { display: flex; flex-direction: column; align-items: center; }
.pp-pie-legend { display: flex; flex-wrap: wrap; gap: 8px 16px; justify-content: center; padding-top: 4px; }
.pp-pie-leg-item { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--text-secondary); }
.pp-pie-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }

.pp-subject-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;
}
.pp-subj-card {
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-top: 3px solid; border-radius: 12px; padding: 16px;
}
.pp-subj-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.pp-subj-head h4 { margin: 0; font-size: 0.95rem; font-weight: 600; }
.pp-subj-score {
  font-size: 0.82rem; font-weight: 700; padding: 3px 10px; border-radius: 6px;
}
.pp-subj-bar-wrap { margin-bottom: 10px; }
.pp-subj-bar { height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden; }
.pp-subj-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
.pp-subj-stats { display: flex; gap: 12px; font-size: 0.75rem; color: var(--text-tertiary); flex-wrap: wrap; }
.pp-subj-stats span { display: flex; align-items: center; gap: 3px; }
.pp-subj-quizzes { margin-top: 8px; font-size: 0.72rem; color: var(--text-tertiary); }

/* ═══ ACHIEVEMENTS ═══ */
.pp-badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.pp-badge-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 16px; background: var(--bg-tertiary); border-radius: 12px;
  text-align: center;
}
.pp-badge-icon { font-size: 2rem; }
.pp-badge-name { font-weight: 600; font-size: 0.82rem; color: var(--text-primary); }

/* ═══ AI RECS ═══ */
.pp-recs-content { line-height: 1.7; font-size: 0.92rem; color: var(--text-secondary); }

/* ═══ SETTINGS ═══ */
.pp-settings-section { padding: 4px 0; }
.pp-settings-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.pp-settings-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(99,102,241,0.1); color: var(--primary);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.pp-settings-row h4 { margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--text-primary); }
.pp-settings-row p { margin: 4px 0 0; }

.pp-api-configured { margin-top: 4px; }
.pp-api-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; background: rgba(34,197,94,0.1); color: #22c55e;
  border-radius: 8px; font-size: 0.82rem; font-weight: 600;
}
.pp-api-btns { display: flex; gap: 8px; margin-top: 12px; }

.pp-api-info { margin-top: 4px; }
.pp-info-box {
  background: var(--bg-tertiary); border: 1px solid var(--border-color);
  border-radius: 10px; padding: 16px; font-size: 0.85rem; color: var(--text-secondary);
}
.pp-info-box ol { margin: 10px 0; padding-left: 20px; }
.pp-info-box li { margin-bottom: 6px; }
.pp-info-box a { color: var(--primary); }

.pp-api-form { margin-top: 8px; }
.pp-input {
  width: 100%; padding: 10px 14px; background: var(--bg-tertiary);
  border: 1px solid var(--border-color); border-radius: 10px; font-size: 0.9rem;
  color: var(--text-primary); outline: none; margin-bottom: 10px; box-sizing: border-box;
}
.pp-input:focus { border-color: var(--primary); }

/* Buttons */
.pp-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px 18px; border-radius: 10px; font-weight: 600; font-size: 0.85rem;
  cursor: pointer; border: none; transition: all 0.15s;
}
.pp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pp-btn-primary { background: var(--primary); color: white; }
.pp-btn-primary:hover:not(:disabled) { opacity: 0.9; }
.pp-btn-secondary { background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); }
.pp-btn-secondary:hover { border-color: var(--primary); }
.pp-btn-danger { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
.pp-btn-danger:hover { background: rgba(239,68,68,0.15); }

/* ═══ RESPONSIVE ═══ */
@media (max-width: 900px) {
  .pp-stats-row { grid-template-columns: repeat(3, 1fr); }
  .pp-overview { grid-template-columns: 1fr; }
  .pp-charts-row { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .pp-stats-row { grid-template-columns: repeat(2, 1fr); }
  .pp-hero-content { padding: 20px 16px; gap: 16px; }
  .pp-avatar { width: 64px; height: 64px; font-size: 1.6rem; border-radius: 16px; }
  .pp-level-pip { width: 24px; height: 24px; font-size: 0.6rem; }
  .pp-name { font-size: 1.2rem; }
  .pp-content { padding: 0 16px; }
  .pp-tabs { padding: 0 16px; }
  .pp-stats-row { padding: 0 16px; }
  .pp-tab { padding: 8px 10px; font-size: 0.78rem; }
  .pp-subject-grid { grid-template-columns: 1fr; }
}
@media (max-width: 420px) {
  .pp-stats-row { grid-template-columns: 1fr 1fr; }
  .pp-stat-card:last-child { grid-column: 1 / -1; }
}
`;
