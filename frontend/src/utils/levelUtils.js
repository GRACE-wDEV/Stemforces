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
 * Get level title based on level number
 * @param {number} level - Current level
 * @returns {string} - Level title
 */
export function getLevelTitle(level) {
  if (level >= 50) return 'Master Scholar';
  if (level >= 40) return 'Expert';
  if (level >= 30) return 'Advanced';
  if (level >= 20) return 'Proficient';
  if (level >= 10) return 'Intermediate';
  if (level >= 5) return 'Apprentice';
  return 'Beginner';
}

/**
 * Get level color for styling
 * @param {number} level - Current level
 * @returns {string} - CSS color value
 */
export function getLevelColor(level) {
  if (level >= 50) return '#f59e0b'; // Gold
  if (level >= 30) return '#a855f7'; // Purple
  if (level >= 20) return '#3b82f6'; // Blue
  if (level >= 10) return '#10b981'; // Green
  return '#6b7280'; // Gray
}
