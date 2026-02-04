import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { getStudyRecommendations } from "../api/ai";
import api from "../api/axios";
import LaTeXRenderer from "../components/common/LaTeXRenderer";
import { calculateLevel, getLevelProgress } from "../utils/levelUtils";
import { useToast } from "../stores/toastStore";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  
  // API Key management state
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [validatingKey, setValidatingKey] = useState(false);

  // Check if user has API key on mount
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const res = await api.get('/auth/me/api-key/status');
        setHasApiKey(res.data.hasApiKey);
      } catch (err) {
        console.error('Failed to check API key status', err);
      }
    };
    if (user) checkApiKey();
  }, [user]);

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch comprehensive stats from the new endpoint
        const [statsRes, badgesRes] = await Promise.allSettled([
          api.get('/auth/me/stats'),
          api.get('/achievements/badges')
        ]);

        const statsData = statsRes.status === 'fulfilled' ? statsRes.value.data?.data : null;
        const badgesData = badgesRes.status === 'fulfilled' ? badgesRes.value.data?.data : null;

        setStats({
          streak: {
            currentStreak: statsData?.currentStreak || 0,
            longestStreak: statsData?.longestStreak || 0
          },
          badges: badgesData?.earned || [],
          xp: statsData?.totalXP || user?.score || 0,
          questionsAnswered: statsData?.totalQuestions || 0,
          accuracy: statsData?.accuracy || 0,
          quizzesCompleted: statsData?.quizzesCompleted || 0,
          subjectProgress: statsData?.subjectProgress || [],
          level: statsData?.level || 1
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({
          streak: { currentStreak: 0, longestStreak: 0 },
          badges: [],
          xp: user?.score || 0,
          questionsAnswered: 0,
          accuracy: 0,
          quizzesCompleted: 0,
          subjectProgress: [],
          level: 1
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user]);

  // Fetch AI study recommendations
  const fetchRecommendations = async () => {
    if (recommendations || loadingRecs) return;
    
    setLoadingRecs(true);
    try {
      const performanceData = {
        subjects: ['Math', 'Physics', 'Chemistry', 'Biology'],
        accuracy: stats?.accuracy || 0,
        questionsAnswered: stats?.questionsAnswered || 0,
        weakTopics: user?.weakTopics || [],
        strongTopics: user?.strongTopics || []
      };
      
      const response = await getStudyRecommendations(performanceData);
      if (response.success) {
        setRecommendations(response.data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecs(false);
    }
  };

  // Load recommendations when switching to that tab
  useEffect(() => {
    if (activeTab === 'recommendations') {
      fetchRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Fetch recent activities when overview tab active
  useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const res = await api.get('/auth/me/activities');
        setActivities(res.data.activities || []);
      } catch (err) {
        console.error('Failed to fetch activities', err);
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };

    if (activeTab === 'overview') fetchActivities();
  }, [activeTab]);

  if (!user) {
    return (
      <div className="page-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
          <h3 style={{ marginBottom: 8 }}>Please Login</h3>
          <p className="text-secondary" style={{ marginBottom: 24 }}>
            You need to be logged in to view your profile.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/login")}>
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

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      const res = await api.put('/auth/me', { name: editedName });
      useAuthStore.getState().updateProfile({ name: res.data.name });
      setIsEditing(false);
      success('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile', err);
      showError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle saving API key
  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      showError('Please enter an API key');
      return;
    }
    
    setSavingApiKey(true);
    setValidatingKey(true);
    
    try {
      // First validate the key
      const validateRes = await api.post('/ai/validate-key', { apiKey: apiKeyInput });
      
      if (!validateRes.data.success) {
        showError(validateRes.data.message || 'Invalid API key');
        setValidatingKey(false);
        setSavingApiKey(false);
        return;
      }
      
      setValidatingKey(false);
      
      // Save the key
      await api.put('/auth/me/api-key', { apiKey: apiKeyInput });
      
      setHasApiKey(true);
      setShowApiKeyInput(false);
      setApiKeyInput('');
      success('Gemini API key saved successfully! AI features are now enabled.');
    } catch (err) {
      console.error('Failed to save API key', err);
      showError('Failed to save API key. Please try again.');
    } finally {
      setSavingApiKey(false);
      setValidatingKey(false);
    }
  };

  // Handle removing API key
  const handleRemoveApiKey = async () => {
    try {
      await api.put('/auth/me/api-key', { apiKey: null });
      setHasApiKey(false);
      success('API key removed');
    } catch (err) {
      console.error('Failed to remove API key', err);
      showError('Failed to remove API key');
    }
  };

  const level = calculateLevel(stats?.xp || user?.score || 0);
  const levelProgress = getLevelProgress(stats?.xp || user?.score || 0);

  return (
    <div className="page-container">
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Profile Header */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="profile-header">
            <div className="profile-avatar">
              <span>{user.name?.charAt(0)?.toUpperCase() || '?'}</span>
              <div className="level-badge">Lv.{level}</div>
            </div>
            
            <div className="profile-info">
              {isEditing ? (
                <div className="edit-name">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="input-field"
                    style={{ marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 style={{ margin: 0 }}>{user.name}</h1>
                    <button 
                      className="icon-btn"
                      onClick={() => setIsEditing(true)}
                      title="Edit name"
                    >
                      ✏️
                    </button>
                  </div>
                  <p className="text-secondary" style={{ margin: '4px 0 0' }}>{user.email}</p>
                </>
              )}
              
              {/* XP Progress Bar */}
              <div className="xp-progress" style={{ marginTop: 16 }}>
                <div className="xp-header">
                  <span className="xp-label">Level {level}</span>
                  <span className="xp-value">{levelProgress.progress} / {levelProgress.required} XP</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${levelProgress.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            <button className="btn btn-danger" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{stats?.streak?.currentStreak || 0}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-value">{stats?.xp || 0}</div>
            <div className="stat-label">Total XP</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-value">{stats?.questionsAnswered || 0}</div>
            <div className="stat-label">Questions</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats?.quizzesCompleted || 0}</div>
            <div className="stat-label">Quizzes</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{stats?.accuracy || 0}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 24 }}>
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </button>
          <button 
            className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            🤖 AI Recommendations
          </button>
          <button 
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Recent Activity</h3>
            <div className="activity-list">
              {loadingActivities ? (
                <div className="loading-state">Loading activities...</div>
              ) : activities.length === 0 ? (
                <div className="empty-state">No recent activity. Take a quiz to get started!</div>
              ) : (
                activities.map((act, idx) => (
                  <div className="activity-item" key={idx}>
                    <span className="activity-icon">
                      {act.type === 'achievement' ? (act.icon || '🏆') : '📚'}
                    </span>
                    <div className="activity-content">
                      <p>{act.title}</p>
                      <span className="text-secondary">{act.subtitle || ''}{act.xp ? ` • +${act.xp} XP` : ''}</span>
                    </div>
                    <span className="activity-time">{new Date(act.time).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Your Badges</h3>
            {stats?.badges?.length > 0 ? (
              <div className="badges-grid">
                {stats.badges.map((badge, idx) => (
                  <div key={idx} className="badge-card">
                    <span className="badge-icon">{badge.icon || '🏅'}</span>
                    <span className="badge-name">{badge.name}</span>
                    <span className="badge-desc text-secondary">{badge.description}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span style={{ fontSize: 48 }}>🎖️</span>
                <p>No badges yet. Keep learning to earn achievements!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>🤖</span>
              <h3 style={{ margin: 0 }}>AI Study Recommendations</h3>
            </div>
            
            {!hasApiKey ? (
              <div className="empty-state">
                <span style={{ fontSize: 48, marginBottom: 16, display: 'block' }}>🔑</span>
                <p style={{ marginBottom: 16 }}>Add your Gemini API key in Settings to unlock AI features!</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('settings')}>
                  Go to Settings
                </button>
              </div>
            ) : loadingRecs ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>AI is analyzing your performance...</p>
              </div>
            ) : recommendations ? (
              <div className="recommendations-content">
                <LaTeXRenderer content={recommendations} />
              </div>
            ) : (
              <div className="empty-state">
                <button className="btn btn-primary" onClick={fetchRecommendations}>
                  Get Personalized Recommendations
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card">
            <h3 style={{ marginBottom: 24 }}>⚙️ Settings</h3>
            
            {/* Gemini API Key Section */}
            <div className="settings-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>🤖</span>
                <div>
                  <h4 style={{ margin: 0 }}>Gemini API Key</h4>
                  <p className="text-secondary" style={{ margin: '4px 0 0', fontSize: 13 }}>
                    Enable AI features with your free Google Gemini API key
                  </p>
                </div>
              </div>
              
              {hasApiKey && !showApiKeyInput ? (
                <div className="api-key-status">
                  <div className="status-badge status-success">
                    <span>✅</span> API Key Configured
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowApiKeyInput(true)}
                    >
                      Update Key
                    </button>
                    <button 
                      className="btn btn-danger-outline"
                      onClick={handleRemoveApiKey}
                    >
                      Remove Key
                    </button>
                  </div>
                </div>
              ) : (
                <div className="api-key-input-section">
                  {!showApiKeyInput && !hasApiKey && (
                    <div className="api-key-info">
                      <div className="info-box">
                        <p><strong>🎉 Get your FREE API key:</strong></p>
                        <ol style={{ margin: '12px 0', paddingLeft: 20 }}>
                          <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="link">Google AI Studio</a></li>
                          <li>Sign in with your Google account</li>
                          <li>Click "Create API Key"</li>
                          <li>Copy and paste it below</li>
                        </ol>
                        <p className="text-secondary" style={{ fontSize: 12 }}>
                          It's completely free with generous limits!
                        </p>
                      </div>
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowApiKeyInput(true)}
                        style={{ marginTop: 16 }}
                      >
                        Add API Key
                      </button>
                    </div>
                  )}
                  
                  {showApiKeyInput && (
                    <div className="api-key-form">
                      <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Paste your Gemini API key here..."
                        className="input-field"
                        style={{ marginBottom: 12 }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                          className="btn btn-primary"
                          onClick={handleSaveApiKey}
                          disabled={savingApiKey || !apiKeyInput.trim()}
                        >
                          {validatingKey ? 'Validating...' : savingApiKey ? 'Saving...' : 'Save Key'}
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowApiKeyInput(false);
                            setApiKeyInput('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .profile-header {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          flex-wrap: wrap;
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, var(--primary) 0%, #a855f7 100%);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          font-weight: 700;
          color: white;
          position: relative;
          flex-shrink: 0;
        }

        .level-badge {
          position: absolute;
          bottom: -8px;
          right: -8px;
          background: var(--bg-primary);
          border: 2px solid var(--primary);
          color: var(--primary);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .profile-info {
          flex: 1;
          min-width: 200px;
        }

        .profile-info h1 {
          font-size: 24px;
        }

        .icon-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 6px 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: var(--bg-tertiary);
        }

        .xp-progress {
          max-width: 300px;
        }

        .xp-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 12px;
        }

        .xp-label {
          font-weight: 600;
          color: var(--text-primary);
        }

        .xp-value {
          color: var(--text-secondary);
        }

        .progress-bar {
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), #a855f7);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .btn-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
          margin-left: auto;
        }

        .btn-danger:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .stat-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          transition: all 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          border-color: var(--primary);
        }

        .stat-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .tabs {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: var(--bg-secondary);
          border-radius: 12px;
          width: fit-content;
        }

        .tab {
          padding: 10px 20px;
          background: none;
          border: none;
          border-radius: 8px;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab:hover {
          color: var(--text-primary);
        }

        .tab.active {
          background: var(--bg-primary);
          color: var(--text-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          background: var(--bg-secondary);
          border-radius: 12px;
        }

        .activity-icon {
          font-size: 24px;
        }

        .activity-content {
          flex: 1;
        }

        .activity-content p {
          margin: 0;
          font-weight: 500;
        }

        .activity-content span {
          font-size: 13px;
        }

        .activity-time {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 16px;
        }

        .badge-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 12px;
          gap: 8px;
        }

        .badge-icon {
          font-size: 36px;
        }

        .badge-name {
          font-weight: 600;
          font-size: 14px;
        }

        .badge-desc {
          font-size: 12px;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
        }

        .loading-state {
          text-align: center;
          padding: 40px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--bg-tertiary);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .recommendations-content {
          line-height: 1.7;
        }

        .recommendations-content p {
          margin: 0 0 12px;
        }

        .recommendations-content ul {
          margin: 0 0 12px;
          padding-left: 20px;
        }

        /* Settings Styles */
        .settings-section {
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
        }

        .status-success {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .btn-danger-outline {
          background: transparent;
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .btn-danger-outline:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .info-box {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
        }

        .info-box ol {
          color: var(--text-secondary);
        }

        .info-box li {
          margin-bottom: 8px;
        }

        .link {
          color: var(--primary);
          text-decoration: none;
        }

        .link:hover {
          text-decoration: underline;
        }

        .input-field {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 14px;
        }

        .input-field:focus {
          outline: none;
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}
