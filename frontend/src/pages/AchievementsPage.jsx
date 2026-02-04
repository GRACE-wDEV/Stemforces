import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import api from "../api/axios";

const ACHIEVEMENTS = [
  // XP & Level
  { id: 'first_steps', name: 'First Steps', description: 'Complete your first quiz', icon: '🎯', category: 'progress', xp: 50, requirement: 1 },
  { id: 'dedicated_learner', name: 'Dedicated Learner', description: 'Answer 100 questions', icon: '📚', category: 'progress', xp: 100, requirement: 100 },
  { id: 'knowledge_seeker', name: 'Knowledge Seeker', description: 'Answer 500 questions', icon: '🧠', category: 'progress', xp: 250, requirement: 500 },
  { id: 'master_scholar', name: 'Master Scholar', description: 'Answer 1000 questions', icon: '🎓', category: 'progress', xp: 500, requirement: 1000 },
  
  // Streaks
  { id: 'on_fire', name: 'On Fire', description: '3 day streak', icon: '🔥', category: 'streak', xp: 75, requirement: 3 },
  { id: 'unstoppable', name: 'Unstoppable', description: '7 day streak', icon: '⚡', category: 'streak', xp: 150, requirement: 7 },
  { id: 'legendary_streak', name: 'Legendary', description: '30 day streak', icon: '🌟', category: 'streak', xp: 500, requirement: 30 },
  
  // Accuracy
  { id: 'sharp_shooter', name: 'Sharp Shooter', description: '80%+ accuracy on a quiz', icon: '🎯', category: 'accuracy', xp: 50, requirement: 80 },
  { id: 'perfectionist', name: 'Perfectionist', description: '100% on any quiz', icon: '💯', category: 'accuracy', xp: 100, requirement: 100 },
  { id: 'consistent', name: 'Consistent', description: 'Maintain 75%+ average accuracy', icon: '📊', category: 'accuracy', xp: 200, requirement: 75 },
  
  // Battles
  { id: 'first_blood', name: 'First Blood', description: 'Win your first battle', icon: '⚔️', category: 'battle', xp: 50, requirement: 1 },
  { id: 'warrior', name: 'Warrior', description: 'Win 10 battles', icon: '🏆', category: 'battle', xp: 150, requirement: 10 },
  { id: 'champion', name: 'Champion', description: 'Win 50 battles', icon: '👑', category: 'battle', xp: 400, requirement: 50 },
  { id: 'undefeated', name: 'Undefeated', description: 'Win 5 battles in a row', icon: '💪', category: 'battle', xp: 200, requirement: 5 },
  
  // Subjects
  { id: 'math_whiz', name: 'Math Whiz', description: '90%+ on 5 Math quizzes', icon: '📐', category: 'subject', xp: 100, requirement: 5 },
  { id: 'physics_pro', name: 'Physics Pro', description: '90%+ on 5 Physics quizzes', icon: '⚛️', category: 'subject', xp: 100, requirement: 5 },
  { id: 'chemistry_king', name: 'Chemistry King', description: '90%+ on 5 Chemistry quizzes', icon: '🧪', category: 'subject', xp: 100, requirement: 5 },
  { id: 'bio_boss', name: 'Bio Boss', description: '90%+ on 5 Biology quizzes', icon: '🧬', category: 'subject', xp: 100, requirement: 5 },
  { id: 'all_rounder', name: 'All-Rounder', description: 'Complete quizzes in all 4 subjects', icon: '🌈', category: 'subject', xp: 200, requirement: 4 },
  
  // Special
  { id: 'speed_demon', name: 'Speed Demon', description: 'Finish a quiz in under 2 minutes', icon: '💨', category: 'special', xp: 75, requirement: 1 },
  { id: 'night_owl', name: 'Night Owl', description: 'Study after midnight', icon: '🦉', category: 'special', xp: 25, requirement: 1 },
  { id: 'early_bird', name: 'Early Bird', description: 'Study before 6 AM', icon: '🐦', category: 'special', xp: 25, requirement: 1 },
  { id: 'ai_friend', name: 'AI Friend', description: 'Use AI tutor 10 times', icon: '🤖', category: 'special', xp: 50, requirement: 10 },
];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🏅' },
  { id: 'progress', name: 'Progress', icon: '📈' },
  { id: 'streak', name: 'Streak', icon: '🔥' },
  { id: 'accuracy', name: 'Accuracy', icon: '🎯' },
  { id: 'battle', name: 'Battle', icon: '⚔️' },
  { id: 'subject', name: 'Subject', icon: '📚' },
  { id: 'special', name: 'Special', icon: '✨' },
];

