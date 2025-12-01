import { GAME_STATE, KEY_TO_DIRECTION } from './game.js';

// 输入管理：绑定键盘、触摸事件并将方向更新到游戏实例。
export class InputManager {
  constructor(game, elements) {
    this.game = game;
    this.canvas = elements.canvas;
    this.bindKeyboard();
    this.bindTouch();
  }

  bindKeyboard() {
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        this.togglePause();
        return;
      }
      if (KEY_TO_DIRECTION[event.key]) {
        event.preventDefault();
        this.game.setDirection(event.key);
      }
    });
  }

  bindTouch() {
    let startX = 0;
    let startY = 0;
    this.canvas.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    });

    this.canvas.addEventListener('touchend', (event) => {
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (Math.max(absX, absY) < 10) return; // 忽略轻微滑动
      if (absX > absY) {
        this.game.setDirection(deltaX > 0 ? 'ArrowRight' : 'ArrowLeft');
      } else {
        this.game.setDirection(deltaY > 0 ? 'ArrowDown' : 'ArrowUp');
      }
    });
  }

  togglePause() {
    if (this.game.state === GAME_STATE.PAUSED) {
      this.game.resume();
    } else if (this.game.state === GAME_STATE.RUNNING) {
      this.game.pause();
    }
  }
}
