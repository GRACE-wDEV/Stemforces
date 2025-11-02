import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Plus,
  FileText,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3
} from "lucide-react";
import { adminAPI } from "../api/admin.js";
import { useAuthStore } from "../stores/authStore.js";
import { useAdminStore } from "../stores/adminStore.js";
import QuestionManagement from "../components/admin/QuestionManagement.jsx";
import QuizManagement from "../components/admin/QuizManagement.jsx";
import UserManagement from "../components/admin/UserManagement.jsx";
import AnalyticsDashboard from "../components/admin/AnalyticsDashboard.jsx";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuthStore();
  const { setDashboardStats, dashboardStats } = useAdminStore();

  // fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const response = await adminAPI.getDashboardStats();
      return response.data;
    },
    onSuccess: (data) => {
      setDashboardStats(data);
    },
  });

  const stats = dashboardStats || statsData;

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "questions", label: "Questions", icon: BookOpen },
    { id: "quizzes", label: "Quizzes", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    ...(user?.role === "admin" ? [{ id: "users", label: "Users", icon: Users }] : []),
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab stats={stats} loading={statsLoading} />;
      case "questions":
        return <QuestionManagement />;
      case "quizzes":
        return <QuizManagement />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "users":
        return <UserManagement />;
      default:
        return <OverviewTab stats={stats} loading={statsLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage questions, quizzes, and monitor system performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Logged in as <strong>{user?.name}</strong> ({user?.role})
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="fade-in">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Questions",
      value: stats?.stats?.total_questions || 0,
      icon: BookOpen,
      color: "blue",
      subtitle: "All questions in database"
    },
    {
      title: "Published Questions", 
      value: stats?.stats?.published_questions || 0,
      icon: CheckCircle2,
      color: "green",
      subtitle: "Live and accessible"
    },
    {
      title: "Draft Questions",
      value: stats?.stats?.draft_questions || 0,
      icon: Clock,
      color: "yellow",
      subtitle: "Pending publication"
    },
    {
      title: "Recent Activity",
      value: stats?.recent_questions?.length || 0,
      icon: Activity,
      color: "purple",
      subtitle: "Questions added recently"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: "bg-blue-500 text-blue-100",
            green: "bg-green-500 text-green-100", 
            yellow: "bg-yellow-500 text-yellow-100",
            purple: "bg-purple-500 text-purple-100"
          };

          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questions by Subject */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Questions by Subject
          </h3>
          <div className="space-y-3">
            {stats?.questions_by_subject?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item._id}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(item.count / (stats?.stats?.total_questions || 1)) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Questions by Difficulty */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Questions by Difficulty
          </h3>
          <div className="space-y-3">
            {stats?.questions_by_difficulty?.map((item, index) => {
              const colors = {
                easy: "bg-green-500",
                medium: "bg-yellow-500", 
                hard: "bg-red-500"
              };
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {item._id}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[item._id] || 'bg-gray-500'}`}
                        style={{
                          width: `${(item.count / (stats?.stats?.total_questions || 1)) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                      {item.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Questions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Questions
          </h3>
          <button
            onClick={() => window.location.hash = '#questions'}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View all →
          </button>
        </div>
        <div className="space-y-3">
          {stats?.recent_questions?.map((question, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {question.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {question.subject} • {question.difficulty} • By {question.created_by?.name}
                </p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(question.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
          {(!stats?.recent_questions || stats.recent_questions.length === 0) && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No recent questions found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;