export default function AchievementsPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [, setProgress] = useState({});
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // Fetch user's earned and locked badges from backend
        const res = await api.get('/achievements/badges');
        if (res?.data?.success) {
          const payload = res.data.data || {};
          const earned = (payload.earned || []).map(b => b.id || b.achievement_type || b);
          setUnlockedAchievements(earned);
          // keep progress info if provided by API
          setProgress(payload.stats || {});
        } else {
          // fallback to empty
          setUnlockedAchievements([]);
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchAchievements();
    else setLoading(false);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="page-container centered">
        <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
          <div className="icon-large">🏅</div>
          <h3>Login Required</h3>
          <p className="text-secondary">Sign in to view your achievements!</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate("/login")}>Login</button>
        </div>
      </div>
    );
  }

  const filteredAchievements = selectedCategory === 'all' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(a => a.category === selectedCategory);

  const totalXP = unlockedAchievements.reduce((sum, id) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    return sum + (achievement?.xp || 0);
  }, 0);

  return (
    <div className="page-container achievements-page">
      {/* Header */}
      <div className="achievements-header">
        <div className="header-info">
          <h1>🏅 Achievements</h1>
          <p className="text-secondary">Track your progress and unlock rewards</p>
        </div>
        
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{unlockedAchievements.length}</span>
            <span className="stat-label">Unlocked</span>
          </div>
          <div className="stat">
            <span className="stat-value">{ACHIEVEMENTS.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat highlight">
            <span className="stat-value">+{totalXP}</span>
            <span className="stat-label">XP Earned</span>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="progress-overview">
        <div className="progress-bar-container">
          <div className="progress-info">
            <span>Achievement Progress</span>
            <span>{Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
          >
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-name">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="achievements-grid">
        {filteredAchievements.map((achievement, idx) => {
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          
          return (
            <div 
              key={achievement.id}
              className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-info">
                <h3>{achievement.name}</h3>
                <p>{achievement.description}</p>
                <span className="achievement-xp">+{achievement.xp} XP</span>
              </div>
              {isUnlocked ? (
                <span className="unlock-badge">✓</span>
              ) : (
                <span className="lock-icon">🔒</span>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .achievements-page { max-width: 1000px; margin: 0 auto; }
        .centered { min-height: 60vh; display: flex; align-items: center; justify-content: center; }
        .icon-large { font-size: 64px; margin-bottom: 16px; }
        
        .achievements-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .header-info h1 { margin: 0 0 4px; }
        .header-stats { display: flex; gap: 16px; }
        .stat { display: flex; flex-direction: column; align-items: center; padding: 16px 24px; background: var(--bg-secondary); border-radius: 12px; min-width: 80px; }
        .stat.highlight { background: linear-gradient(135deg, var(--primary), #a855f7); color: white; }
        .stat-value { font-size: 24px; font-weight: 700; }
        .stat-label { font-size: 12px; color: var(--text-secondary); }
        .stat.highlight .stat-label { color: rgba(255, 255, 255, 0.8); }
        
        .progress-overview { margin-bottom: 24px; }
        .progress-bar-container { background: var(--bg-secondary); padding: 20px; border-radius: 12px; }
        .progress-info { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .progress-bar { height: 12px; background: var(--bg-tertiary); border-radius: 6px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #22c55e, #16a34a); transition: width 0.5s ease; }
        
        .category-tabs { display: flex; gap: 8px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 8px; }
        .category-tab { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 30px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .category-tab:hover { border-color: var(--primary); }
        .category-tab.active { background: var(--primary); border-color: var(--primary); color: white; }
        .cat-icon { font-size: 16px; }
        .cat-name { font-weight: 500; font-size: 14px; }
        
        .achievements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        
        .achievement-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; position: relative; transition: all 0.2s; animation: fadeSlideUp 0.3s ease forwards; opacity: 0; }
        
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .achievement-card.unlocked { border-color: #22c55e; background: rgba(34, 197, 94, 0.05); }
        .achievement-card.unlocked:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(34, 197, 94, 0.1); }
        
        .achievement-card.locked { opacity: 0.6; }
        .achievement-card.locked .achievement-icon { filter: grayscale(1); }
        
        .achievement-icon { font-size: 40px; flex-shrink: 0; }
        
        .achievement-info { flex: 1; }
        .achievement-info h3 { margin: 0 0 4px; font-size: 16px; }
        .achievement-info p { margin: 0 0 8px; font-size: 13px; color: var(--text-secondary); }
        .achievement-xp { font-size: 12px; font-weight: 600; color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 4px 10px; border-radius: 20px; }
        
        .unlock-badge { position: absolute; top: 12px; right: 12px; width: 28px; height: 28px; background: #22c55e; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        
        .lock-icon { position: absolute; top: 12px; right: 12px; font-size: 20px; }
        
        @media (max-width: 640px) {
          .achievements-header { flex-direction: column; align-items: flex-start; }
          .achievements-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
