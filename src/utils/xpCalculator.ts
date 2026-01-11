/**
 * Calculate user level from total XP
 * Formula: level = floor(sqrt(xpTotal / 100))
 * 
 * @param xpTotal - Total XP points
 * @returns User level (integer)
 */
export function calculateLevel(xpTotal: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xpTotal) / 100))
}

/**
 * Calculate XP required for a given level
 * Formula: xp = (level^2) * 100
 * 
 * @param level - Target level
 * @returns XP required to reach that level
 */
export function xpForLevel(level: number): number {
  return Math.pow(level, 2) * 100
}

/**
 * Calculate XP progress to next level
 * 
 * @param xpTotal - Current total XP
 * @returns Object with current level, XP in current level, and XP needed for next level
 */
export function getLevelProgress(xpTotal: number): {
  currentLevel: number
  xpInCurrentLevel: number
  xpForNextLevel: number
  progressPercent: number
} {
  const currentLevel = calculateLevel(xpTotal)
  const xpForCurrentLevel = xpForLevel(currentLevel)
  const xpForNextLevel = xpForLevel(currentLevel + 1)
  const xpInCurrentLevel = xpTotal - xpForCurrentLevel
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel
  const progressPercent = xpNeededForNext > 0 
    ? (xpInCurrentLevel / xpNeededForNext) * 100 
    : 100
  
  return {
    currentLevel,
    xpInCurrentLevel,
    xpForNextLevel: xpNeededForNext,
    progressPercent: Math.min(100, Math.max(0, progressPercent))
  }
}
