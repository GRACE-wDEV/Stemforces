import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import QuestionsPage from "./pages/QuestionsPage";
import QuizPage from "./pages/QuizPage";
import QuizReviewPage from "./pages/QuizReviewPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import DailyChallengePage from "./pages/DailyChallengePage";
import BattlePage from "./pages/BattlePage";
import AchievementsPage from "./pages/AchievementsPage";
import AITutorChat from "./components/ai/AITutorChat";
import BrowsePage from "./pages/BrowsePage";
import CustomQuizPage from "./pages/CustomQuizPage";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ToastContainer from "./components/common/ToastContainer";

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Navbar />
        <main className="fade-in">
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
            
            {/* New Gamification Routes */}
            <Route path="/daily-challenge" element={<DailyChallengePage />} />
            <Route path="/battle" element={<BattlePage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            
            <Route
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        
        {/* Global AI Tutor Chat */}
        <AITutorChat />
        
        {/* Toast Notifications */}
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}
