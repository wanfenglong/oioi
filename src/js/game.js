import { CONFIG } from './config.js';
import { loadHighScore, saveHighScore, recordGameStats } from './storage.js';

export const GAME_STATE = {
  READY: 'ready',
  RUNNING: 'running',
  PAUSED: 'paused',
  OVER: 'over',
  WIN: 'win',
};

// 方向向量，便于计算蛇的移动。
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1, opposite: 'ArrowDown' },
  ArrowDown: { x: 0, y: 1, opposite: 'ArrowUp' },
  ArrowLeft: { x: -1, y: 0, opposite: 'ArrowRight' },
  ArrowRight: { x: 1, y: 0, opposite: 'ArrowLeft' },
};

// 允许的键位映射（支持 WASD）。
export const KEY_TO_DIRECTION = {
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  w: 'ArrowUp',
  W: 'ArrowUp',
  s: 'ArrowDown',
  S: 'ArrowDown',
  a: 'ArrowLeft',
  A: 'ArrowLeft',
  d: 'ArrowRight',
  D: 'ArrowRight',
};

export class SnakeGame {
  constructor({ onUpdate, onGameOver, onWin }) {
    this.onUpdate = onUpdate;
    this.onGameOver = onGameOver;
    this.onWin = onWin;

    this.reset();
  }

  // 重置游戏状态到初始值。
  reset() {
    this.gridSize = CONFIG.gridSize;
    this.speedMs = CONFIG.initialSpeedMs;
    this.score = 0;
    this.highScore = loadHighScore();
    this.direction = 'ArrowRight';
    this.nextDirection = 'ArrowRight';
    this.state = GAME_STATE.READY;
    this.snake = this.createInitialSnake();
    this.food = this.spawnFood();
    this.lengthTarget = CONFIG.winLength;
    this.timer = null;
    this.notifyUpdate();
  }

  // 创建初始蛇身，位于画布中央，水平向右。
  createInitialSnake() {
    const cells = [];
    const startX = Math.floor(this.gridSize / 2);
    const startY = Math.floor(this.gridSize / 2);
    for (let i = CONFIG.initialSnakeLength - 1; i >= 0; i -= 1) {
      cells.push({ x: startX - i, y: startY });
    }
    return cells;
  }

  // 尝试开始游戏循环。
  start() {
    if (this.state === GAME_STATE.RUNNING) return;
    this.state = GAME_STATE.RUNNING;
    this.scheduleNextTick();
  }

  // 暂停游戏。
  pause() {
    if (this.state !== GAME_STATE.RUNNING) return;
    this.state = GAME_STATE.PAUSED;
    this.clearTimer();
    this.notifyUpdate();
  }

  // 继续游戏。
  resume() {
    if (this.state !== GAME_STATE.PAUSED) return;
    this.state = GAME_STATE.RUNNING;
    this.scheduleNextTick();
  }

  // 游戏主循环：更新蛇的位置、处理碰撞和得分。
  tick() {
    if (this.state !== GAME_STATE.RUNNING) return;

    this.direction = this.nextDirection;
    const head = this.snake[0];
    const move = DIRECTIONS[this.direction];
    const newHead = { x: head.x + move.x, y: head.y + move.y };

    if (this.isCollision(newHead)) {
      this.endGame(false);
      return;
    }

    this.snake.unshift(newHead);

    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += CONFIG.foodScore;
      this.food = this.spawnFood();
      this.checkWinCondition();
    } else {
      this.snake.pop();
    }

    this.scheduleNextTick();
    this.notifyUpdate();
  }

  // 确认胜利条件：达到设定长度即获胜。
  checkWinCondition() {
    if (this.snake.length >= this.lengthTarget) {
      this.endGame(true);
    }
  }

  // 安排下一帧移动。
  scheduleNextTick() {
    this.clearTimer();
    this.timer = setTimeout(() => this.tick(), this.speedMs);
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  // 处理用户输入的方向变更，避免 180 度反转。
  setDirection(directionKey) {
    const target = KEY_TO_DIRECTION[directionKey];
    if (!target) return;
    if (this.state === GAME_STATE.READY) this.start();
    if (this.state !== GAME_STATE.RUNNING && this.state !== GAME_STATE.READY) return;

    const current = DIRECTIONS[this.direction];
    const requested = DIRECTIONS[target];
    if (requested.opposite === this.direction) return;
    if (current.x === requested.x && current.y === requested.y) return;

    this.nextDirection = target;
  }

  // 边界与自撞检测。
  isCollision(cell) {
    const outOfBounds =
      cell.x < 0 || cell.y < 0 || cell.x >= this.gridSize || cell.y >= this.gridSize;
    if (outOfBounds) return true;
    return this.snake.some((segment) => segment.x === cell.x && segment.y === cell.y);
  }

  // 生成不与蛇身重叠的食物位置。
  spawnFood() {
    const occupied = new Set(this.snake.map((part) => `${part.x},${part.y}`));
    const freeCells = [];
    for (let y = 0; y < this.gridSize; y += 1) {
      for (let x = 0; x < this.gridSize; x += 1) {
        const key = `${x},${y}`;
        if (!occupied.has(key)) freeCells.push({ x, y });
      }
    }
    if (freeCells.length === 0) return { x: 0, y: 0 };
    return freeCells[Math.floor(Math.random() * freeCells.length)];
  }

  // 结束游戏：胜利或失败。
  endGame(isWin) {
    this.state = isWin ? GAME_STATE.WIN : GAME_STATE.OVER;
    this.clearTimer();
    const finalScore = this.score;
    if (finalScore > this.highScore) {
      this.highScore = finalScore;
      saveHighScore(finalScore);
    }
    recordGameStats(finalScore);
    this.notifyUpdate();
    if (isWin && this.onWin) this.onWin(finalScore);
    if (!isWin && this.onGameOver) this.onGameOver(finalScore);
  }

  // 更新速度（难度）
  setSpeed(speedMs) {
    this.speedMs = Math.min(Math.max(speedMs, CONFIG.minSpeedMs), CONFIG.maxSpeedMs);
  }

  // 重新开始游戏。
  restart() {
    this.clearTimer();
    this.reset();
    this.state = GAME_STATE.RUNNING;
    this.scheduleNextTick();
  }

  // 统一的状态更新通知，便于 UI 渲染。
  notifyUpdate() {
    if (this.onUpdate) {
      this.onUpdate({
        snake: this.snake,
        food: this.food,
        score: this.score,
        highScore: this.highScore,
        length: this.snake.length,
        state: this.state,
        gridSize: this.gridSize,
        speedMs: this.speedMs,
      });
    }
  }
}
