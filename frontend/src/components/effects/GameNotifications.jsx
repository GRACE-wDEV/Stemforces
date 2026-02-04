import React, { useEffect, useState } from 'react';
import { Star, Zap, Trophy, Flame, Award } from 'lucide-react';

// XP Gained Animation
export function XPGainedToast({ amount, multiplier = 1, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-24 right-4 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 shadow-2xl flex items-center gap-3 min-w-[200px]">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <Star className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <div className="text-white text-sm font-medium">XP Earned!</div>
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            +{amount}
            {multiplier > 1 && (
              <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
                {multiplier}x
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Level Up Animation
export function LevelUpOverlay({ newLevel, onClose }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onClose?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center animate-bounce-in">
        {/* Glowing ring effect */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping">
            <div className="w-40 h-40 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-50"></div>
          </div>
          <div className="relative w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/50">
            <span className="text-6xl font-bold text-white">{newLevel}</span>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-white mb-2 animate-pulse">
          LEVEL UP!
        </h1>
        <p className="text-xl text-yellow-200">
          You've reached Level {newLevel}!
        </p>
        
        {/* Sparkles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-yellow-400 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${Math.random() * 20 + 10}px`
              }}
            >
              ✨
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Achievement Unlocked Toast
export function AchievementUnlockedToast({ achievement, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-24 right-4 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 shadow-2xl min-w-[300px] border border-purple-400/30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl animate-bounce">
            {achievement.icon}
          </div>
          <div className="flex-1">
            <div className="text-purple-200 text-sm font-medium flex items-center gap-1">
              <Award className="w-4 h-4" />
              Achievement Unlocked!
            </div>
            <div className="text-xl font-bold text-white">{achievement.title}</div>
            <div className="text-purple-200 text-sm">{achievement.description}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-purple-200 px-2 py-1 bg-white/10 rounded-full uppercase">
            {achievement.rarity}
          </span>
          <span className="text-yellow-400 font-bold flex items-center gap-1">
            <Star className="w-4 h-4" />
            +{achievement.xp} XP
          </span>
        </div>
      </div>
    </div>
  );
}

// Streak Reminder
export function StreakReminder({ streak, isActiveToday, onDismiss }) {
  const [show, setShow] = useState(!isActiveToday);

  if (!show || isActiveToday) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold">Keep your streak alive!</h4>
            <p className="text-orange-100 text-sm">
              {streak > 0 
                ? `You're on a ${streak}-day streak! Complete a quiz or daily challenge to keep it going.`
                : 'Start your streak today by completing a quiz!'}
            </p>
          </div>
          <button 
            onClick={() => { setShow(false); onDismiss?.(); }}
            className="text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="mt-3 flex gap-2">
          <a 
            href="/daily-challenge"
            className="flex-1 py-2 bg-white text-orange-600 rounded-xl font-bold text-center text-sm hover:bg-orange-50 transition-colors"
          >
            Daily Challenge
          </a>
          <a 
            href="/"
            className="flex-1 py-2 bg-white/20 text-white rounded-xl font-bold text-center text-sm hover:bg-white/30 transition-colors"
          >
            Quick Quiz
          </a>
        </div>
      </div>
    </div>
  );
}

// Combo Multiplier Display (for quiz streaks)
export function ComboMultiplier({ combo, maxCombo = 10 }) {
  const percentage = Math.min((combo / maxCombo) * 100, 100);
  
  const getComboColor = () => {
    if (combo >= 10) return 'from-purple-500 to-pink-500';
    if (combo >= 7) return 'from-orange-500 to-red-500';
    if (combo >= 5) return 'from-yellow-500 to-orange-500';
    if (combo >= 3) return 'from-green-500 to-emerald-500';
    return 'from-blue-500 to-cyan-500';
  };

  if (combo < 2) return null;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-40 animate-bounce-in`}>
      <div className={`bg-gradient-to-r ${getComboColor()} px-6 py-3 rounded-full shadow-2xl flex items-center gap-3`}>
        <Zap className="w-6 h-6 text-white animate-pulse" />
        <div>
          <div className="text-white font-bold text-xl">{combo}x COMBO</div>
        </div>
        <div className="w-20 h-2 bg-white/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Points Popup (floats up from element)
export function PointsPopup({ points, x, y, type = 'correct' }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const colors = {
    correct: 'text-green-400',
    wrong: 'text-red-400',
    bonus: 'text-yellow-400',
    combo: 'text-purple-400'
  };

  return (
    <div 
      className={`fixed pointer-events-none z-50 text-3xl font-bold ${colors[type]} animate-float-up`}
      style={{ left: x, top: y }}
    >
      {type === 'correct' && '+'}
      {type === 'wrong' && '-'}
      {points}
    </div>
  );
}
