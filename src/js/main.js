import { CONFIG } from './config.js';
import { GAME_STATE, SnakeGame } from './game.js';
import { Renderer } from './renderer.js';
import { InputManager } from './input.js';
import { getGameStats } from './storage.js';

// DOM 元素获取
const canvas = document.getElementById('game-canvas');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const lengthEl = document.getElementById('length');
const speedSlider = document.getElementById('speed');
const speedLabel = document.getElementById('speed-label');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const statusEl = document.getElementById('status');
const tooltipEl = document.getElementById('tooltip');
const statsEl = document.getElementById('stats');

const renderer = new Renderer(canvas);
const game = new SnakeGame({
  onUpdate: (state) => {
    renderer.draw(state);
    renderHUD(state);
  },
  onGameOver: (score) => showStatus(`游戏结束，得分 ${score}`),
  onWin: (score) => showStatus(`太棒了，达成胜利！得分 ${score}`),
});

new InputManager(game, { canvas });

// 初始化速度控制显示
speedSlider.min = CONFIG.minSpeedMs;
speedSlider.max = CONFIG.maxSpeedMs;
speedSlider.value = CONFIG.initialSpeedMs;
updateSpeedLabel(CONFIG.initialSpeedMs);

// 绑定按钮事件
startBtn.addEventListener('click', () => {
  if (game.state === GAME_STATE.PAUSED) {
    game.resume();
    showStatus('继续前进，注意别撞墙~');
    return;
  }
  if (game.state === GAME_STATE.READY || game.state === GAME_STATE.OVER || game.state === GAME_STATE.WIN) {
    game.restart();
    showStatus('加油，吃到更多食物吧！');
  }
});

pauseBtn.addEventListener('click', () => {
  if (game.state === GAME_STATE.RUNNING) {
    game.pause();
    showStatus('已暂停，点击继续或按空格恢复');
  } else if (game.state === GAME_STATE.PAUSED) {
    game.resume();
    showStatus('继续前进，注意别撞墙~');
  }
});

restartBtn.addEventListener('click', () => {
  game.restart();
  showStatus('新的一局开始啦！');
});

speedSlider.addEventListener('input', (event) => {
  const speedMs = Number(event.target.value);
  game.setSpeed(speedMs);
  updateSpeedLabel(speedMs);
});

// 显示提示信息
function showStatus(message) {
  statusEl.textContent = message;
}

// 更新 HUD 信息
function renderHUD(state) {
  scoreEl.textContent = state.score;
  bestEl.textContent = state.highScore;
  lengthEl.textContent = state.length;
  tooltipEl.textContent = getStateLabel(state.state);
  statsEl.textContent = formatStats();
  pauseBtn.textContent = state.state === GAME_STATE.PAUSED ? '继续 (Space)' : '暂停 (Space)';
}

function formatStats() {
  const stats = getGameStats();
  const average = stats.totalGames ? Math.round(stats.totalScore / stats.totalGames) : 0;
  return `总局数 ${stats.totalGames} | 平均分 ${average}`;
}

function getStateLabel(state) {
  switch (state) {
    case GAME_STATE.RUNNING:
      return '进行中';
    case GAME_STATE.PAUSED:
      return '已暂停';
    case GAME_STATE.OVER:
      return '失败，按重新开始再试一次';
    case GAME_STATE.WIN:
      return '胜利！继续挑战更高分吧';
    default:
      return '准备就绪，按开始键或方向键开局';
  }
}

function updateSpeedLabel(speedMs) {
  speedLabel.textContent = `${speedMs} ms/步`;
}

// 初始提示
showStatus('方向键/WASD 控制，空格暂停，滑动屏幕也可以控制方向哦~');
renderHUD({
  score: 0,
  highScore: game.highScore,
  length: CONFIG.initialSnakeLength,
  state: GAME_STATE.READY,
});
