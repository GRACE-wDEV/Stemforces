import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  Plus,
  FileText,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Upload,
  ChevronRight,
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  Sparkles,
  Copy,
  CheckCircle2,
  ListPlus,
  Layers,
  Target,
  Activity,
  Zap,
  Award,
  RefreshCw,
  Database,
  Globe,
  Shield,
  UserCheck,
  Calendar,
  Hash,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  PieChart,
  Key,
  Ban,
  Power,
  RotateCcw,
} from "lucide-react";
import { adminAPI } from "../api/admin";

// ─── No more hardcoded subjects ──────────────────────────────────────────────
// Subjects are fetched dynamically from the backend /admin/dashboard/stats

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch dashboard stats (now includes subjects, users, activity, etc.)
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await adminAPI.getDashboardStats();
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

  // Dynamic subjects from the database
  const subjects = stats?.subjects || [];

  // Fetch categories
  const { data: categoriesData, refetch: refetchCategories } = useQuery({
    queryKey: ["admin-categories", selectedSubject],
    queryFn: async () => {
      const res = await adminAPI.getCategories(selectedSubject);
      return res.data;
    },
    enabled: !!selectedSubject,
    staleTime: 1000 * 60 * 2,
  });

  // Fetch questions
  const { data: questionsData, refetch: refetchQuestions } = useQuery({
    queryKey: ["admin-questions", selectedSubject, selectedCategory],
    queryFn: async () => {
      const params = { limit: 100 };
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedCategory) params.category = selectedCategory;
      const res = await adminAPI.getQuestions(params);
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const categories = categoriesData?.categories || [];
  const questions = questionsData?.questions || [];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo-box">
            <LayoutDashboard size={20} />
          </div>
          <span>Admin Panel</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-label">Dashboard</span>
            <button
              className={`nav-item ${activeSection === "overview" ? "active" : ""}`}
              onClick={() => setActiveSection("overview")}
            >
              <BarChart3 size={18} />
              <span>Overview</span>
            </button>
            <button
              className={`nav-item ${activeSection === "users" ? "active" : ""}`}
              onClick={() => setActiveSection("users")}
            >
              <Users size={18} />
              <span>Users</span>
            </button>
          </div>

          <div className="nav-section">
            <span className="nav-label">Content</span>
            <button
              className={`nav-item ${activeSection === "categories" ? "active" : ""}`}
              onClick={() => setActiveSection("categories")}
            >
              <FolderOpen size={18} />
              <span>Categories</span>
            </button>
            <button
              className={`nav-item ${activeSection === "questions" ? "active" : ""}`}
              onClick={() => setActiveSection("questions")}
            >
              <BookOpen size={18} />
              <span>Questions</span>
            </button>
            <button
              className={`nav-item ${activeSection === "test-builder" ? "active" : ""}`}
              onClick={() => setActiveSection("test-builder")}
            >
              <ListPlus size={18} />
              <span>Test Builder</span>
              <span className="nav-badge">New</span>
            </button>
            <button
              className={`nav-item ${activeSection === "quizzes" ? "active" : ""}`}
              onClick={() => setActiveSection("quizzes")}
            >
              <FileText size={18} />
              <span>Quizzes</span>
            </button>
          </div>
        </nav>

        {/* Dynamic Subjects from DB */}
        <div className="subject-selector">
          <h4>Select Subject</h4>
          {statsLoading ? (
            <div className="loading-text">Loading subjects...</div>
          ) : subjects.length === 0 ? (
            <div className="loading-text">No subjects found</div>
          ) : (
            <div className="subject-list">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  className={`subject-btn ${selectedSubject === subject.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedSubject(subject.id);
                    setSelectedCategory(null);
                  }}
                  style={{ "--subject-color": subject.color }}
                >
                  <span className="subject-icon">{subject.icon}</span>
                  <span className="subject-name">{subject.name}</span>
                  <span className="subject-count">{subject.questions}</span>
                  {selectedSubject === subject.id && (
                    <Check size={14} className="subject-check" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats in Sidebar */}
        <div className="sidebar-stats">
          <div className="stat-box">
            <BookOpen size={16} />
            <div>
              <span className="stat-value">
                {stats?.stats?.total_questions?.toLocaleString() || 0}
              </span>
              <span className="stat-label">Questions</span>
            </div>
          </div>
          <div className="stat-box">
            <Eye size={16} />
            <div>
              <span className="stat-value">
                {stats?.stats?.published_questions?.toLocaleString() || 0}
              </span>
              <span className="stat-label">Published</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {activeSection === "overview" && (
          <OverviewPanel stats={stats} loading={statsLoading} refetchStats={refetchStats} subjects={subjects} />
        )}
        {activeSection === "users" && <UsersPanel />}
        {activeSection === "categories" && (
          <CategoryManager
            subject={selectedSubject}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            refetch={refetchCategories}
          />
        )}
        {activeSection === "questions" && (
          <QuestionManager
            subject={selectedSubject}
            category={selectedCategory}
            categories={categories}
            questions={questions}
            refetch={refetchQuestions}
            subjects={subjects}
          />
        )}
        {activeSection === "test-builder" && (
          <TestBuilder
            subject={selectedSubject}
            categories={categories}
            refetch={refetchQuestions}
            subjects={subjects}
          />
        )}
        {activeSection === "quizzes" && (
          <QuizManager subject={selectedSubject} categories={categories} />
        )}
      </main>

      <style>{styles}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  OVERVIEW PANEL — Real Data, Beautiful Charts
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewPanel({ stats, loading, refetchStats, subjects }) {
  if (loading) {
    return (
      <div className="overview-panel">
        <div className="panel-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Loading your command centre...</p>
          </div>
        </div>
        <div className="loading-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  const s = stats?.stats || {};
  const platform = stats?.platform || {};

  const statCards = [
    {
      label: "Total Questions",
      value: s.total_questions || 0,
      icon: BookOpen,
      color: "#3b82f6",
      sub: `${s.published_questions || 0} published · ${s.draft_questions || 0} drafts`,
    },
    {
      label: "Total Quizzes",
      value: s.total_quizzes || 0,
      icon: FileText,
      color: "#8b5cf6",
      sub: `${s.published_quizzes || 0} published`,
    },
    {
      label: "Total Users",
      value: s.total_users || 0,
      icon: Users,
      color: "#10b981",
      sub: `${s.admin_count || 0} admins · ${s.editor_count || 0} editors`,
    },
    {
      label: "Questions Answered",
      value: platform.questions_answered || 0,
      icon: Zap,
      color: "#f59e0b",
      sub: `${platform.quizzes_completed || 0} quizzes completed`,
    },
    {
      label: "Study Time",
      value: platform.time_spent_minutes
        ? `${Math.round(platform.time_spent_minutes / 60)}h`
        : "0h",
      icon: Clock,
      color: "#ec4899",
      sub: "Total platform study time",
      raw: true,
    },
    {
      label: "Total XP Earned",
      value: platform.total_xp || 0,
      icon: Award,
      color: "#14b8a6",
      sub: "Across all students",
    },
  ];

  // Use real subject data
  const subjectStats = subjects || [];
  const maxSubjectQ = Math.max(...subjectStats.map((s) => s.questions || 0), 1);

  // Difficulty distribution
  const diffData = stats?.questions_by_difficulty || [];
  const totalDiffQ = diffData.reduce((a, d) => a + d.count, 0) || 1;
  const diffColors = { easy: "#10b981", medium: "#f59e0b", hard: "#ef4444" };

  // Daily activity (real from backend)
  const dailyActivity = stats?.daily_activity || [];
  const maxDailyQ = Math.max(...dailyActivity.map((d) => d.questions || 0), 1);

  // Recent items
  const recentQuestions = stats?.recent_questions || [];
  const recentQuizzes = stats?.recent_quizzes || [];
  const topQuizzes = stats?.top_quizzes || [];

  return (
    <div className="overview-panel">
      <div className="panel-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Real-time view of your entire platform.</p>
        </div>
        <button className="btn-refresh" onClick={() => refetchStats()}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stat-cards six">
        {statCards.map((stat, idx) => (
          <div key={idx} className="stat-card" style={{ "--card-color": stat.color }}>
            <div className="stat-card-icon">
              <stat.icon size={22} />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">
                {stat.raw ? stat.value : (typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value)}
              </span>
              <span className="stat-card-label">{stat.label}</span>
            </div>
            <span className="stat-card-sub">{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="charts-row">
        {/* Questions by Subject — Real Data */}
        <div className="chart-card wide">
          <div className="chart-header">
            <h3><Database size={16} /> Questions by Subject</h3>
            <span className="chart-subtitle">From your database</span>
          </div>
          <div className="subject-bars">
            {subjectStats.map((s, idx) => (
              <div key={idx} className="subject-bar-row">
                <div className="subject-bar-info">
                  <span className="subject-bar-icon">{s.icon}</span>
                  <span className="subject-bar-name">{s.name}</span>
                </div>
                <div className="subject-bar-track">
                  <div
                    className="subject-bar-fill"
                    style={{
                      width: `${(s.questions / maxSubjectQ) * 100}%`,
                      background: s.color,
                    }}
                  />
                </div>
                <span className="subject-bar-value">{s.questions}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Distribution — Donut */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><PieChart size={16} /> Difficulty Breakdown</h3>
            <span className="chart-subtitle">{totalDiffQ} total questions</span>
          </div>
          <div className="donut-chart-area">
            <div className="donut-ring">
              {diffData.map((d, i) => {
                const pct = (d.count / totalDiffQ) * 100;
                return (
                  <div key={i} className="donut-segment" style={{
                    "--pct": `${pct}%`,
                    "--color": diffColors[d._id] || "#64748b",
                  }} />
                );
              })}
              <div className="donut-center">
                <span className="donut-total">{totalDiffQ}</span>
                <span className="donut-label">Total</span>
              </div>
            </div>
            <div className="donut-legend">
              {diffData.map((d, i) => (
                <div key={i} className="legend-item">
                  <span className="legend-dot" style={{ background: diffColors[d._id] || "#64748b" }} />
                  <span className="legend-name">{d._id || "Unknown"}</span>
                  <span className="legend-val">{d.count} ({Math.round((d.count / totalDiffQ) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Activity + User Growth Row ── */}
      <div className="charts-row">
        {/* Daily Activity — Real Data */}
        <div className="chart-card wide">
          <div className="chart-header">
            <h3><Activity size={16} /> Daily Activity (Last 30 Days)</h3>
            <span className="chart-subtitle">Questions answered by students</span>
          </div>
          {dailyActivity.length > 0 ? (
            <div className="bar-chart scrollable">
              {dailyActivity.slice(-14).map((d, idx) => (
                <div key={idx} className="bar-item">
                  <div
                    className="bar"
                    style={{ height: `${Math.max((d.questions / maxDailyQ) * 100, 4)}%` }}
                  >
                    <span className="bar-value">{d.questions}</span>
                  </div>
                  <span className="bar-label">
                    {new Date(d._id).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="chart-empty">
              <Activity size={32} />
              <p>No activity data yet. Students haven't started using the platform.</p>
            </div>
          )}
        </div>

        {/* Top Quizzes */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><Award size={16} /> Top Quizzes</h3>
            <span className="chart-subtitle">Most attempted</span>
          </div>
          <div className="top-list">
            {topQuizzes.length > 0 ? (
              topQuizzes.map((q, idx) => (
                <div key={q._id} className="top-item">
                  <span className="top-rank">#{idx + 1}</span>
                  <div className="top-info">
                    <span className="top-name">{q.title}</span>
                    <span className="top-meta">{q.subject} · {q.questions?.length || 0} Qs</span>
                  </div>
                  <div className="top-stats">
                    <span className="top-attempts">{q.attempts} plays</span>
                    <span className="top-score">Avg: {Math.round(q.avg_score || 0)}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="chart-empty small">
                <FileText size={24} />
                <p>No quiz attempts yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Activity Row ── */}
      <div className="charts-row">
        {/* Recent Questions */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><Clock size={16} /> Recently Added Questions</h3>
          </div>
          <div className="recent-list">
            {recentQuestions.map((q) => (
              <div key={q._id} className="recent-item">
                <div className="recent-dot" style={{
                  background: q.published ? "#10b981" : "#f59e0b"
                }} />
                <div className="recent-info">
                  <span className="recent-title">{q.title || q.question_text?.substring(0, 60) || "Untitled"}</span>
                  <span className="recent-meta">
                    {q.subject} · {q.difficulty} · {timeAgo(q.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><Clock size={16} /> Recently Added Quizzes</h3>
          </div>
          <div className="recent-list">
            {recentQuizzes.length > 0 ? (
              recentQuizzes.map((q) => (
                <div key={q._id} className="recent-item">
                  <div className="recent-dot" style={{
                    background: q.published ? "#10b981" : "#f59e0b"
                  }} />
                  <div className="recent-info">
                    <span className="recent-title">{q.title}</span>
                    <span className="recent-meta">
                      {q.subject} · {q.questions?.length || 0} Qs · {q.attempts || 0} attempts · {timeAgo(q.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="chart-empty small">
                <FileText size={24} />
                <p>No quizzes created yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><Users size={16} /> Recent Sign-ups</h3>
          </div>
          <div className="recent-list">
            {(stats?.recent_users || []).map((u) => (
              <div key={u._id} className="recent-item">
                <div className="user-avatar-mini">
                  {u.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="recent-info">
                  <span className="recent-title">{u.name}</span>
                  <span className="recent-meta">
                    {u.email} · {u.role} · {timeAgo(u.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="recent-section">
        <div className="section-header">
          <h3><Sparkles size={16} /> Quick Actions</h3>
        </div>
        <div className="quick-actions">
          <QuickActionButton icon={Plus} label="Add Question" section="questions" />
          <QuickActionButton icon={ListPlus} label="Create Test" section="test-builder" />
          <QuickActionButton icon={FolderOpen} label="New Category" section="categories" />
          <QuickActionButton icon={FileText} label="Manage Quizzes" section="quizzes" />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton(props) {
  const Icon = props.icon;
  return (
    <button className="quick-action-btn">
      <Icon size={20} />
      <span>{props.label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  USERS PANEL — Full user management with CRUD, roles, status, etc.
// ═══════════════════════════════════════════════════════════════════════════════
function UsersPanel() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [resetPwUser, setResetPwUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetDataConfirm, setResetDataConfirm] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await adminAPI.getUsers();
      return res.data;
    },
    staleTime: 1000 * 60,
  });

  // Fetch detail for viewed user
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["admin-user-detail", viewingUser],
    queryFn: async () => {
      const res = await adminAPI.getUserDetail(viewingUser);
      return res.data;
    },
    enabled: !!viewingUser,
    staleTime: 1000 * 30,
  });

  // ─── Mutations ───────────────────────────────────────────────────────
  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => adminAPI.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      queryClient.invalidateQueries(["admin-user-detail"]);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, active }) => adminAPI.toggleUserStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      queryClient.invalidateQueries(["admin-user-detail"]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      queryClient.invalidateQueries(["admin-user-detail"]);
      setEditingUser(null);
      setEditForm({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      setDeleteConfirm(null);
      if (viewingUser === deleteConfirm) setViewingUser(null);
    },
  });

  const resetPwMutation = useMutation({
    mutationFn: ({ id, newPassword }) => adminAPI.resetUserPassword(id, newPassword),
    onSuccess: () => {
      setResetPwUser(null);
      setNewPassword("");
    },
  });

  const resetDataMutation = useMutation({
    mutationFn: (id) => adminAPI.resetUserData(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      queryClient.invalidateQueries(["admin-user-detail"]);
      setResetDataConfirm(null);
    },
  });

  const users = usersData?.users || [];

  const filtered = users
    .filter((u) => {
      const matchSearch =
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest": return new Date(a.createdAt) - new Date(b.createdAt);
        case "name": return (a.name || "").localeCompare(b.name || "");
        case "last-active": return new Date(b.last_login || 0) - new Date(a.last_login || 0);
        default: return 0;
      }
    });

  const startEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({ name: user.name || "", email: user.email || "", bio: user.bio || "", department: user.department || "" });
  };

  const saveEdit = () => {
    updateMutation.mutate({ id: editingUser, data: editForm });
  };

  const roleOptions = ["user", "editor", "admin"];

  // ─── User detail side-panel ──────────────────────────────────────────
  if (viewingUser && detailData) {
    const u = detailData.user;
    const s = detailData.stats;
    return (
      <div className="manager-panel">
        <div className="panel-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn-secondary" onClick={() => setViewingUser(null)} style={{ padding: "6px 10px" }}>
              <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> Back
            </button>
            <div>
              <h2>{u.name}</h2>
              <p>{u.email}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" onClick={() => startEdit(u)}>
              <Edit2 size={14} /> Edit
            </button>
            <button className="btn-secondary" onClick={() => setResetPwUser(u)}>
              <Key size={14} /> Reset Password
            </button>
          </div>
        </div>

        <div className="user-detail-grid">
          <div className="user-detail-card">
            <div className="user-detail-avatar">{u.name?.charAt(0)?.toUpperCase() || "?"}</div>
            <h3>{u.name}</h3>
            <p className="user-detail-email">{u.email}</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
              <span className={`role-badge ${u.role}`}>{u.role}</span>
              <span className={`status-badge ${u.active !== false ? "active" : "inactive"}`}>
                {u.active !== false ? "Active" : "Inactive"}
              </span>
            </div>
            {u.bio && <p className="user-detail-bio">{u.bio}</p>}
            {u.department && <p className="user-detail-dept">Department: {u.department}</p>}
            <div className="user-detail-meta">
              <div><Calendar size={14} /> Joined {new Date(u.createdAt).toLocaleDateString()}</div>
              <div><Clock size={14} /> Last login: {u.last_login ? timeAgo(u.last_login) : "Never"}</div>
            </div>
          </div>

          {s && (
            <div className="user-stats-card">
              <h4>Performance Stats</h4>
              <div className="user-stats-grid">
                <div className="user-stat-item">
                  <span className="user-stat-val">{s.level}</span>
                  <span className="user-stat-lbl">Level</span>
                </div>
                <div className="user-stat-item">
                  <span className="user-stat-val">{s.totalXP?.toLocaleString()}</span>
                  <span className="user-stat-lbl">Total XP</span>
                </div>
                <div className="user-stat-item">
                  <span className="user-stat-val">{s.accuracy}%</span>
                  <span className="user-stat-lbl">Accuracy</span>
                </div>
                <div className="user-stat-item">
                  <span className="user-stat-val">{s.totalQuestions}</span>
                  <span className="user-stat-lbl">Questions</span>
                </div>
                <div className="user-stat-item">
                  <span className="user-stat-val">{s.quizzesCompleted}</span>
                  <span className="user-stat-lbl">Quizzes</span>
                </div>
                <div className="user-stat-item">
                  <span className="user-stat-val">{s.currentStreak}</span>
                  <span className="user-stat-lbl">Streak</span>
                </div>
                <div className="user-stat-item">
                  <span className="user-stat-val">{s.longestStreak}</span>
                  <span className="user-stat-lbl">Best Streak</span>
                </div>
                <div className="user-stat-item">
                  <span className="user-stat-val">{detailData.achievementCount}</span>
                  <span className="user-stat-lbl">Achievements</span>
                </div>
              </div>
            </div>
          )}

          {!s && (
            <div className="user-stats-card">
              <h4>Performance Stats</h4>
              <div className="empty-state" style={{ padding: 30 }}>
                <Activity size={32} />
                <p>No activity data yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions for this user */}
        <div className="user-quick-actions">
          <h4>Quick Actions</h4>
          <div className="user-action-btns">
            {roleOptions.filter(r => r !== u.role).map(r => (
              <button
                key={r}
                className="btn-secondary"
                onClick={() => roleMutation.mutate({ id: u._id, role: r })}
                disabled={roleMutation.isPending}
              >
                <Shield size={14} /> Make {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
            <button
              className="btn-secondary"
              onClick={() => statusMutation.mutate({ id: u._id, active: u.active === false })}
              disabled={statusMutation.isPending}
            >
              {u.active !== false ? <><Ban size={14} /> Deactivate</> : <><Power size={14} /> Activate</>}
            </button>
            <button
              className="btn-danger"
              onClick={() => setDeleteConfirm(u._id)}
            >
              <Trash2 size={14} /> Delete User
            </button>
            <button
              className="btn-secondary" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
              onClick={() => setResetDataConfirm(u)}
              disabled={resetDataMutation.isPending}
            >
              <RotateCcw size={14} /> Reset All Data
            </button>
          </div>
        </div>

        {/* Inline modals */}
        {editingUser && (
          <div className="modal-overlay" onClick={() => setEditingUser(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3><Edit2 size={18} /> Edit User</h3>
                <button className="modal-close" onClick={() => setEditingUser(null)}><X size={18} /></button>
              </div>
              <div className="modal-body">
                <label className="modal-label">Name</label>
                <input className="modal-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Display name" />
                <label className="modal-label">Email</label>
                <input className="modal-input" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email address" />
                <label className="modal-label">Department</label>
                <input className="modal-input" value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} placeholder="e.g. Engineering, Science" />
                <label className="modal-label">Bio</label>
                <textarea className="modal-input modal-textarea" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Short bio..." rows={3} />
                {updateMutation.isError && (
                  <div className="modal-error">{updateMutation.error?.response?.data?.message || "Failed to update user"}</div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                <button className="btn-primary" onClick={saveEdit} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : <><Save size={14} /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        )}
        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-card modal-danger" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header danger">
                <h3><AlertCircle size={18} /> Delete User</h3>
                <button className="modal-close" onClick={() => setDeleteConfirm(null)}><X size={18} /></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to permanently delete <strong>{users.find((u) => u._id === deleteConfirm)?.name}</strong>?</p>
                <p className="modal-warning">This will remove the user account, all progress data, and achievements. This action cannot be undone.</p>
                {deleteMutation.isError && (
                  <div className="modal-error">{deleteMutation.error?.response?.data?.message || "Failed to delete user"}</div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn-danger" onClick={() => deleteMutation.mutate(deleteConfirm)} disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending ? "Deleting..." : <><Trash2 size={14} /> Delete Permanently</>}
                </button>
              </div>
            </div>
          </div>
        )}
        {resetPwUser && (
          <div className="modal-overlay" onClick={() => { setResetPwUser(null); setNewPassword(""); }}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3><Key size={18} /> Reset Password</h3>
                <button className="modal-close" onClick={() => { setResetPwUser(null); setNewPassword(""); }}><X size={18} /></button>
              </div>
              <div className="modal-body">
                <p>Set a new temporary password for <strong>{resetPwUser?.name}</strong>.</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: 12 }}>The user should change it after their next login.</p>
                <label className="modal-label">New Password</label>
                <input className="modal-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" minLength={6} />
                {resetPwMutation.isError && (
                  <div className="modal-error">{resetPwMutation.error?.response?.data?.message || "Failed to reset password"}</div>
                )}
                {resetPwMutation.isSuccess && (
                  <div className="modal-success">Password reset successfully!</div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => { setResetPwUser(null); setNewPassword(""); }}>Cancel</button>
                <button className="btn-primary" onClick={() => resetPwMutation.mutate({ id: resetPwUser._id, newPassword })} disabled={resetPwMutation.isPending || newPassword.length < 6}>
                  {resetPwMutation.isPending ? "Resetting..." : <><Key size={14} /> Reset Password</>}
                </button>
              </div>
            </div>
          </div>
        )}
        {resetDataConfirm && (
          <div className="modal-overlay" onClick={() => setResetDataConfirm(null)}>
            <div className="modal-card modal-danger" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header danger">
                <h3><RotateCcw size={18} /> Reset All Data</h3>
                <button className="modal-close" onClick={() => setResetDataConfirm(null)}><X size={18} /></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to reset all data for <strong>{resetDataConfirm?.name}</strong>?</p>
                <p className="modal-warning">This will delete all progress, quiz attempts, achievements, streaks, and daily challenge history. The account itself will remain but as if it was just created. This cannot be undone.</p>
                {resetDataMutation.isError && (
                  <div className="modal-error">{resetDataMutation.error?.response?.data?.message || "Failed to reset data"}</div>
                )}
                {resetDataMutation.isSuccess && (
                  <div className="modal-success">All user data has been reset!</div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setResetDataConfirm(null)}>Cancel</button>
                <button className="btn-danger" onClick={() => resetDataMutation.mutate(resetDataConfirm._id)} disabled={resetDataMutation.isPending}>
                  {resetDataMutation.isPending ? "Resetting..." : <><RotateCcw size={14} /> Reset All Data</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (viewingUser && detailLoading) {
    return (
      <div className="manager-panel">
        <div className="loading-text">Loading user details...</div>
      </div>
    );
  }

  return (
    <div className="manager-panel">
      <div className="panel-header">
        <div>
          <h2>User Management</h2>
          <p>
            {users.length} total users &middot;{" "}
            {users.filter((u) => u.role === "admin").length} admins &middot;{" "}
            {users.filter((u) => u.role === "editor").length} editors &middot;{" "}
            {users.filter((u) => u.active === false).length} inactive
          </p>
        </div>
        <button className="btn-secondary" onClick={() => refetch()}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          {["all", "admin", "editor", "user"].map((r) => (
            <button
              key={r}
              className={`filter-pill ${roleFilter === r ? "active" : ""}`}
              onClick={() => setRoleFilter(r)}
            >
              {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}s
              <span className="pill-count">
                {r === "all" ? users.length : users.filter((u) => u.role === r).length}
              </span>
            </button>
          ))}
        </div>
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A-Z</option>
          <option value="last-active">Last active</option>
        </select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="loading-text">Loading users...</div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Score</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-tertiary)" }}>
                    No users found matching your filters
                  </td>
                </tr>
              )}
              {filtered.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="user-cell" style={{ cursor: "pointer" }} onClick={() => setViewingUser(u._id)}>
                      <div className={`user-avatar-mini ${u.role}`}>{u.name?.charAt(0)?.toUpperCase() || "?"}</div>
                      <div>
                        <div className="user-name">{u.name}</div>
                        <div className="user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      className={`role-select ${u.role}`}
                      value={u.role}
                      onChange={(e) => roleMutation.mutate({ id: u._id, role: e.target.value })}
                      disabled={roleMutation.isPending}
                    >
                      {roleOptions.map((r) => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className={`status-toggle ${u.active !== false ? "active" : "inactive"}`}
                      onClick={() => statusMutation.mutate({ id: u._id, active: u.active === false })}
                      disabled={statusMutation.isPending}
                      title={u.active !== false ? "Click to deactivate" : "Click to activate"}
                    >
                      <span className="status-dot" />
                      {u.active !== false ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="score-cell">{u.score?.toLocaleString() || 0}</td>
                  <td className="date-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="date-cell">{u.last_login ? timeAgo(u.last_login) : "Never"}</td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn view" onClick={() => setViewingUser(u._id)} title="View details">
                        <Eye size={15} />
                      </button>
                      <button className="action-btn edit" onClick={() => startEdit(u)} title="Edit user">
                        <Edit2 size={15} />
                      </button>
                      <button className="action-btn key" onClick={() => setResetPwUser(u)} title="Reset password">
                        <Key size={15} />
                      </button>
                      <button className="action-btn delete" onClick={() => setDeleteConfirm(u._id)} title="Delete user">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            Showing {filtered.length} of {users.length} users
          </div>
        </div>
      )}

      {/* Modals */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Edit2 size={18} /> Edit User</h3>
              <button className="modal-close" onClick={() => setEditingUser(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <label className="modal-label">Name</label>
              <input className="modal-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Display name" />
              <label className="modal-label">Email</label>
              <input className="modal-input" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email address" />
              <label className="modal-label">Department</label>
              <input className="modal-input" value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} placeholder="e.g. Engineering, Science" />
              <label className="modal-label">Bio</label>
              <textarea className="modal-input modal-textarea" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Short bio..." rows={3} />
              {updateMutation.isError && (
                <div className="modal-error">{updateMutation.error?.response?.data?.message || "Failed to update user"}</div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              <button className="btn-primary" onClick={saveEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : <><Save size={14} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-card modal-danger" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header danger">
              <h3><AlertCircle size={18} /> Delete User</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to permanently delete <strong>{users.find((u) => u._id === deleteConfirm)?.name}</strong>?</p>
              <p className="modal-warning">This will remove the user account, all progress data, and achievements. This action cannot be undone.</p>
              {deleteMutation.isError && (
                <div className="modal-error">{deleteMutation.error?.response?.data?.message || "Failed to delete user"}</div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => deleteMutation.mutate(deleteConfirm)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Deleting..." : <><Trash2 size={14} /> Delete Permanently</>}
              </button>
            </div>
          </div>
        </div>
      )}
      {resetPwUser && (
        <div className="modal-overlay" onClick={() => { setResetPwUser(null); setNewPassword(""); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Key size={18} /> Reset Password</h3>
              <button className="modal-close" onClick={() => { setResetPwUser(null); setNewPassword(""); }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>Set a new temporary password for <strong>{resetPwUser?.name}</strong>.</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: 12 }}>The user should change it after their next login.</p>
              <label className="modal-label">New Password</label>
              <input className="modal-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" minLength={6} />
              {resetPwMutation.isError && (
                <div className="modal-error">{resetPwMutation.error?.response?.data?.message || "Failed to reset password"}</div>
              )}
              {resetPwMutation.isSuccess && (
                <div className="modal-success">Password reset successfully!</div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setResetPwUser(null); setNewPassword(""); }}>Cancel</button>
              <button className="btn-primary" onClick={() => resetPwMutation.mutate({ id: resetPwUser._id, newPassword })} disabled={resetPwMutation.isPending || newPassword.length < 6}>
                {resetPwMutation.isPending ? "Resetting..." : <><Key size={14} /> Reset Password</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CATEGORY MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
function CategoryManager({ subject, categories, selectedCategory, setSelectedCategory, refetch }) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      setIsCreating(false);
      setFormData({ name: "", description: "" });
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      refetch();
    },
  });

  const handleCreate = () => {
    if (!formData.name.trim() || !subject) return;
    createMutation.mutate({ ...formData, subject });
  };

  if (!subject) {
    return (
      <div className="empty-state">
        <FolderOpen size={48} />
        <h3>Select a Subject</h3>
        <p>Choose a subject from the sidebar to manage its categories</p>
      </div>
    );
  }

  return (
    <div className="manager-panel">
      <div className="panel-header">
        <div>
          <h2>Categories for {subject}</h2>
          <p>Organize questions into folders</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreating(true)}>
          <Plus size={18} /> New Category
        </button>
      </div>

      {isCreating && (
        <div className="create-form">
          <input
            type="text"
            placeholder="Category name (e.g., Past Exams, URT Exams)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoFocus
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="form-actions">
            <button className="btn-primary" onClick={handleCreate} disabled={createMutation.isPending}>
              <Check size={16} /> Create
            </button>
            <button className="btn-secondary" onClick={() => setIsCreating(false)}>
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="categories-grid">
        {categories.length === 0 ? (
          <div className="empty-message">
            <p>No categories yet. Create your first category above.</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat._id}
              className={`category-card ${selectedCategory === cat._id ? "selected" : ""}`}
              onClick={() => setSelectedCategory(cat._id)}
            >
              <div className="category-header">
                <FolderOpen size={24} style={{ color: cat.color }} />
                <div className="category-info">
                  <h4>{cat.name}</h4>
                  <span>
                    {cat.questionCount || 0} questions · {cat.quizCount || 0} quizzes
                  </span>
                </div>
                <div className="category-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete category "${cat.name}"?`))
                        deleteMutation.mutate(cat._id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {cat.description && <p className="category-desc">{cat.description}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  QUESTION MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
function QuestionManager({ subject, category, categories, questions, refetch }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    question_text: "",
    choices: [
      { id: "A", text: "", is_correct: true },
      { id: "B", text: "", is_correct: false },
      { id: "C", text: "", is_correct: false },
      { id: "D", text: "", is_correct: false },
    ],
    difficulty: "medium",
    source: "",
    explanation: "",
    tags: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-questions"]);
      setIsCreating(false);
      resetForm();
      refetch();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-questions"]);
      setEditingQuestion(null);
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-questions"]);
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      question_text: "",
      choices: [
        { id: "A", text: "", is_correct: true },
        { id: "B", text: "", is_correct: false },
        { id: "C", text: "", is_correct: false },
        { id: "D", text: "", is_correct: false },
      ],
      difficulty: "medium",
      source: "",
      explanation: "",
      tags: [],
    });
  };

  const handleCreate = () => {
    if (!formData.question_text.trim() || !subject) return;
    createMutation.mutate({
      ...formData,
      subject,
      category: category || undefined,
      title: formData.title || formData.question_text.substring(0, 50),
    });
  };

  const handleChoiceChange = (index, field, value) => {
    const newChoices = [...formData.choices];
    if (field === "is_correct") {
      newChoices.forEach((c, i) => (c.is_correct = i === index));
    } else {
      newChoices[index][field] = value;
    }
    setFormData({ ...formData, choices: newChoices });
  };

  const filteredQuestions = questions.filter(
    (q) =>
      !searchQuery ||
      q.question_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!subject) {
    return (
      <div className="empty-state">
        <BookOpen size={48} />
        <h3>Select a Subject</h3>
        <p>Choose a subject from the sidebar to manage questions</p>
      </div>
    );
  }

  return (
    <div className="manager-panel">
      <div className="panel-header">
        <div>
          <h2>
            Questions{" "}
            {category
              ? `in ${categories.find((c) => c._id === category)?.name}`
              : `for ${subject}`}
          </h2>
          <p>{filteredQuestions.length} questions</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreating(true)}>
          <Plus size={18} /> Add Question
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {(isCreating || editingQuestion) && (
        <div className="question-form">
          <h3>{isCreating ? "New Question" : "Edit Question"}</h3>

          <div className="form-group">
            <label>Question Title (short)</label>
            <input
              type="text"
              placeholder="e.g., Quadratic Formula"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>
              Question Text <span className="label-hint">Use $...$ for LaTeX math</span>
            </label>
            <textarea
              placeholder="Enter the question... Use $...$ for math"
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Answer Choices</label>
            <div className="choices-list">
              {formData.choices.map((choice, idx) => (
                <div key={choice.id} className="choice-row">
                  <span className="choice-letter">{choice.id}</span>
                  <input
                    type="text"
                    placeholder={`Option ${choice.id}`}
                    value={choice.text}
                    onChange={(e) => handleChoiceChange(idx, "text", e.target.value)}
                  />
                  <button
                    type="button"
                    className={`correct-btn ${choice.is_correct ? "active" : ""}`}
                    onClick={() => handleChoiceChange(idx, "is_correct", true)}
                    title="Mark as correct"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label>Source</label>
              <input
                type="text"
                placeholder="e.g., URT 2024, Past Exam"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Explanation (shown after answering)</label>
            <textarea
              placeholder="Explain the solution..."
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button
              className="btn-primary"
              onClick={
                isCreating
                  ? handleCreate
                  : () => updateMutation.mutate({ id: editingQuestion._id, data: formData })
              }
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save size={16} /> {isCreating ? "Create Question" : "Save Changes"}
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setIsCreating(false);
                setEditingQuestion(null);
                resetForm();
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="questions-list">
        {filteredQuestions.length === 0 ? (
          <div className="empty-message">
            <p>No questions found. Add your first question above.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div key={q._id} className="question-card">
              <div className="question-content">
                <h4>{q.title || "Untitled"}</h4>
                <p className="question-text">{q.question_text?.substring(0, 150)}...</p>
                <div className="question-meta">
                  <span className={`difficulty ${q.difficulty}`}>{q.difficulty}</span>
                  <span className="source">{q.source}</span>
                  {q.published ? (
                    <span className="status published">
                      <Eye size={12} /> Published
                    </span>
                  ) : (
                    <span className="status draft">
                      <EyeOff size={12} /> Draft
                    </span>
                  )}
                </div>
              </div>
              <div className="question-actions">
                <button
                  onClick={() => {
                    setEditingQuestion(q);
                    setFormData(q);
                  }}
                >
                  <Edit2 size={16} />
                </button>
                <button onClick={() => deleteMutation.mutate(q._id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  QUIZ MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
function QuizManager({ subject }) {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: quizzesData, refetch } = useQuery({
    queryKey: ["admin-quizzes", subject],
    queryFn: async () => {
      const params = {};
      if (subject) params.subject = subject;
      const res = await adminAPI.getQuizzes(params);
      return res.data;
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    total_time: 30,
    rules: { count: 10, difficulty: "mixed", randomize: true },
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createQuiz(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-quizzes"]);
      setIsCreating(false);
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-quizzes"]);
      refetch();
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, published }) => adminAPI.publishQuiz(id, published),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-quizzes"]);
      refetch();
    },
  });

  const handleCreate = () => {
    if (!formData.title.trim() || !subject) return;
    createMutation.mutate({ ...formData, subject });
  };

  const quizzes = quizzesData?.quizzes || [];

  if (!subject) {
    return (
      <div className="empty-state">
        <FileText size={48} />
        <h3>Select a Subject</h3>
        <p>Choose a subject from the sidebar to manage quizzes</p>
      </div>
    );
  }

  return (
    <div className="manager-panel">
      <div className="panel-header">
        <div>
          <h2>Quizzes for {subject}</h2>
          <p>{quizzes.length} quizzes</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreating(true)}>
          <Plus size={18} /> New Quiz
        </button>
      </div>

      {isCreating && (
        <div className="question-form">
          <h3>Create New Quiz</h3>
          <div className="form-group">
            <label>Quiz Title</label>
            <input
              type="text"
              placeholder="e.g., URT Practice Test 1"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Describe this quiz..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Time Limit (minutes)</label>
              <input
                type="number"
                value={formData.total_time}
                onChange={(e) =>
                  setFormData({ ...formData, total_time: parseInt(e.target.value) })
                }
                min={5}
                max={180}
              />
            </div>
            <div className="form-group">
              <label>Number of Questions</label>
              <input
                type="number"
                value={formData.rules.count}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rules: { ...formData.rules, count: parseInt(e.target.value) },
                  })
                }
                min={5}
                max={100}
              />
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={formData.rules.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rules: { ...formData.rules, difficulty: e.target.value },
                  })
                }
              >
                <option value="mixed">Mixed</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleCreate} disabled={createMutation.isPending}>
              <Save size={16} /> Create Quiz
            </button>
            <button className="btn-secondary" onClick={() => setIsCreating(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="quizzes-list">
        {quizzes.length === 0 ? (
          <div className="empty-message">
            <p>No quizzes yet. Create your first quiz above.</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <div className="quiz-content">
                <h4>{quiz.title}</h4>
                <p>{quiz.description}</p>
                <div className="quiz-meta">
                  <span>{quiz.questions?.length || quiz.rules?.count || 0} questions</span>
                  <span>{quiz.total_time} min</span>
                  <span>{quiz.attempts || 0} attempts</span>
                </div>
              </div>
              <div className="quiz-actions">
                <button
                  className={`publish-btn ${quiz.published ? "published" : ""}`}
                  onClick={() =>
                    publishMutation.mutate({ id: quiz._id, published: !quiz.published })
                  }
                >
                  {quiz.published ? <Eye size={16} /> : <EyeOff size={16} />}
                  {quiz.published ? "Published" : "Draft"}
                </button>
                <button onClick={() => deleteMutation.mutate(quiz._id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TEST BUILDER
// ═══════════════════════════════════════════════════════════════════════════════
function TestBuilder({ subject, categories, refetch, subjects }) {
  const [step, setStep] = useState(1);
  const [testInfo, setTestInfo] = useState({
    title: "",
    description: "",
    category: "",
    source: "",
    difficulty: "medium",
    total_time: 30,
  });
  const [questions, setQuestions] = useState([createEmptyQuestion()]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const queryClient = useQueryClient();

  function createEmptyQuestion() {
    return {
      question_text: "",
      choices: [
        { id: "A", text: "", is_correct: true },
        { id: "B", text: "", is_correct: false },
        { id: "C", text: "", is_correct: false },
        { id: "D", text: "", is_correct: false },
      ],
      explanation: "",
    };
  }

  const handleQuestionChange = (field, value) => {
    const updated = [...questions];
    updated[currentQ][field] = value;
    setQuestions(updated);
  };

  const handleChoiceChange = (choiceIdx, field, value) => {
    const updated = [...questions];
    if (field === "is_correct") {
      updated[currentQ].choices.forEach((c, i) => (c.is_correct = i === choiceIdx));
    } else {
      updated[currentQ].choices[choiceIdx][field] = value;
    }
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, createEmptyQuestion()]);
    setCurrentQ(questions.length);
  };

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return;
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    if (currentQ >= updated.length) setCurrentQ(updated.length - 1);
  };

  const duplicateQuestion = (idx) => {
    const copy = JSON.parse(JSON.stringify(questions[idx]));
    copy.question_text = copy.question_text + " (copy)";
    setQuestions([...questions, copy]);
    setCurrentQ(questions.length);
  };

  const handleSubmit = async () => {
    if (!subject || !testInfo.title.trim()) return;
    setIsSubmitting(true);
    setSubmitResult(null);
    try {
      const createdQuestions = [];
      for (const q of questions) {
        if (!q.question_text.trim()) continue;
        const questionData = {
          title: testInfo.title,
          question_text: q.question_text,
          choices: q.choices,
          explanation: q.explanation,
          subject,
          category: testInfo.category || undefined,
          source: testInfo.source,
          difficulty: testInfo.difficulty,
          published: true,
        };
        const res = await adminAPI.createQuestion(questionData);
        const created = res.data?.question || res.data;
        if (created?._id) createdQuestions.push(created._id);
      }
      if (createdQuestions.length > 0) {
        await adminAPI.createQuiz({
          title: testInfo.title,
          description: testInfo.description,
          subject,
          category: testInfo.category || undefined,
          questions: createdQuestions,
          total_time: testInfo.total_time,
          published: true,
        });
      }
      setSubmitResult({ success: true, count: createdQuestions.length });
      queryClient.invalidateQueries(["admin-questions"]);
      queryClient.invalidateQueries(["admin-quizzes"]);
      refetch?.();
    } catch (error) {
      setSubmitResult({ success: false, error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBuilder = () => {
    setStep(1);
    setTestInfo({ title: "", description: "", category: "", source: "", difficulty: "medium", total_time: 30 });
    setQuestions([createEmptyQuestion()]);
    setCurrentQ(0);
    setSubmitResult(null);
  };

  const currentQuestion = questions[currentQ];
  const validQuestions = questions.filter((q) => q.question_text.trim()).length;
  const subjectInfo = subjects?.find((s) => s.id === subject);

  if (!subject) {
    return (
      <div className="empty-state">
        <Layers size={48} />
        <h3>Select a Subject First</h3>
        <p>Choose a subject from the sidebar to start building a test</p>
      </div>
    );
  }

  if (submitResult?.success) {
    return (
      <div className="builder-success">
        <div className="success-content">
          <div className="success-icon"><CheckCircle2 size={64} /></div>
          <h2>Test Created Successfully!</h2>
          <p>Created {submitResult.count} questions and 1 quiz for {subject}</p>
          <button className="btn-primary" onClick={resetBuilder}><Plus size={18} /> Create Another Test</button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-builder">
      <div className="builder-header">
        <div className="header-title">
          <span className="header-icon" style={{ background: subjectInfo?.color + "20", color: subjectInfo?.color }}>
            <Layers size={22} />
          </span>
          <div>
            <h2>Test Builder</h2>
            <p>Create a complete test with multiple questions at once</p>
          </div>
        </div>
        <div className="builder-steps">
          <button className={`step clickable ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`} onClick={() => setStep(1)}>
            <span className="step-num">1</span><span className="step-label">Setup</span>
          </button>
          <div className="step-line" />
          <button className={`step clickable ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`} onClick={() => testInfo.title.trim() && setStep(2)} disabled={!testInfo.title.trim()}>
            <span className="step-num">2</span><span className="step-label">Questions</span>
          </button>
          <div className="step-line" />
          <button className={`step clickable ${step >= 3 ? "active" : ""}`} onClick={() => testInfo.title.trim() && validQuestions > 0 && setStep(3)} disabled={!testInfo.title.trim() || validQuestions === 0}>
            <span className="step-num">3</span><span className="step-label">Review</span>
          </button>
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="builder-step-content">
          <div className="form-card large">
            <div className="form-card-header"><Target size={20} /><h3>Test Information</h3></div>
            <div className="form-group">
              <label>Test Title *</label>
              <input type="text" placeholder="e.g., URT Mathematics 2024" value={testInfo.title} onChange={(e) => setTestInfo({ ...testInfo, title: e.target.value })} autoFocus />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Describe what this test covers..." value={testInfo.description} onChange={(e) => setTestInfo({ ...testInfo, description: e.target.value })} rows={2} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select value={testInfo.category} onChange={(e) => setTestInfo({ ...testInfo, category: e.target.value })}>
                  <option value="">No Category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Source</label>
                <input type="text" placeholder="e.g., URT 2024" value={testInfo.source} onChange={(e) => setTestInfo({ ...testInfo, source: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Time Limit (min)</label>
                <input type="number" value={testInfo.total_time} onChange={(e) => setTestInfo({ ...testInfo, total_time: parseInt(e.target.value) || 30 })} min={5} max={180} />
              </div>
              <div className="form-group">
                <label>Difficulty</label>
                <select value={testInfo.difficulty} onChange={(e) => setTestInfo({ ...testInfo, difficulty: e.target.value })}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={() => setStep(2)} disabled={!testInfo.title.trim()}>Continue to Questions →</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="builder-questions">
          <div className="builder-sidebar-mini">
            <div className="q-list-header">
              <span>Questions ({questions.length})</span>
              <button className="btn-icon" onClick={addQuestion}><Plus size={16} /></button>
            </div>
            <div className="q-list">
              {questions.map((q, idx) => (
                <button key={idx} className={`q-list-item ${idx === currentQ ? "active" : ""} ${q.question_text.trim() ? "filled" : ""}`} onClick={() => setCurrentQ(idx)}>
                  <span className="q-num">{idx + 1}</span>
                  <span className="q-preview">{q.question_text.substring(0, 30) || "Empty question"}</span>
                  {questions.length > 1 && (
                    <button className="q-remove" onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }}><X size={12} /></button>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="builder-editor">
            <div className="editor-toolbar">
              <h3>Question {currentQ + 1}</h3>
              <div className="toolbar-actions">
                <button className="btn-icon" onClick={() => duplicateQuestion(currentQ)} title="Duplicate"><Copy size={16} /></button>
              </div>
            </div>

            <div className="form-group">
              <label>Question Text <span className="label-hint">Use $...$ for LaTeX math</span></label>
              <textarea placeholder="Enter the question..." value={currentQuestion.question_text} onChange={(e) => handleQuestionChange("question_text", e.target.value)} rows={4} dir={subject === 'Arabic' ? 'rtl' : 'ltr'} style={subject === 'Arabic' ? { textAlign: 'right' } : {}} />
            </div>

            <div className="form-group">
              <label>Answer Choices (click ✓ to mark correct)</label>
              <div className="choices-list">
                {currentQuestion.choices.map((choice, idx) => (
                  <div key={choice.id} className={`choice-row ${choice.is_correct ? "correct" : ""}`} style={subject === 'Arabic' ? { direction: 'rtl' } : {}}>
                    <span className="choice-letter">{choice.id}</span>
                    <input type="text" placeholder={`Option ${choice.id}`} value={choice.text} onChange={(e) => handleChoiceChange(idx, "text", e.target.value)} dir={subject === 'Arabic' ? 'rtl' : 'ltr'} style={subject === 'Arabic' ? { textAlign: 'right' } : {}} />
                    <button type="button" className={`correct-btn ${choice.is_correct ? "active" : ""}`} onClick={() => handleChoiceChange(idx, "is_correct", true)}><Check size={16} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Explanation (optional)</label>
              <textarea placeholder="Explain the solution..." value={currentQuestion.explanation} onChange={(e) => handleQuestionChange("explanation", e.target.value)} rows={2} dir={subject === 'Arabic' ? 'rtl' : 'ltr'} style={subject === 'Arabic' ? { textAlign: 'right' } : {}} />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step-actions-bar">
          <button className="btn-secondary" onClick={() => setStep(1)}>← Back to Setup</button>
          <button className="btn-primary" onClick={() => setStep(3)} disabled={validQuestions === 0}>Review & Create ({validQuestions} questions) →</button>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="builder-review">
          <div className="review-card">
            <div className="review-header">
              <div className="review-icon"><FileText size={28} /></div>
              <div><h3>{testInfo.title}</h3><p>{testInfo.description || "No description"}</p></div>
            </div>
            <div className="review-stats">
              <div className="review-stat"><span className="stat-num">{validQuestions}</span><span className="stat-text">Questions</span></div>
              <div className="review-stat"><span className="stat-num">{testInfo.total_time}</span><span className="stat-text">Minutes</span></div>
              <div className="review-stat"><span className="stat-num">{testInfo.difficulty}</span><span className="stat-text">Difficulty</span></div>
            </div>
            <div className="review-details">
              <div className="detail-row"><span>Subject:</span><strong>{subjectInfo?.icon} {subject}</strong></div>
              <div className="detail-row"><span>Category:</span><strong>{categories.find((c) => c._id === testInfo.category)?.name || "None"}</strong></div>
              <div className="detail-row"><span>Source:</span><strong>{testInfo.source || "Not specified"}</strong></div>
            </div>
            <div className="review-questions-preview">
              <h4>Questions Preview</h4>
              {questions.filter((q) => q.question_text.trim()).map((q, idx) => (
                <div key={idx} className="preview-item">
                  <span className="preview-num">{idx + 1}</span>
                  <span className="preview-text">{q.question_text.substring(0, 80)}...</span>
                </div>
              ))}
            </div>
            {submitResult?.error && (
              <div className="error-message"><AlertCircle size={16} />{submitResult.error}</div>
            )}
            <div className="review-actions">
              <button className="btn-secondary" onClick={() => setStep(2)}>← Back to Edit</button>
              <button className="btn-primary large" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : <><CheckCircle2 size={18} /> Create Test ({validQuestions} questions)</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Utility ─────────────────────────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const styles = `
  .admin-dashboard {
    display: flex;
    min-height: 100vh;
    background: var(--bg-primary);
  }

  /* ===== SIDEBAR ===== */
  .admin-sidebar {
    width: 280px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;
    font-weight: 700;
    font-size: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .logo-box {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .sidebar-nav { padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
  .nav-section { margin-bottom: 16px; }
  .nav-label {
    display: block; font-size: 0.7rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--text-tertiary); padding: 8px 12px 6px;
  }

  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 10px; border: none;
    background: transparent; color: var(--text-secondary);
    font-size: 0.9rem; font-weight: 500; cursor: pointer;
    transition: all 0.15s; text-align: left; width: 100%;
  }
  .nav-item:hover { background: var(--bg-tertiary); color: var(--text-primary); }
  .nav-item.active {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
  .nav-badge {
    margin-left: auto; font-size: 0.65rem; font-weight: 600;
    padding: 2px 6px; border-radius: 4px; background: #10b981; color: white;
  }

  .subject-selector {
    padding: 16px;
    border-top: 1px solid var(--border-color);
    flex: 1;
    overflow-y: auto;
  }
  .subject-selector h4 {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--text-tertiary); margin-bottom: 12px;
  }
  .subject-list { display: flex; flex-direction: column; gap: 4px; }
  .subject-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px;
    border: 1px solid transparent; background: transparent;
    color: var(--text-secondary); font-size: 0.85rem;
    cursor: pointer; text-align: left; transition: all 0.15s;
  }
  .subject-btn:hover { background: var(--bg-tertiary); border-color: var(--border-color); }
  .subject-btn.active {
    background: color-mix(in srgb, var(--subject-color) 12%, transparent);
    border-color: var(--subject-color); color: var(--text-primary); font-weight: 500;
  }
  .subject-icon { font-size: 1.1rem; }
  .subject-name { flex: 1; }
  .subject-count {
    font-size: 0.7rem; font-weight: 600; padding: 2px 6px;
    border-radius: 4px; background: var(--bg-tertiary); color: var(--text-tertiary);
  }
  .subject-check { color: var(--subject-color); }
  .loading-text { padding: 12px; font-size: 0.8rem; color: var(--text-tertiary); }

  .sidebar-stats {
    padding: 16px; border-top: 1px solid var(--border-color);
    display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  }
  .stat-box {
    display: flex; align-items: center; gap: 8px;
    padding: 10px; border-radius: 8px; background: var(--bg-tertiary);
  }
  .stat-box svg { color: var(--text-tertiary); }
  .stat-value { font-weight: 700; font-size: 1.1rem; display: block; }
  .stat-label { font-size: 0.7rem; color: var(--text-tertiary); }

  /* ===== MAIN ===== */
  .admin-main { flex: 1; padding: 24px 32px; overflow-y: auto; max-height: 100vh; }

  /* ===== OVERVIEW ===== */
  .overview-panel { max-width: 1400px; }
  .panel-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 24px;
  }
  .panel-header h1 { font-size: 1.6rem; font-weight: 700; margin-bottom: 4px; }
  .panel-header p { color: var(--text-tertiary); font-size: 0.9rem; }

  .btn-refresh {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 8px; border: 1px solid var(--border-color);
    background: var(--bg-secondary); color: var(--text-secondary);
    font-size: 0.8rem; cursor: pointer; transition: all 0.15s;
  }
  .btn-refresh:hover { background: var(--bg-tertiary); color: var(--text-primary); }

  /* Stat Cards */
  .stat-cards {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
  }
  .stat-cards.six { grid-template-columns: repeat(3, 1fr); }
  .stat-card {
    padding: 20px; border-radius: 14px;
    background: var(--bg-secondary); border: 1px solid var(--border-color);
    position: relative; overflow: hidden; transition: transform 0.15s, box-shadow 0.15s;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: var(--card-color);
  }
  .stat-card-icon {
    width: 40px; height: 40px; border-radius: 10px; display: flex;
    align-items: center; justify-content: center; margin-bottom: 12px;
    background: color-mix(in srgb, var(--card-color) 15%, transparent);
    color: var(--card-color);
  }
  .stat-card-value { font-size: 1.8rem; font-weight: 800; display: block; line-height: 1.1; }
  .stat-card-label {
    font-size: 0.8rem; color: var(--text-tertiary); font-weight: 500;
    display: block; margin-top: 2px;
  }
  .stat-card-sub {
    font-size: 0.7rem; color: var(--text-tertiary); margin-top: 8px; display: block;
  }

  /* Charts */
  .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .charts-row:has(.wide) { grid-template-columns: 1.6fr 1fr; }
  .chart-card {
    background: var(--bg-secondary); border: 1px solid var(--border-color);
    border-radius: 14px; padding: 20px; min-height: 280px;
  }
  .chart-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
  }
  .chart-header h3 {
    font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; gap: 8px;
  }
  .chart-subtitle { font-size: 0.75rem; color: var(--text-tertiary); }
  .chart-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 40px; color: var(--text-tertiary); text-align: center; gap: 8px;
  }
  .chart-empty.small { padding: 20px; }
  .chart-empty p { font-size: 0.8rem; max-width: 260px; }

  /* Subject Bars */
  .subject-bars { display: flex; flex-direction: column; gap: 10px; }
  .subject-bar-row { display: flex; align-items: center; gap: 10px; }
  .subject-bar-info { display: flex; align-items: center; gap: 6px; min-width: 110px; }
  .subject-bar-icon { font-size: 1rem; }
  .subject-bar-name { font-size: 0.8rem; font-weight: 500; }
  .subject-bar-track { flex: 1; height: 8px; border-radius: 4px; background: var(--bg-tertiary); overflow: hidden; }
  .subject-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; min-width: 4px; }
  .subject-bar-value { font-size: 0.8rem; font-weight: 600; min-width: 40px; text-align: right; }

  /* Donut */
  .donut-chart-area { display: flex; align-items: center; gap: 24px; }
  .donut-ring {
    width: 140px; height: 140px; border-radius: 50%; position: relative;
    background: conic-gradient(
      var(--easy-pct, 33%) 0% var(--easy-end, 33%),
      var(--med-pct, 33%) var(--easy-end, 33%) var(--med-end, 66%),
      var(--hard-pct, 34%) var(--med-end, 66%) 100%
    );
    display: flex; align-items: center; justify-content: center;
  }
  .donut-center {
    width: 80px; height: 80px; border-radius: 50%;
    background: var(--bg-secondary); display: flex; flex-direction: column;
    align-items: center; justify-content: center; z-index: 1;
  }
  .donut-total { font-size: 1.4rem; font-weight: 800; }
  .donut-label { font-size: 0.7rem; color: var(--text-tertiary); }
  .donut-legend { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .legend-item { display: flex; align-items: center; gap: 8px; }
  .legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
  .legend-name { font-size: 0.8rem; font-weight: 500; text-transform: capitalize; }
  .legend-val { font-size: 0.75rem; color: var(--text-tertiary); margin-left: auto; }

  /* Bar Chart */
  .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 180px; padding-top: 10px; }
  .bar-chart.scrollable { overflow-x: auto; }
  .bar-item { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 36px; height: 100%; }
  .bar {
    width: 100%; max-width: 40px; border-radius: 6px 6px 0 0;
    background: linear-gradient(180deg, #6366f1, #8b5cf6);
    position: relative; transition: height 0.5s ease;
    display: flex; align-items: flex-start; justify-content: center;
  }
  .bar-value {
    font-size: 0.65rem; font-weight: 600; color: white;
    padding-top: 4px; opacity: 0.9;
  }
  .bar-label { font-size: 0.65rem; color: var(--text-tertiary); margin-top: 6px; white-space: nowrap; }

  /* Top List */
  .top-list { display: flex; flex-direction: column; gap: 8px; }
  .top-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 10px; background: var(--bg-tertiary);
  }
  .top-rank { font-size: 0.9rem; font-weight: 700; color: var(--text-tertiary); min-width: 28px; }
  .top-info { flex: 1; min-width: 0; }
  .top-name { font-size: 0.85rem; font-weight: 500; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .top-meta { font-size: 0.7rem; color: var(--text-tertiary); }
  .top-stats { text-align: right; }
  .top-attempts { font-size: 0.8rem; font-weight: 600; display: block; }
  .top-score { font-size: 0.7rem; color: var(--text-tertiary); }

  /* Recent List */
  .recent-list { display: flex; flex-direction: column; gap: 6px; }
  .recent-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border-color); }
  .recent-item:last-child { border-bottom: none; }
  .recent-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .recent-info { flex: 1; min-width: 0; }
  .recent-title { font-size: 0.8rem; font-weight: 500; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .recent-meta { font-size: 0.7rem; color: var(--text-tertiary); }
  .user-avatar-mini {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white; font-size: 0.7rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  /* Quick Actions */
  .recent-section { margin-bottom: 24px; }
  .section-header { margin-bottom: 12px; }
  .section-header h3 { font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .quick-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .quick-action-btn {
    display: flex; flex-direction: column; align-items: center;
    gap: 8px; padding: 20px; border-radius: 12px;
    border: 1px dashed var(--border-color); background: var(--bg-secondary);
    color: var(--text-secondary); font-size: 0.85rem; cursor: pointer;
    transition: all 0.15s;
  }
  .quick-action-btn:hover {
    border-color: #6366f1; color: #6366f1;
    background: color-mix(in srgb, #6366f1 5%, var(--bg-secondary));
  }

  /* Skeleton */
  .loading-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .skeleton-card {
    height: 140px; border-radius: 14px;
    background: var(--bg-secondary); border: 1px solid var(--border-color);
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

  /* ===== USERS PANEL ===== */
  .filters-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .filter-pills { display: flex; gap: 6px; align-items: center; }
  .filter-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 20px; border: 1px solid var(--border-color);
    background: var(--bg-secondary); color: var(--text-secondary);
    font-size: 0.8rem; cursor: pointer; transition: all 0.15s;
  }
  .filter-pill.active { background: #6366f1; color: white; border-color: #6366f1; }
  .pill-count {
    font-size: 0.7rem; font-weight: 600; padding: 1px 5px;
    border-radius: 8px; background: rgba(255,255,255,0.15);
  }
  .filter-pill:not(.active) .pill-count { background: var(--bg-tertiary); }

  .users-table-wrapper { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border-color); }
  .users-table { width: 100%; border-collapse: collapse; }
  .users-table th {
    padding: 12px 16px; text-align: left; font-size: 0.75rem;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
    color: var(--text-tertiary); background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-color);
  }
  .users-table td { padding: 12px 16px; border-bottom: 1px solid var(--border-color); }
  .users-table tr:hover { background: var(--bg-tertiary); }
  .user-cell { display: flex; align-items: center; gap: 10px; }
  .user-name { font-weight: 500; font-size: 0.85rem; }
  .user-email { font-size: 0.75rem; color: var(--text-tertiary); }
  .date-cell { font-size: 0.8rem; color: var(--text-tertiary); }
  .role-badge {
    font-size: 0.7rem; font-weight: 600; padding: 3px 8px;
    border-radius: 6px; text-transform: capitalize;
  }
  .role-badge.admin { background: #ef444420; color: #ef4444; }
  .role-badge.editor { background: #f59e0b20; color: #f59e0b; }
  .role-badge.user { background: #6366f120; color: #6366f1; }
  .status-badge {
    font-size: 0.7rem; font-weight: 600; padding: 3px 8px; border-radius: 6px;
  }
  .status-badge.active { background: #10b98120; color: #10b981; }
  .status-badge.inactive { background: #ef444420; color: #ef4444; }

  /* ===== USER MANAGEMENT EXTRAS ===== */

  /* Inline role select */
  .role-select {
    font-size: 0.75rem; font-weight: 600; padding: 4px 8px;
    border-radius: 6px; border: 1px solid transparent;
    cursor: pointer; text-transform: capitalize;
    background: #6366f120; color: #6366f1;
    transition: all 0.15s; appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 4px center;
    padding-right: 20px;
  }
  .role-select.admin { background-color: #ef444420; color: #ef4444;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  }
  .role-select.editor { background-color: #f59e0b20; color: #f59e0b;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23f59e0b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  }
  .role-select:hover { border-color: currentColor; }
  .role-select option { background: var(--bg-primary); color: var(--text-primary); }

  /* Status toggle */
  .status-toggle {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.75rem; font-weight: 600; padding: 4px 10px;
    border-radius: 6px; border: 1px solid transparent;
    cursor: pointer; transition: all 0.15s;
  }
  .status-toggle.active { background: #10b98120; color: #10b981; }
  .status-toggle.active:hover { background: #10b98140; border-color: #10b981; }
  .status-toggle.inactive { background: #ef444420; color: #ef4444; }
  .status-toggle.inactive:hover { background: #ef444440; border-color: #ef4444; }
  .status-dot {
    width: 7px; height: 7px; border-radius: 50%; background: currentColor;
  }

  /* Score cell */
  .score-cell { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }

  /* Table action buttons */
  .table-actions {
    display: flex; gap: 4px; justify-content: flex-end;
  }
  .action-btn {
    width: 30px; height: 30px; display: flex; align-items: center;
    justify-content: center; border-radius: 7px;
    border: 1px solid var(--border-color); background: transparent;
    color: var(--text-tertiary); cursor: pointer; transition: all 0.15s;
  }
  .action-btn.view:hover { color: #6366f1; border-color: #6366f1; background: #6366f108; }
  .action-btn.edit:hover { color: #f59e0b; border-color: #f59e0b; background: #f59e0b08; }
  .action-btn.key:hover { color: #8b5cf6; border-color: #8b5cf6; background: #8b5cf608; }
  .action-btn.delete:hover { color: #ef4444; border-color: #ef4444; background: #ef444408; }

  /* Table footer */
  .table-footer {
    padding: 10px 16px; font-size: 0.75rem; color: var(--text-tertiary);
    border-top: 1px solid var(--border-color); background: var(--bg-tertiary);
    text-align: center;
  }

  /* Sort select */
  .sort-select {
    font-size: 0.8rem; padding: 6px 12px; border-radius: 8px;
    border: 1px solid var(--border-color); background: var(--bg-secondary);
    color: var(--text-primary); cursor: pointer; min-width: 140px;
  }

  /* Avatar coloring by role */
  .user-avatar-mini.admin { background: linear-gradient(135deg, #ef4444, #f97316); }
  .user-avatar-mini.editor { background: linear-gradient(135deg, #f59e0b, #eab308); }
  .user-avatar-mini.user { background: linear-gradient(135deg, #6366f1, #8b5cf6); }

  /* User detail panel */
  .user-detail-grid {
    display: grid; grid-template-columns: 280px 1fr; gap: 20px; margin-top: 20px;
  }
  .user-detail-card {
    background: var(--bg-secondary); border: 1px solid var(--border-color);
    border-radius: 14px; padding: 24px; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .user-detail-avatar {
    width: 64px; height: 64px; border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 1.5rem; font-weight: 700; margin-bottom: 8px;
  }
  .user-detail-card h3 { font-size: 1.1rem; font-weight: 700; }
  .user-detail-email { font-size: 0.8rem; color: var(--text-tertiary); }
  .user-detail-bio { font-size: 0.8rem; color: var(--text-secondary); margin-top: 10px; line-height: 1.4; }
  .user-detail-dept { font-size: 0.75rem; color: var(--text-tertiary); }
  .user-detail-meta {
    display: flex; flex-direction: column; gap: 6px; margin-top: 12px;
    font-size: 0.75rem; color: var(--text-tertiary);
  }
  .user-detail-meta div { display: flex; align-items: center; gap: 6px; }

  .user-stats-card {
    background: var(--bg-secondary); border: 1px solid var(--border-color);
    border-radius: 14px; padding: 24px;
  }
  .user-stats-card h4 { font-size: 0.95rem; font-weight: 700; margin-bottom: 16px; }
  .user-stats-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  }
  .user-stat-item {
    text-align: center; padding: 14px 8px; border-radius: 10px;
    background: var(--bg-tertiary);
  }
  .user-stat-val { display: block; font-size: 1.2rem; font-weight: 700; color: var(--text-primary); }
  .user-stat-lbl { font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.03em; }

  .user-quick-actions { margin-top: 20px; }
  .user-quick-actions h4 { font-size: 0.95rem; font-weight: 700; margin-bottom: 12px; }
  .user-action-btns { display: flex; gap: 8px; flex-wrap: wrap; }

  /* Danger button */
  .btn-danger {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 8px;
    background: #ef4444; color: white; border: none;
    font-size: 0.82rem; font-weight: 500; cursor: pointer;
    transition: all 0.15s;
  }
  .btn-danger:hover { background: #dc2626; }
  .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ===== MODALS ===== */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; backdrop-filter: blur(4px);
  }
  .modal-card {
    background: var(--bg-primary); border: 1px solid var(--border-color);
    border-radius: 16px; width: 100%; max-width: 460px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    animation: modalIn 0.2s ease;
  }
  .modal-card.modal-danger { border-color: #ef444440; }
  @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 20px; border-bottom: 1px solid var(--border-color);
  }
  .modal-header h3 { font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
  .modal-header.danger h3 { color: #ef4444; }
  .modal-close {
    background: transparent; border: none; color: var(--text-tertiary);
    cursor: pointer; padding: 4px; border-radius: 6px;
  }
  .modal-close:hover { background: var(--bg-tertiary); }
  .modal-body { padding: 20px; }
  .modal-body p { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.5; }
  .modal-label {
    display: block; font-size: 0.75rem; font-weight: 600;
    color: var(--text-tertiary); margin-bottom: 6px; margin-top: 12px;
    text-transform: uppercase; letter-spacing: 0.04em;
  }
  .modal-input {
    width: 100%; padding: 10px 12px; border-radius: 8px;
    border: 1px solid var(--border-color); background: var(--bg-secondary);
    color: var(--text-primary); font-size: 0.85rem;
    transition: border-color 0.15s; box-sizing: border-box;
  }
  .modal-input:focus { outline: none; border-color: #6366f1; }
  .modal-textarea { resize: vertical; min-height: 70px; font-family: inherit; }
  .modal-warning {
    font-size: 0.8rem !important; color: #ef4444 !important;
    background: #ef444410; padding: 10px 12px; border-radius: 8px;
    border: 1px solid #ef444420; margin-top: 8px;
  }
  .modal-error {
    margin-top: 12px; padding: 10px 12px; border-radius: 8px;
    background: #ef444415; color: #ef4444; font-size: 0.8rem;
    border: 1px solid #ef444420;
  }
  .modal-success {
    margin-top: 12px; padding: 10px 12px; border-radius: 8px;
    background: #10b98115; color: #10b981; font-size: 0.8rem;
    border: 1px solid #10b98120;
  }
  .modal-footer {
    display: flex; justify-content: flex-end; gap: 8px;
    padding: 16px 20px; border-top: 1px solid var(--border-color);
  }

  /* ===== CONTENT PANELS ===== */
  .manager-panel { max-width: 1200px; }
  .panel-header h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 2px; }
  .panel-header p { color: var(--text-tertiary); font-size: 0.85rem; }
  .empty-state {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 60px 20px; text-align: center;
    color: var(--text-tertiary); gap: 12px;
  }
  .empty-state h3 { font-size: 1.1rem; color: var(--text-primary); }
  .empty-state p { font-size: 0.85rem; }

  .btn-primary {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 18px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white; font-weight: 600; font-size: 0.85rem;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(99,102,241,0.3); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-primary.large { padding: 12px 24px; font-size: 0.95rem; }

  .btn-secondary {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 18px; border-radius: 10px;
    border: 1px solid var(--border-color); background: var(--bg-secondary);
    color: var(--text-secondary); font-weight: 500; font-size: 0.85rem;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-secondary:hover { background: var(--bg-tertiary); color: var(--text-primary); }

  .btn-icon {
    width: 32px; height: 32px; display: flex; align-items: center;
    justify-content: center; border-radius: 8px; border: 1px solid var(--border-color);
    background: var(--bg-secondary); color: var(--text-secondary);
    cursor: pointer; transition: all 0.15s;
  }
  .btn-icon:hover { background: var(--bg-tertiary); color: var(--text-primary); }

  /* Forms */
  .create-form {
    display: flex; flex-direction: column; gap: 12px;
    padding: 20px; background: var(--bg-secondary);
    border: 1px solid var(--border-color); border-radius: 12px;
    margin-bottom: 20px;
  }
  .create-form input, .create-form textarea,
  .question-form input, .question-form textarea, .question-form select,
  .form-card input, .form-card textarea, .form-card select,
  .builder-editor input, .builder-editor textarea, .builder-editor select {
    width: 100%; padding: 10px 14px; border: 1px solid var(--border-color);
    border-radius: 8px; background: var(--bg-primary); color: var(--text-primary);
    font-size: 0.9rem; transition: border-color 0.15s; box-sizing: border-box;
  }
  .create-form input:focus, .question-form input:focus, .question-form textarea:focus, .question-form select:focus,
  .form-card input:focus, .form-card textarea:focus, .form-card select:focus,
  .builder-editor input:focus, .builder-editor textarea:focus, .builder-editor select:focus {
    outline: none; border-color: #6366f1;
  }
  .form-actions { display: flex; gap: 10px; margin-top: 8px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }
  .label-hint { font-weight: 400; color: var(--text-tertiary); }
  .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; }
  .form-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
  .form-card.large { max-width: 700px; width: 100%; }
  .form-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
  .form-card-header h3 { font-size: 1.1rem; font-weight: 600; }

  .search-bar {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px; border-radius: 10px;
    border: 1px solid var(--border-color); background: var(--bg-secondary);
    margin-bottom: 20px; flex: 1;
  }
  .search-bar svg { color: var(--text-tertiary); flex-shrink: 0; }
  .search-bar input {
    flex: 1; border: none; background: transparent;
    color: var(--text-primary); font-size: 0.9rem; outline: none;
  }

  .question-form {
    padding: 20px; background: var(--bg-secondary);
    border: 1px solid var(--border-color); border-radius: 12px;
    margin-bottom: 20px; display: flex; flex-direction: column; gap: 16px;
  }
  .question-form h3 { font-size: 1rem; font-weight: 600; }

  .choices-list { display: flex; flex-direction: column; gap: 8px; }
  .choice-row {
    display: flex; align-items: center; gap: 8px;
    padding: 4px; border-radius: 8px; transition: background 0.15s;
  }
  .choice-row.correct { background: rgba(16, 185, 129, 0.08); }
  .choice-letter {
    width: 28px; height: 28px; display: flex; align-items: center;
    justify-content: center; border-radius: 6px; font-size: 0.8rem;
    font-weight: 600; background: var(--bg-tertiary); color: var(--text-secondary);
  }
  .correct-btn {
    width: 32px; height: 32px; display: flex; align-items: center;
    justify-content: center; border-radius: 8px; border: 1px solid var(--border-color);
    background: transparent; color: var(--text-tertiary); cursor: pointer;
    transition: all 0.15s;
  }
  .correct-btn.active { background: #10b981; color: white; border-color: #10b981; }

  /* Categories */
  .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
  .category-card {
    padding: 16px; border-radius: 12px;
    border: 1px solid var(--border-color); background: var(--bg-secondary);
    cursor: pointer; transition: all 0.15s;
  }
  .category-card:hover { border-color: #6366f1; transform: translateY(-1px); }
  .category-card.selected { border-color: #6366f1; background: rgba(99, 102, 241, 0.05); }
  .category-header { display: flex; align-items: center; gap: 12px; }
  .category-info { flex: 1; }
  .category-info h4 { font-size: 0.9rem; font-weight: 600; }
  .category-info span { font-size: 0.75rem; color: var(--text-tertiary); }
  .category-actions button {
    background: transparent; border: none; color: var(--text-tertiary);
    cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.15s;
  }
  .category-actions button:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
  .category-desc { font-size: 0.8rem; color: var(--text-tertiary); margin-top: 8px; }

  /* Questions List */
  .questions-list { display: flex; flex-direction: column; gap: 8px; }
  .question-card {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 16px; border-radius: 12px;
    border: 1px solid var(--border-color); background: var(--bg-secondary);
    transition: border-color 0.15s;
  }
  .question-card:hover { border-color: var(--text-tertiary); }
  .question-content { flex: 1; min-width: 0; }
  .question-content h4 { font-size: 0.9rem; font-weight: 600; margin-bottom: 4px; }
  .question-text { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; }
  .question-meta { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
  .difficulty {
    font-size: 0.7rem; font-weight: 600; padding: 2px 8px;
    border-radius: 4px; text-transform: capitalize;
  }
  .difficulty.easy { background: #10b98120; color: #10b981; }
  .difficulty.medium { background: #f59e0b20; color: #f59e0b; }
  .difficulty.hard { background: #ef444420; color: #ef4444; }
  .source { font-size: 0.7rem; color: var(--text-tertiary); padding: 2px 8px; background: var(--bg-tertiary); border-radius: 4px; }
  .status { display: flex; align-items: center; gap: 4px; font-size: 0.7rem; font-weight: 500; }
  .status.published { color: #10b981; }
  .status.draft { color: #f59e0b; }
  .question-actions { display: flex; gap: 6px; }
  .question-actions button {
    width: 32px; height: 32px; display: flex; align-items: center;
    justify-content: center; border-radius: 8px;
    border: 1px solid var(--border-color); background: transparent;
    color: var(--text-tertiary); cursor: pointer; transition: all 0.15s;
  }
  .question-actions button:hover { color: #6366f1; border-color: #6366f1; }
  .question-actions button:last-child:hover { color: #ef4444; border-color: #ef4444; }
  .empty-message { padding: 40px; text-align: center; color: var(--text-tertiary); }

  /* Quizzes */
  .quizzes-list { display: flex; flex-direction: column; gap: 8px; }
  .quiz-card {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px; border-radius: 12px;
    border: 1px solid var(--border-color); background: var(--bg-secondary);
  }
  .quiz-content { flex: 1; }
  .quiz-content h4 { font-size: 0.9rem; font-weight: 600; }
  .quiz-content p { font-size: 0.8rem; color: var(--text-tertiary); margin-top: 2px; }
  .quiz-meta { display: flex; gap: 12px; margin-top: 6px; font-size: 0.75rem; color: var(--text-tertiary); }
  .quiz-actions { display: flex; gap: 8px; }
  .publish-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 8px;
    border: 1px solid var(--border-color); background: var(--bg-secondary);
    color: var(--text-tertiary); font-size: 0.8rem; cursor: pointer;
  }
  .publish-btn.published { color: #10b981; border-color: #10b981; }

  /* Test Builder */
  .test-builder { max-width: 1200px; }
  .test-builder h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 2px; }
  .test-builder > .builder-header p { color: var(--text-tertiary); font-size: 0.85rem; }
  .builder-header { margin-bottom: 24px; }
  .header-title { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
  .header-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
  .builder-steps { display: flex; align-items: center; gap: 8px; }
  .step { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; background: var(--bg-tertiary); color: var(--text-tertiary); font-size: 0.8rem; border: none; }
  .step.clickable { cursor: pointer; transition: all 0.15s; }
  .step.clickable:hover:not(:disabled) { background: var(--bg-secondary); box-shadow: 0 0 0 1px var(--border-color); }
  .step.clickable:disabled { cursor: not-allowed; opacity: 0.5; }
  .step.active { background: #6366f1; color: white; }
  .step.active.clickable:hover { background: #5558e6; }
  .step.completed { background: #10b981; color: white; }
  .step.completed.clickable:hover { background: #0ea573; }
  .step-num { font-weight: 700; }
  .step-label { font-weight: 500; }
  .step-line { width: 30px; height: 2px; background: var(--border-color); }

  .builder-step-content { display: flex; justify-content: center; width: 100%; }
  .builder-questions { display: grid; grid-template-columns: 220px 1fr; gap: 20px; }
  .builder-sidebar-mini { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; height: fit-content; }
  .q-list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 0.8rem; font-weight: 600; }
  .q-list { display: flex; flex-direction: column; gap: 4px; max-height: 400px; overflow-y: auto; }
  .q-list-item {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 10px; border-radius: 8px; border: none;
    background: transparent; cursor: pointer; text-align: left;
    font-size: 0.8rem; color: var(--text-secondary); width: 100%; transition: all 0.15s;
  }
  .q-list-item.active { background: #6366f120; color: #6366f1; }
  .q-list-item.filled .q-num { background: #10b981; color: white; }
  .q-num {
    width: 22px; height: 22px; border-radius: 6px; display: flex;
    align-items: center; justify-content: center;
    background: var(--bg-tertiary); font-size: 0.7rem; font-weight: 600;
    flex-shrink: 0;
  }
  .q-preview { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .q-remove { background: transparent; border: none; color: var(--text-tertiary); cursor: pointer; padding: 2px; }
  .q-remove:hover { color: #ef4444; }
  .builder-editor { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
  .editor-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .toolbar-actions { display: flex; gap: 6px; }
  .step-actions-bar { display: flex; justify-content: space-between; margin-top: 16px; }

  .builder-review { display: flex; justify-content: center; }
  .review-card { max-width: 600px; width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 14px; padding: 24px; }
  .review-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
  .review-icon {
    width: 48px; height: 48px; border-radius: 12px; display: flex;
    align-items: center; justify-content: center;
    background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;
  }
  .review-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
  .review-stat { text-align: center; padding: 12px; border-radius: 10px; background: var(--bg-tertiary); }
  .stat-num { font-size: 1.3rem; font-weight: 700; display: block; }
  .stat-text { font-size: 0.75rem; color: var(--text-tertiary); }
  .review-details { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
  .detail-row { display: flex; justify-content: space-between; font-size: 0.85rem; }
  .review-questions-preview { margin-bottom: 16px; }
  .review-questions-preview h4 { font-size: 0.85rem; margin-bottom: 8px; }
  .preview-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 0.8rem; }
  .preview-num {
    width: 24px; height: 24px; border-radius: 6px; display: flex;
    align-items: center; justify-content: center;
    background: var(--bg-tertiary); font-size: 0.7rem; font-weight: 600;
  }
  .preview-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-secondary); }
  .review-actions { display: flex; justify-content: space-between; gap: 12px; }
  .error-message {
    display: flex; align-items: center; gap: 8px; padding: 10px 14px;
    background: #ef444420; color: #ef4444; border-radius: 8px;
    font-size: 0.85rem; margin-bottom: 12px;
  }

  .builder-success {
    display: flex; align-items: center; justify-content: center; min-height: 400px;
  }
  .success-content { text-align: center; }
  .success-icon { color: #10b981; margin-bottom: 16px; }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 1100px) {
    .stat-cards.six { grid-template-columns: repeat(2, 1fr); }
    .charts-row { grid-template-columns: 1fr; }
    .charts-row:has(.wide) { grid-template-columns: 1fr; }
    .quick-actions { grid-template-columns: repeat(2, 1fr); }
    .user-detail-grid { grid-template-columns: 1fr; }
    .user-stats-grid { grid-template-columns: repeat(3, 1fr); }
  }

  @media (max-width: 860px) {
    .admin-sidebar { width: 60px; overflow: hidden; }
    .sidebar-header span, .nav-label, .nav-item span,
    .nav-badge, .subject-selector, .sidebar-stats { display: none; }
    .nav-item { justify-content: center; padding: 12px; }
    .admin-main { padding: 16px; }
    .stat-cards, .stat-cards.six { grid-template-columns: 1fr 1fr; }
    .builder-questions { grid-template-columns: 1fr; }
    .user-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .table-actions { gap: 2px; }
    .action-btn { width: 26px; height: 26px; }
    .filters-row { flex-direction: column; }
    .user-action-btns { flex-direction: column; }
    .modal-card { margin: 16px; max-width: calc(100% - 32px); }
  }
`;
