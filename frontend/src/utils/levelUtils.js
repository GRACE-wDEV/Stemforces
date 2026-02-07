// Shared level and XP calculation utilities
// Single source of truth for level calculations across the app

export const XP_PER_LEVEL = 100; // XP required per level

/**
 * Calculate user level from XP
 * @param {number} xp - Total XP
 * @returns {number} - Current level (1-based)
 */
export function calculateLevel(xp) {
  return Math.floor((xp || 0) / XP_PER_LEVEL) + 1;
}

/**
 * Get XP required for a specific level
 * @param {number} level - Target level
 * @returns {number} - Total XP needed to reach that level
 */
export function getXPForLevel(level) {
  return (level - 1) * XP_PER_LEVEL;
}

/**
 * Get progress towards next level
 * @param {number} currentXP - User's current XP
 * @returns {{progress: number, required: number, percentage: number, currentLevel: number, nextLevel: number}}
 */
export function getLevelProgress(currentXP) {
  const xp = currentXP || 0;
  const currentLevel = calculateLevel(xp);
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpProgress = xp - xpForCurrentLevel;
  
  return {
    progress: xpProgress,
    required: XP_PER_LEVEL,
    percentage: Math.min((xpProgress / XP_PER_LEVEL) * 100, 100),
    currentLevel,
    nextLevel: currentLevel + 1
  };
}

/**
 * Format XP for display (e.g., 1500 -> "1.5K")
 * @param {number} xp - XP value
 * @returns {string} - Formatted string
 */
export function formatXP(xp) {
  if (xp >= 1000000) {
    return (xp / 1000000).toFixed(1) + 'M';
  }
  if (xp >= 1000) {
    return (xp / 1000).toFixed(1) + 'K';
  }
  return String(xp || 0);
}

/**
 * Level titles inspired by Codeforces ranking system.
 * Thresholds are intentionally stretched for a meaningful grind.
 *
 *  Lvl 1-4     Newbie                     (gray)
 *  Lvl 5-9     Pupil                      (green)
 *  Lvl 10-17   Apprentice                 (teal)
 *  Lvl 18-27   Specialist                 (cyan)
 *  Lvl 28-39   Intermediate               (blue)
 *  Lvl 40-54   Expert                     (blue-violet)
 *  Lvl 55-74   Candidate Master           (purple)
 *  Lvl 75-99   Master                     (orange)
 *  Lvl 100-139 Grandmaster                (red-orange)
 *  Lvl 140-199 International Grandmaster  (red)
 *  Lvl 200+    Legendary Grandmaster      (deep red)
 */
export function getLevelTitle(level) {
  if (level >= 200) return 'Legendary Grandmaster';
  if (level >= 140) return 'International Grandmaster';
  if (level >= 100) return 'Grandmaster';
  if (level >= 75)  return 'Master';
  if (level >= 55)  return 'Candidate Master';
  if (level >= 40)  return 'Expert';
  if (level >= 28)  return 'Intermediate';
  if (level >= 18)  return 'Specialist';
  if (level >= 10)  return 'Apprentice';
  if (level >= 5)   return 'Pupil';
  return 'Newbie';
}

/**
 * Get level color matching Codeforces rank colors
 * @param {number} level - Current level
 * @returns {string} - CSS color value
 */
export function getLevelColor(level) {
  if (level >= 200) return '#aa0000'; // Deep red – Legendary GM
  if (level >= 140) return '#dc2626'; // Red – International GM
  if (level >= 100) return '#ef4444'; // Red-orange – GM
  if (level >= 75)  return '#f97316'; // Orange – Master
  if (level >= 55)  return '#a855f7'; // Purple – Candidate Master
  if (level >= 40)  return '#7c3aed'; // Blue-violet – Expert
  if (level >= 28)  return '#3b82f6'; // Blue – Intermediate
  if (level >= 18)  return '#06b6d4'; // Cyan – Specialist
  if (level >= 10)  return '#14b8a6'; // Teal – Apprentice
  if (level >= 5)   return '#22c55e'; // Green – Pupil
  return '#6b7280'; // Gray – Newbie
}
