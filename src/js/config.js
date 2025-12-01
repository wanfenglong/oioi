// 配置常量：包含游戏速度、网格大小、颜色、得分规则等。
export const CONFIG = {
  // 游戏逻辑参数
  gridSize: 20, // 网格宽高（正方形网格）
  initialSnakeLength: 3, // 初始蛇身长度
  initialSpeedMs: 150, // 默认移动间隔（毫秒）
  minSpeedMs: 100, // 难度上限
  maxSpeedMs: 200, // 难度下限
  foodScore: 10, // 食物基础分值
  winLength: 30, // 达到该长度视为胜利（可选胜利条件）

  // 视觉参数
  boardSizePx: 520, // 画布尺寸（正方形）
  backgroundColor: '#f7f9fc',
  gridLineColor: '#e0e7ff',
  snakeGradient: ['#8BC6EC', '#9599E2'],
  snakeHeadColor: '#5c6ac4',
  foodColor: '#ff6b6b',
  foodStroke: '#ff9f1c',
  overlayColor: 'rgba(92, 106, 196, 0.12)',

  // 文字
  fontFamily: '"Inter", "PingFang SC", "Helvetica Neue", Arial, sans-serif',
};
