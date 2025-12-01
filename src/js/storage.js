// 本地存储工具：负责最高分和游戏统计数据的读写。
const STORAGE_KEYS = {
  highScore: 'snake_high_score',
  totalGames: 'snake_total_games',
  totalScore: 'snake_total_score',
};

export function loadHighScore() {
  const value = Number(localStorage.getItem(STORAGE_KEYS.highScore));
  return Number.isFinite(value) ? value : 0;
}

export function saveHighScore(score) {
  localStorage.setItem(STORAGE_KEYS.highScore, String(score));
}

export function recordGameStats(score) {
  const totalGames = Number(localStorage.getItem(STORAGE_KEYS.totalGames)) || 0;
  const totalScore = Number(localStorage.getItem(STORAGE_KEYS.totalScore)) || 0;
  localStorage.setItem(STORAGE_KEYS.totalGames, String(totalGames + 1));
  localStorage.setItem(STORAGE_KEYS.totalScore, String(totalScore + score));
}

export function getGameStats() {
  return {
    totalGames: Number(localStorage.getItem(STORAGE_KEYS.totalGames)) || 0,
    totalScore: Number(localStorage.getItem(STORAGE_KEYS.totalScore)) || 0,
  };
}
