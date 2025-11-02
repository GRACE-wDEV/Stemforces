import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Trophy, 
  Target, 
  Calendar, 
  Settings, 
  LogOut,
  Edit3,
  Save,
  X,
  BookOpen,
  Award,
  TrendingUp
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import api from "../api/axios";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center card max-w-md">
          <User className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Please Login</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">You need to be logged in to view your profile.</p>
          <button 
            onClick={() => navigate("/login")}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSaveEdit = () => {
    const save = async () => {
      try {
        setIsSaving(true);
        const res = await api.put('/auth/me', { name: editedName });
        useAuthStore.getState().updateProfile({ name: res.data.name });
        setIsEditing(false);
        // (theres no global toast; ill use alert for now)
        alert('Profile updated');
      } catch (err) {
        console.error('Failed to update profile', err);
        alert(err.response?.data?.message || 'Failed to update profile');
      } finally {
        setIsSaving(false);
      }
    };

    save();
  };

  const handleCancelEdit = () => {
    setEditedName(user.name);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* header */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r  to-black rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your account and track your progress</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* left column - user info */}
          <div className="lg:col-span-2 space-y-6">
            {/* personal info */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${isSaving ? 'bg-green-400 text-white cursor-wait' : 'bg-green-600 text-white hover:bg-green-700'}`}
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="form-input"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <p className="text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member Since</label>
                    <p className="text-gray-900 dark:text-white">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* recent activity */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Completed Math Quiz</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Scored 85% on a URT past exam</p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</span>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Achievement Unlocked</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">First 10 questions answered correctly</p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">1 day ago</span>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Ranking Improved</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Moved up 5 positions on leaderboard</p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">3 days ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* right column - stats */}
          <div className="space-y-6">
            {/* score card */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.score || 0}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Total Points</p>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((user.score || 0) / 1000 * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Next milestone: 1000 points</p>
            </div>

            {/* quick stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-600 dark:text-gray-300">Questions Answered</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">0</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-gray-600 dark:text-gray-300">Accuracy Rate</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">0%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-gray-600 dark:text-gray-300">Current Streak</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">0 days</span>
                </div>
              </div>
            </div>

            {/* settings */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-200">Preferences</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-200">Privacy Settings</span>
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
