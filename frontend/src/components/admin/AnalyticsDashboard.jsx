import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, Clock, Activity, AlertCircle } from "lucide-react";
import { adminAPI } from "../../api/admin.js";

const AnalyticsDashboard = () => {
  // Fetch real dashboard stats
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ["admin-analytics-dashboard"],
    queryFn: async () => {
      const response = await adminAPI.getDashboardStats();
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Loading analytics data...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Failed to load analytics data
          </p>
        </div>
        <div className="card">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.response?.status === 401 
                ? "Authentication required - please login as admin/editor"
                : error.response?.status === 403
                ? "Access denied - admin/editor role required"
                : error.response?.data?.message || "Unable to fetch analytics data"}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use real data from API
  const analyticsData = {
    totalQuestions: statsData?.stats?.total_questions || 0,
    publishedQuestions: statsData?.stats?.published_questions || 0,
    draftQuestions: statsData?.stats?.draft_questions || 0,
    recentQuestions: statsData?.recent_questions?.length || 0,
    popularSubjects: statsData?.questions_by_subject || [],
    questionsByDifficulty: statsData?.questions_by_difficulty || [],
    recentActivity: statsData?.recent_questions || []
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor user engagement and quiz performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Questions"
          value={analyticsData.totalQuestions}
          icon={BarChart3}
          color="blue"
        />
        <MetricCard
          title="Published Questions"
          value={analyticsData.publishedQuestions}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Draft Questions"
          value={analyticsData.draftQuestions}
          icon={Clock}
          color="yellow"
        />
        <MetricCard
          title="Recent Activity"
          value={analyticsData.recentQuestions}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Subjects */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Questions by Subject
          </h3>
          <div className="space-y-3">
            {analyticsData.popularSubjects.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item._id}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${analyticsData.totalQuestions > 0 ? (item.count / analyticsData.totalQuestions) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
            {analyticsData.popularSubjects.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No subject data available
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {activity.user}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.action} - {activity.subject}
                    {activity.score && ` (${activity.score}%)`}
                  </p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Over Time
        </h3>
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              Chart integration coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color }) => {
  const IconComponent = icon;
  const colorClasses = {
    blue: "bg-blue-500 text-blue-100",
    green: "bg-green-500 text-green-100",
    purple: "bg-purple-500 text-purple-100",
    yellow: "bg-yellow-500 text-yellow-100",
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {IconComponent && <IconComponent className="w-6 h-6" />}
          </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;