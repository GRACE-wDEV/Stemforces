import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ToastContainer from "./components/common/ToastContainer";

/* ── Lazy-loaded pages (route-level code splitting) ── */
const HomePage = lazy(() => import("./pages/HomePage"));
const BrowsePage = lazy(() => import("./pages/BrowsePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const QuizReviewPage = lazy(() => import("./pages/QuizReviewPage"));
const CustomQuizPage = lazy(() => import("./pages/CustomQuizPage"));
const QuestionsPage = lazy(() => import("./pages/QuestionsPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const DailyChallengePage = lazy(() => import("./pages/DailyChallengePage"));
const BattlePage = lazy(() => import("./pages/BattlePage"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AITutorChat = lazy(() => import("./components/ai/AITutorChat"));

/* ── Minimal route-transition spinner ── */
function PageLoader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{
        width: 36, height: 36, border: "3px solid rgba(99,102,241,.15)",
        borderTopColor: "#6366f1", borderRadius: "50%",
        animation: "spin .6s linear infinite"
      }} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Navbar />
        <main className="fade-in">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/quiz/:subjectId/:topicId" element={<QuizPage />} />
              <Route path="/quiz/:quizId/review" element={<QuizReviewPage />} />
              <Route path="/quiz/custom" element={<CustomQuizPage />} />
              <Route path="/quiz/random" element={<CustomQuizPage />} />
              <Route path="/questions/:subject/:source" element={<QuestionsPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/daily-challenge" element={<DailyChallengePage />} />
              <Route path="/battle" element={<BattlePage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route
                path="/profile"
                element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
              />
              <Route
                path="/admin/*"
                element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>}
              />
            </Routes>
          </Suspense>
        </main>

        {/* Global AI Tutor — lazy loaded */}
        <Suspense fallback={null}>
          <AITutorChat />
        </Suspense>

        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}
