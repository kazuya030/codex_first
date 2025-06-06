/**
 * Jest テストセットアップファイル
 * グローバルな設定とモック定義
 */

// DOM環境のセットアップ
global.document = document;
global.window = window;

// Chart.jsのモック
global.Chart = class MockChart {
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    this.data = config.data || { labels: [], datasets: [] };
  }
  
  update() {}
  destroy() {}
};

// HTMLCanvasElementのモック
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: function(contextType) {
    if (contextType === '2d') {
      return {
        fillStyle: '',
        clearRect: jest.fn(),
        fillRect: jest.fn(),
        drawImage: jest.fn(),
        getImageData: jest.fn(),
        putImageData: jest.fn(),
        canvas: this,
        save: jest.fn(),
        restore: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        translate: jest.fn(),
        transform: jest.fn(),
        setTransform: jest.fn()
      };
    }
    return null;
  }
});

// requestAnimationFrameのモック
global.requestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 16);
});

global.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

// console.error のモック（テスト中のエラーログを抑制）
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && args[0].includes && args[0].includes('Element with id')) {
    return; // DOM要素が見つからないエラーを抑制
  }
  originalError.apply(console, args);
};