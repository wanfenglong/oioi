import { CONFIG } from './config.js';
import { GAME_STATE } from './game.js';

// 渲染器：负责将蛇、食物和网格绘制到画布上。
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cellSize = CONFIG.boardSizePx / CONFIG.gridSize;
    this.canvas.width = CONFIG.boardSizePx;
    this.canvas.height = CONFIG.boardSizePx;
  }

  // 绘制一次帧数据。
  draw({ snake, food, state }) {
    this.clear();
    this.drawGrid();
    this.drawFood(food);
    this.drawSnake(snake);
    if (state === GAME_STATE.PAUSED || state === GAME_STATE.OVER || state === GAME_STATE.WIN) {
      this.drawOverlay(state);
    }
  }

  clear() {
    this.ctx.fillStyle = CONFIG.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid() {
    const { ctx } = this;
    ctx.strokeStyle = CONFIG.gridLineColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= CONFIG.gridSize; i += 1) {
      const pos = i * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, this.canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(this.canvas.width, pos);
      ctx.stroke();
    }
  }

  drawSnake(snake) {
    const { ctx } = this;
    const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, CONFIG.snakeGradient[0]);
    gradient.addColorStop(1, CONFIG.snakeGradient[1]);

    snake.forEach((segment, index) => {
      const x = segment.x * this.cellSize;
      const y = segment.y * this.cellSize;
      ctx.fillStyle = index === 0 ? CONFIG.snakeHeadColor : gradient;
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4, 6);
      ctx.fill();
      ctx.stroke();
    });
  }

  drawFood(food) {
    const { ctx } = this;
    const x = food.x * this.cellSize;
    const y = food.y * this.cellSize;
    const padding = this.cellSize * 0.15;
    ctx.fillStyle = CONFIG.foodColor;
    ctx.strokeStyle = CONFIG.foodStroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + padding, y + padding, this.cellSize - padding * 2, this.cellSize - padding * 2, 6);
    ctx.fill();
    ctx.stroke();
  }

  drawOverlay(state) {
    const { ctx } = this;
    ctx.fillStyle = CONFIG.overlayColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = CONFIG.snakeHeadColor;
    ctx.font = `bold 32px ${CONFIG.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = state === GAME_STATE.PAUSED ? '暂停中' : state === GAME_STATE.WIN ? '胜利！' : '游戏结束';
    ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
  }
}
