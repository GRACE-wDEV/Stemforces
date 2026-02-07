import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight, FolderOpen, FileText, Clock, Users, Star,
  Play, Shuffle, Zap, Swords, ArrowLeft, Search, CheckCircle,
  BookOpen, Eye, X, Trophy, Target, Flame, Filter, BarChart3,
  ArrowRight, Sparkles
} from "lucide-react";
import api from "../api/axios";
import { useAuthStore } from "../stores/authStore";

/* ─── Subjects config ─── */
const SUBJECTS = [
  { id: "Math", name: "Mathematics", icon: "∫", color: "#3b82f6", gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)" },
  { id: "Physics", name: "Physics", icon: "Φ", color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)" },
  { id: "Chemistry", name: "Chemistry", icon: "⚗", color: "#10b981", gradient: "linear-gradient(135deg, #10b981, #059669)" },
  { id: "Biology", name: "Biology", icon: "🧬", color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b, #d97706)" },
  { id: "French", name: "French", icon: "Fr", color: "#ec4899", gradient: "linear-gradient(135deg, #ec4899, #db2777)" },
  { id: "English", name: "English", icon: "Ε", color: "#6366f1", gradient: "linear-gradient(135deg, #6366f1, #4f46e5)" },
  { id: "Arabic", name: "Arabic", icon: "ع", color: "#14b8a6", gradient: "linear-gradient(135deg, #14b8a6, #0d9488)" },
  { id: "Earth Science", name: "Earth Science", icon: "⛰", color: "#84cc16", gradient: "linear-gradient(135deg, #84cc16, #65a30d)" },
  { id: "Deutsch", name: "German", icon: "De", color: "#f97316", gradient: "linear-gradient(135deg, #f97316, #ea580c)" },
];

/* ─── Difficulty ─── */
const DIFFICULTY_MAP = {
  easy: { label: "Easy", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  beginner: { label: "Easy", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  medium: { label: "Medium", color: "#eab308", bg: "rgba(234,179,8,0.12)" },
  intermediate: { label: "Medium", color: "#eab308", bg: "rgba(234,179,8,0.12)" },
  hard: { label: "Hard", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  advanced: { label: "Hard", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  mixed: { label: "Mixed", color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
};
const getDiff = (d) => DIFFICULTY_MAP[(d || "mixed").toLowerCase()] || DIFFICULTY_MAP.mixed;

export default function BrowsePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [filterDiff, setFilterDiff] = useState("all");
  const quizzesRef = useRef(null);

  /* ── Data fetching ── */
  const { data: userStats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => { const res = await api.get("/auth/me/stats"); return res.data.data; },
    enabled: isAuthenticated,
  });

  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ["browse-categories", selectedSubject],
    queryFn: async () => { const res = await api.get(`/categories/browse?subject=${selectedSubject}`); return res.data; },
    enabled: !!selectedSubject,
  });

  const { data: quizzesData, isLoading: loadingQuizzes } = useQuery({
    queryKey: ["browse-quizzes", selectedSubject, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSubject) params.append("subject", selectedSubject);
      if (selectedCategory) params.append("category", selectedCategory);
      params.append("published", "true");
      const res = await api.get(`/quizzes?${params.toString()}`);
      return res.data;
    },
    enabled: !!selectedSubject,
  });

  const categories = categoriesData?.categories || [];
  const quizzes = useMemo(() => quizzesData?.quizzes || quizzesData?.data || [], [quizzesData]);
  const subjectInfo = SUBJECTS.find((s) => s.id === selectedSubject);
  const completedQuizIds = useMemo(() => new Set(userStats?.completedQuizIds || []), [userStats]);
  const isCompleted = (id) => completedQuizIds.has(id?.toString());

  const getSubjectProgress = (subjectId) => {
    if (!userStats?.subjectProgress) return null;
    return userStats.subjectProgress.find((sp) => sp.subject === subjectId) || null;
  };

  /* ── Filtered + sorted quizzes ── */
  const displayQuizzes = useMemo(() => {
    let list = [...quizzes];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((quiz) =>
        quiz.title?.toLowerCase().includes(q) || quiz.description?.toLowerCase().includes(q)
      );
    }
    if (filterDiff !== "all") {
      list = list.filter((quiz) => {
        const d = (quiz.difficulty || "mixed").toLowerCase();
        if (filterDiff === "easy") return d === "easy" || d === "beginner";
        if (filterDiff === "medium") return d === "medium" || d === "intermediate";
        if (filterDiff === "hard") return d === "hard" || d === "advanced";
        return true;
      });
    }
    if (sortBy === "popular") list.sort((a, b) => (b.attempts || 0) - (a.attempts || 0));
    else if (sortBy === "newest") list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    else if (sortBy === "easiest") {
      const order = { easy: 0, beginner: 0, medium: 1, intermediate: 1, hard: 2, advanced: 2 };
      list.sort((a, b) => (order[(a.difficulty || "medium").toLowerCase()] || 1) - (order[(b.difficulty || "medium").toLowerCase()] || 1));
    }
    return list;
  }, [quizzes, searchQuery, filterDiff, sortBy]);

  const completedCount = useMemo(() => quizzes.filter((q) => completedQuizIds.has(q._id?.toString())).length, [quizzes, completedQuizIds]);

  useEffect(() => {
    if (selectedSubject && quizzesRef.current) {
      setTimeout(() => quizzesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
  }, [selectedSubject]);

  const startQuiz = (quizId) => {
    if (isCompleted(quizId)) navigate(`/quiz/${quizId}/review`);
    else navigate(`/quiz/${selectedSubject}/${quizId}`);
  };

  const handleSubjectClick = (subjectId) => {
    if (selectedSubject === subjectId) {
      setSelectedSubject(null);
      setSelectedCategory(null);
    } else {
      setSelectedSubject(subjectId);
      setSelectedCategory(null);
      setSearchQuery("");
      setFilterDiff("all");
      setSortBy("default");
    }
  };

  const handleBack = () => {
    if (selectedCategory) setSelectedCategory(null);
    else { setSelectedSubject(null); setSelectedCategory(null); }
  };

  return (
    <div className="bp">
      {/* ═══ HERO ═══ */}
      <section className="bp-hero">
        <div className="bp-hero-inner">
          <div className="bp-hero-text">
            <h1>
              {!selectedSubject ? (
                <>Explore & Practice <Sparkles size={24} className="bp-sparkle" /></>
              ) : (
                <>
                  <button className="bp-back-btn" onClick={handleBack}><ArrowLeft size={20} /></button>
                  <span className="bp-subj-icon-hero" style={{ background: subjectInfo?.gradient }}>{subjectInfo?.icon}</span>
                  {subjectInfo?.name}
                </>
              )}
            </h1>
            <p>
              {!selectedSubject
                ? "Choose a subject, find the perfect quiz, and level up your knowledge"
                : selectedCategory
                  ? `Quizzes in ${categories.find((c) => c._id === selectedCategory)?.name || "category"}`
                  : `${quizzes.length} quizzes available · ${completedCount} completed`}
            </p>
          </div>
          {selectedSubject && (
            <div className="bp-hero-actions">
              <button className="bp-pill practice" onClick={() => navigate(`/quiz/custom?subject=${selectedSubject}`)}>
                <Play size={15} /> Practice
              </button>
              <button className="bp-pill random" onClick={() => navigate(`/quiz/random?subject=${selectedSubject}&count=10`)}>
                <Shuffle size={15} /> Quick 10
              </button>
              <button className="bp-pill battle" onClick={() => navigate("/battle")}>
                <Swords size={15} /> Battle
              </button>
            </div>
          )}
        </div>
        {selectedSubject && (
          <div className="bp-breadcrumb">
            <button onClick={() => { setSelectedSubject(null); setSelectedCategory(null); }}>All Subjects</button>
            <ChevronRight size={14} />
            <button className={!selectedCategory ? "active" : ""} onClick={() => setSelectedCategory(null)}>
              {subjectInfo?.name}
            </button>
            {selectedCategory && (
              <>
                <ChevronRight size={14} />
                <span className="active">{categories.find((c) => c._id === selectedCategory)?.name}</span>
              </>
            )}
          </div>
        )}
      </section>

      {/* ═══ SUBJECT GRID ═══ */}
      {!selectedSubject && (
        <section className="bp-subjects">
          <div className="bp-subjects-grid">
            {SUBJECTS.map((subject, idx) => {
              const progress = getSubjectProgress(subject.id);
              const pct = progress ? Math.round((progress.questions_correct / Math.max(1, progress.questions_attempted)) * 100) : 0;
              return (
                <div
                  key={subject.id}
                  className="bp-subject-card"
                  onClick={() => handleSubjectClick(subject.id)}
                  style={{ "--sc": subject.color, "--delay": `${idx * 0.04}s` }}
                >
                  <div className="bp-sc-icon" style={{ background: subject.gradient }}>
                    <span>{subject.icon}</span>
                  </div>
                  <div className="bp-sc-body">
                    <h3>{subject.name}</h3>
                    {progress ? (
                      <div className="bp-sc-stats">
                        <span><CheckCircle size={12} /> {progress.quizzes_completed} quizzes</span>
                        <span><Target size={12} /> {pct}% accuracy</span>
                      </div>
                    ) : (
                      <span className="bp-sc-new">Start learning <ArrowRight size={12} /></span>
                    )}
                  </div>
                  <div className="bp-sc-arrow"><ChevronRight size={20} /></div>
                  {progress && (
                    <div className="bp-sc-progress-bar">
                      <div className="bp-sc-progress-fill" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Global quick actions */}
          <div className="bp-global-actions">
            <button className="bp-ga-card daily" onClick={() => navigate("/daily-challenge")}>
              <Flame size={22} />
              <div><h4>Daily Challenge</h4><p>Earn bonus XP & keep your streak</p></div>
              <ArrowRight size={16} />
            </button>
            <button className="bp-ga-card battle" onClick={() => navigate("/battle")}>
              <Swords size={22} />
              <div><h4>Quiz Battle</h4><p>Challenge others in real-time</p></div>
              <ArrowRight size={16} />
            </button>
            <button className="bp-ga-card lb" onClick={() => navigate("/leaderboard")}>
              <Trophy size={22} />
              <div><h4>Leaderboard</h4><p>See where you rank</p></div>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* ═══ QUIZ CONTENT ═══ */}
      {selectedSubject && (
        <section className="bp-content" ref={quizzesRef}>
          {/* Categories row */}
          {!selectedCategory && categories.length > 0 && (
            <div className="bp-categories">
              <h3><FolderOpen size={18} /> Categories</h3>
              <div className="bp-cat-row">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    className="bp-cat-chip"
                    onClick={() => setSelectedCategory(cat._id)}
                    style={{ "--cc": subjectInfo?.color }}
                  >
                    <FolderOpen size={14} />
                    <span>{cat.name}</span>
                    <span className="bp-cat-count">{cat.quizCount || 0}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toolbar: search + filters */}
          <div className="bp-toolbar">
            <div className="bp-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && <button onClick={() => setSearchQuery("")}><X size={14} /></button>}
            </div>
            <div className="bp-filters">
              <select className="bp-select" value={filterDiff} onChange={(e) => setFilterDiff(e.target.value)}>
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <select className="bp-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="default">Default</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="easiest">Easiest First</option>
              </select>
            </div>
          </div>

          {/* Progress summary */}
          {isAuthenticated && quizzes.length > 0 && (
            <div className="bp-progress-summary">
              <div className="bp-ps-bar">
                <div className="bp-ps-fill" style={{ width: `${quizzes.length > 0 ? (completedCount / quizzes.length * 100) : 0}%` }} />
              </div>
              <span className="bp-ps-text">{completedCount}/{quizzes.length} quizzes completed</span>
            </div>
          )}

          {/* Quiz grid */}
          {loadingQuizzes || loadingCategories ? (
            <div className="bp-loading">
              <div className="bp-spinner" />
              <p>Loading quizzes...</p>
            </div>
          ) : displayQuizzes.length === 0 ? (
            <div className="bp-empty">
              <BookOpen size={48} />
              <h3>{searchQuery ? "No quizzes match your search" : "No quizzes available yet"}</h3>
              <p>{searchQuery ? "Try a different search term" : "Check back later or try Practice Mode"}</p>
              {searchQuery && <button className="bp-clear-btn" onClick={() => setSearchQuery("")}>Clear Search</button>}
            </div>
          ) : (
            <div className="bp-quiz-grid">
              {displayQuizzes.map((quiz, idx) => {
                const completed = isCompleted(quiz._id);
                const diff = getDiff(quiz.difficulty);
                const qCount = quiz.questions?.length || quiz.questionCount || 0;
                return (
                  <div
                    key={quiz._id}
                    className={`bp-quiz-card ${completed ? "completed" : ""}`}
                    style={{ "--delay": `${idx * 0.03}s`, "--accent": diff.color }}
                  >
                    <div className="bp-qc-accent" style={{ background: completed ? "#22c55e" : subjectInfo?.gradient }} />
                    <div className="bp-qc-header">
                      <h4>{quiz.title}</h4>
                      <div className="bp-qc-badges">
                        <span className="bp-diff-badge" style={{ color: diff.color, background: diff.bg }}>
                          {diff.label}
                        </span>
                        {completed && (
                          <span className="bp-done-badge"><CheckCircle size={12} /> Done</span>
                        )}
                      </div>
                    </div>
                    {quiz.description && (
                      <p className="bp-qc-desc">{quiz.description.length > 100 ? quiz.description.slice(0, 100) + "..." : quiz.description}</p>
                    )}
                    <div className="bp-qc-meta">
                      {qCount > 0 && <span><FileText size={13} /> {qCount} Qs</span>}
                      {quiz.total_time > 0 && <span><Clock size={13} /> {quiz.total_time} min</span>}
                      {quiz.attempts > 0 && <span><Users size={13} /> {quiz.attempts}</span>}
                      {quiz.avg_score > 0 && <span><BarChart3 size={13} /> {Math.round(quiz.avg_score)}%</span>}
                    </div>
                    <button
                      className={`bp-qc-btn ${completed ? "review" : ""}`}
                      onClick={() => startQuiz(quiz._id)}
                    >
                      {completed ? (
                        <><Eye size={16} /> Review Answers</>
                      ) : (
                        <><Zap size={16} /> Start Quiz</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      <style>{styles}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLES — bp- prefix
   ═══════════════════════════════════════════════════════════════ */
const styles = `
.bp { min-height: calc(100vh - 64px); background: var(--bg-primary); padding-bottom: 100px; }

/* ═══ HERO ═══ */
.bp-hero {
  background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);
  padding: 28px 0 20px;
}
.bp-hero-inner {
  max-width: 1100px; margin: 0 auto; padding: 0 20px;
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
}
.bp-hero-text h1 {
  font-size: 1.8rem; font-weight: 800; margin: 0 0 6px;
  color: var(--text-primary); display: flex; align-items: center; gap: 10px;
}
.bp-sparkle { color: #f59e0b; animation: bp-sparkle 3s ease-in-out infinite; }
@keyframes bp-sparkle { 0%,100%{transform:rotate(0)} 50%{transform:rotate(12deg)} }
.bp-hero-text p { color: var(--text-secondary); margin: 0; font-size: 0.95rem; }
.bp-back-btn {
  background: var(--bg-tertiary); border: 1px solid var(--border-color);
  border-radius: 10px; padding: 8px; cursor: pointer; color: var(--text-primary);
  display: flex; align-items: center; transition: all 0.15s;
}
.bp-back-btn:hover { border-color: var(--primary); }
.bp-subj-icon-hero {
  width: 36px; height: 36px; border-radius: 10px; color: white;
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 1rem;
}
.bp-hero-actions { display: flex; gap: 8px; flex-wrap: wrap; align-self: center; }
.bp-pill {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  border-radius: 20px; border: 1px solid var(--border-color);
  background: var(--bg-tertiary); cursor: pointer;
  font-size: 0.82rem; font-weight: 600; transition: all 0.2s;
  color: var(--text-primary);
}
.bp-pill:hover { transform: translateY(-2px); }
.bp-pill.practice { border-color: #10b981; color: #10b981; }
.bp-pill.practice:hover { background: rgba(16,185,129,0.1); }
.bp-pill.random { border-color: #f59e0b; color: #f59e0b; }
.bp-pill.random:hover { background: rgba(245,158,11,0.1); }
.bp-pill.battle { border-color: #ef4444; color: #ef4444; }
.bp-pill.battle:hover { background: rgba(239,68,68,0.1); }

/* Breadcrumb */
.bp-breadcrumb {
  max-width: 1100px; margin: 12px auto 0; padding: 0 20px;
  display: flex; align-items: center; gap: 6px; font-size: 0.82rem;
}
.bp-breadcrumb button {
  background: none; border: none; color: var(--text-tertiary);
  cursor: pointer; font-size: 0.82rem; padding: 4px 2px;
}
.bp-breadcrumb button:hover { color: var(--primary); }
.bp-breadcrumb .active { color: var(--text-primary); font-weight: 600; }
.bp-breadcrumb svg { color: var(--text-tertiary); flex-shrink: 0; }

/* ═══ SUBJECTS ═══ */
.bp-subjects { max-width: 1100px; margin: 28px auto 0; padding: 0 20px; }
.bp-subjects-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px;
}
.bp-subject-card {
  display: flex; align-items: center; gap: 14px; padding: 18px 20px;
  background: var(--bg-secondary); border: 1.5px solid var(--border-color);
  border-radius: 16px; cursor: pointer; transition: all 0.25s;
  position: relative; overflow: hidden;
  animation: bp-cardIn 0.4s ease forwards;
  animation-delay: var(--delay, 0s);
  opacity: 0;
}
@keyframes bp-cardIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.bp-subject-card:hover {
  border-color: var(--sc); transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
.bp-sc-icon {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 700; font-size: 1.3rem; flex-shrink: 0;
}
.bp-sc-body { flex: 1; min-width: 0; }
.bp-sc-body h3 { margin: 0 0 4px; font-size: 1.05rem; font-weight: 700; color: var(--text-primary); }
.bp-sc-stats { display: flex; gap: 12px; font-size: 0.75rem; color: var(--text-tertiary); }
.bp-sc-stats span { display: flex; align-items: center; gap: 3px; }
.bp-sc-stats svg { color: #10b981; }
.bp-sc-new {
  font-size: 0.78rem; color: var(--primary); font-weight: 500;
  display: flex; align-items: center; gap: 4px;
}
.bp-sc-arrow { color: var(--text-tertiary); flex-shrink: 0; transition: transform 0.2s; }
.bp-subject-card:hover .bp-sc-arrow { transform: translateX(4px); color: var(--sc); }
.bp-sc-progress-bar {
  position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--bg-tertiary);
}
.bp-sc-progress-fill {
  height: 100%; background: var(--sc); transition: width 0.6s ease;
  border-radius: 0 3px 0 0;
}

/* ═══ GLOBAL ACTIONS ═══ */
.bp-global-actions {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 32px;
}
.bp-ga-card {
  display: flex; align-items: center; gap: 14px; padding: 18px 20px;
  background: var(--bg-secondary); border: 1.5px solid var(--border-color);
  border-radius: 14px; cursor: pointer; transition: all 0.25s; text-align: left;
  color: var(--text-primary);
}
.bp-ga-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
.bp-ga-card h4 { margin: 0; font-size: 0.95rem; font-weight: 700; }
.bp-ga-card p { margin: 2px 0 0; font-size: 0.75rem; color: var(--text-tertiary); }
.bp-ga-card > svg:first-child { flex-shrink: 0; }
.bp-ga-card > div { flex: 1; }
.bp-ga-card > svg:last-child { color: var(--text-tertiary); flex-shrink: 0; }
.bp-ga-card.daily { border-color: #f97316; }
.bp-ga-card.daily:hover { background: rgba(249,115,22,0.06); }
.bp-ga-card.daily > svg:first-child { color: #f97316; }
.bp-ga-card.battle { border-color: #ef4444; }
.bp-ga-card.battle:hover { background: rgba(239,68,68,0.06); }
.bp-ga-card.battle > svg:first-child { color: #ef4444; }
.bp-ga-card.lb { border-color: #eab308; }
.bp-ga-card.lb:hover { background: rgba(234,179,8,0.06); }
.bp-ga-card.lb > svg:first-child { color: #eab308; }

/* ═══ CONTENT ═══ */
.bp-content { max-width: 1100px; margin: 24px auto 0; padding: 0 20px; }

.bp-categories { margin-bottom: 20px; }
.bp-categories h3 {
  font-size: 0.92rem; font-weight: 600; color: var(--text-secondary);
  display: flex; align-items: center; gap: 8px; margin: 0 0 10px;
}
.bp-cat-row { display: flex; flex-wrap: wrap; gap: 8px; }
.bp-cat-chip {
  display: flex; align-items: center; gap: 6px; padding: 8px 14px;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 20px; cursor: pointer; font-size: 0.82rem;
  color: var(--text-primary); transition: all 0.2s; font-weight: 500;
}
.bp-cat-chip:hover { border-color: var(--cc); background: var(--bg-tertiary); }
.bp-cat-count {
  background: var(--bg-tertiary); padding: 1px 7px; border-radius: 10px;
  font-size: 0.7rem; color: var(--text-tertiary); font-weight: 600;
}

/* Toolbar */
.bp-toolbar {
  display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;
}
.bp-search {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 12px; flex: 1; min-width: 200px; color: var(--text-tertiary);
}
.bp-search input {
  border: none; background: none; outline: none; flex: 1;
  font-size: 0.88rem; color: var(--text-primary);
}
.bp-search input::placeholder { color: var(--text-tertiary); }
.bp-search button {
  background: none; border: none; cursor: pointer; color: var(--text-tertiary);
  display: flex; align-items: center; padding: 0;
}
.bp-filters { display: flex; gap: 8px; }
.bp-select {
  padding: 10px 12px; background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 10px; font-size: 0.82rem; color: var(--text-primary);
  cursor: pointer; outline: none;
}
.bp-select:focus { border-color: var(--primary); }

/* Progress summary */
.bp-progress-summary {
  display: flex; align-items: center; gap: 12px; margin-bottom: 18px;
  padding: 10px 16px; background: var(--bg-secondary); border-radius: 10px;
  border: 1px solid var(--border-color);
}
.bp-ps-bar {
  flex: 1; height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden;
}
.bp-ps-fill {
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, #10b981, #22c55e);
  transition: width 0.6s ease;
}
.bp-ps-text { font-size: 0.78rem; color: var(--text-secondary); font-weight: 500; white-space: nowrap; }

/* Loading/Empty */
.bp-loading {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 20px; color: var(--text-tertiary); gap: 12px;
}
.bp-spinner {
  width: 32px; height: 32px; border: 3px solid var(--border-color);
  border-top-color: var(--primary); border-radius: 50%;
  animation: bp-spin 0.8s linear infinite;
}
@keyframes bp-spin { to { transform: rotate(360deg); } }
.bp-empty { text-align: center; padding: 60px 20px; color: var(--text-tertiary); }
.bp-empty h3 { margin: 12px 0 4px; color: var(--text-secondary); font-size: 1.1rem; }
.bp-empty p { margin: 0 0 16px; font-size: 0.88rem; }
.bp-clear-btn {
  padding: 8px 20px; background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 8px; cursor: pointer; color: var(--text-primary); font-size: 0.85rem;
}

/* ═══ QUIZ GRID ═══ */
.bp-quiz-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;
}
.bp-quiz-card {
  background: var(--bg-secondary); border: 1.5px solid var(--border-color);
  border-radius: 16px; padding: 0; overflow: hidden;
  transition: all 0.25s ease; position: relative;
  animation: bp-cardIn 0.4s ease forwards;
  animation-delay: var(--delay);
  opacity: 0;
}
.bp-quiz-card:hover {
  border-color: var(--accent, var(--primary));
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.1);
}
.bp-quiz-card.completed { border-color: rgba(34,197,94,0.3); }

.bp-qc-accent { height: 4px; width: 100%; }
.bp-qc-header { padding: 16px 18px 0; }
.bp-qc-header h4 {
  margin: 0 0 8px; font-size: 1rem; font-weight: 700;
  color: var(--text-primary); line-height: 1.3;
}
.bp-qc-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.bp-diff-badge {
  font-size: 0.68rem; font-weight: 700; padding: 3px 10px;
  border-radius: 6px; text-transform: uppercase; letter-spacing: 0.3px;
}
.bp-done-badge {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 0.68rem; font-weight: 700; padding: 3px 10px;
  border-radius: 6px; background: rgba(34,197,94,0.12); color: #22c55e;
}
.bp-qc-desc {
  padding: 0 18px; margin: 8px 0 0; font-size: 0.82rem;
  color: var(--text-tertiary); line-height: 1.45;
}
.bp-qc-meta {
  display: flex; gap: 14px; padding: 12px 18px 0; flex-wrap: wrap;
  font-size: 0.78rem; color: var(--text-tertiary);
}
.bp-qc-meta span { display: flex; align-items: center; gap: 4px; }

.bp-qc-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: calc(100% - 36px); margin: 14px 18px 18px; padding: 12px;
  border-radius: 12px; border: none; font-weight: 700; font-size: 0.88rem;
  cursor: pointer; transition: all 0.2s;
  background: var(--primary); color: white;
}
.bp-qc-btn:hover { transform: scale(1.02); box-shadow: 0 4px 16px rgba(99,102,241,0.3); }
.bp-qc-btn.review {
  background: var(--bg-tertiary); color: var(--text-primary);
  border: 1px solid var(--border-color);
}
.bp-qc-btn.review:hover {
  border-color: var(--primary); background: var(--bg-secondary);
  box-shadow: none;
}

/* ═══ RESPONSIVE ═══ */
@media (max-width: 768px) {
  .bp-hero-inner { flex-direction: column; }
  .bp-hero-text h1 { font-size: 1.4rem; }
  .bp-subjects-grid { grid-template-columns: 1fr; }
  .bp-global-actions { grid-template-columns: 1fr; }
  .bp-quiz-grid { grid-template-columns: 1fr; }
  .bp-toolbar { flex-direction: column; }
  .bp-filters { width: 100%; }
  .bp-select { flex: 1; }
}
@media (max-width: 480px) {
  .bp { padding-bottom: 120px; }
  .bp-hero { padding: 20px 0 16px; }
  .bp-hero-text h1 { font-size: 1.2rem; }
  .bp-sc-body h3 { font-size: 0.92rem; }
  .bp-qc-header h4 { font-size: 0.92rem; }
  .bp-hero-actions { gap: 6px; }
  .bp-pill { padding: 6px 12px; font-size: 0.75rem; }
}
`;
