/**
 * Gridクラスの単体テスト
 */

// main.module.jsからクラスをインポート
const { Grid } = require('../main.module.js');

describe('Grid', () => {
  let grid;
  const width = 10;
  const height = 8;

  beforeEach(() => {
    grid = new Grid(width, height);
  });

  describe('初期化', () => {
    test('指定されたサイズで正しく初期化される', () => {
      expect(grid.width).toBe(width);
      expect(grid.height).toBe(height);
    });

    test('初期状態で全セルに草がある', () => {
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          expect(grid.hasGrass(x, y)).toBe(true);
          expect(grid.grassTimer[x][y]).toBe(0);
        }
      }
    });

    test('草の総数が幅×高さと等しい', () => {
      expect(grid.countGrass()).toBe(width * height);
    });
  });

  describe('hasGrass', () => {
    test('草があるセルでtrueを返す', () => {
      expect(grid.hasGrass(0, 0)).toBe(true);
      expect(grid.hasGrass(5, 3)).toBe(true);
    });

    test('草を消費した後はfalseを返す', () => {
      grid.consumeGrass(2, 3);
      expect(grid.hasGrass(2, 3)).toBe(false);
    });
  });

  describe('consumeGrass', () => {
    test('草があるセルで消費に成功する', () => {
      const result = grid.consumeGrass(3, 4);
      expect(result).toBe(true);
      expect(grid.hasGrass(3, 4)).toBe(false);
      expect(grid.grassTimer[3][4]).toBe(0);
    });

    test('草がないセルで消費に失敗する', () => {
      grid.consumeGrass(3, 4); // 最初に消費
      const result = grid.consumeGrass(3, 4); // 再度消費を試行
      expect(result).toBe(false);
    });

    test('消費後にタイマーがリセットされる', () => {
      grid.grassTimer[1][2] = 5; // タイマーを設定
      grid.consumeGrass(1, 2);
      expect(grid.grassTimer[1][2]).toBe(0);
    });
  });

  describe('update', () => {
    test('草がないセルのタイマーが進む', () => {
      grid.consumeGrass(2, 3);
      grid.update(10);
      expect(grid.grassTimer[2][3]).toBe(1);
    });

    test('再生時間に到達すると草が再生される', () => {
      const regrowTime = 5;
      grid.consumeGrass(4, 5);
      
      // 再生時間-1まで更新
      for (let i = 0; i < regrowTime - 1; i++) {
        grid.update(regrowTime);
      }
      expect(grid.hasGrass(4, 5)).toBe(false);
      
      // 再生時間に到達
      grid.update(regrowTime);
      expect(grid.hasGrass(4, 5)).toBe(true);
      expect(grid.grassTimer[4][5]).toBe(0);
    });

    test('草があるセルのタイマーは変化しない', () => {
      const initialTimer = grid.grassTimer[1][1];
      grid.update(10);
      expect(grid.grassTimer[1][1]).toBe(initialTimer);
    });

    test('複数のセルが同時に更新される', () => {
      grid.consumeGrass(0, 0);
      grid.consumeGrass(1, 1);
      grid.consumeGrass(2, 2);
      
      grid.update(5);
      
      expect(grid.grassTimer[0][0]).toBe(1);
      expect(grid.grassTimer[1][1]).toBe(1);
      expect(grid.grassTimer[2][2]).toBe(1);
    });
  });

  describe('countGrass', () => {
    test('初期状態で全セル数を返す', () => {
      expect(grid.countGrass()).toBe(width * height);
    });

    test('草を消費した分だけ減る', () => {
      const initialCount = grid.countGrass();
      grid.consumeGrass(0, 0);
      grid.consumeGrass(1, 1);
      
      expect(grid.countGrass()).toBe(initialCount - 2);
    });

    test('草が再生すると増える', () => {
      grid.consumeGrass(3, 3);
      const countAfterConsume = grid.countGrass();
      
      // 草を再生させる
      grid.grass[3][3] = true;
      
      expect(grid.countGrass()).toBe(countAfterConsume + 1);
    });

    test('空のグリッドで0を返す', () => {
      // 全ての草を消費
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          grid.grass[x][y] = false;
        }
      }
      
      expect(grid.countGrass()).toBe(0);
    });
  });

  describe('initialize', () => {
    test('グリッドを初期状態にリセットする', () => {
      // 一部の草を消費し、タイマーを進める
      grid.consumeGrass(1, 1);
      grid.consumeGrass(2, 2);
      grid.grassTimer[3][3] = 10;
      
      // 初期化
      grid.initialize();
      
      // 全てのセルが初期状態に戻る
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          expect(grid.hasGrass(x, y)).toBe(true);
          expect(grid.grassTimer[x][y]).toBe(0);
        }
      }
    });
  });

  describe('境界値テスト', () => {
    test('1x1グリッドでも正常に動作する', () => {
      const smallGrid = new Grid(1, 1);
      expect(smallGrid.countGrass()).toBe(1);
      
      smallGrid.consumeGrass(0, 0);
      expect(smallGrid.countGrass()).toBe(0);
      
      smallGrid.update(1);
      expect(smallGrid.hasGrass(0, 0)).toBe(true);
    });

    test('大きなグリッドでも正常に動作する', () => {
      const largeGrid = new Grid(100, 100);
      expect(largeGrid.countGrass()).toBe(10000);
      
      largeGrid.consumeGrass(50, 50);
      expect(largeGrid.countGrass()).toBe(9999);
    });
  });
});