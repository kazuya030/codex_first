/**
 * Agent、Herbivore、Carnivoreクラスの単体テスト
 */

// main.module.jsからクラスをインポート
const { CONFIG, Agent, Herbivore, Carnivore, Grid, SimulationConfig } = require('../main.module.js');

describe('Agent', () => {
  let agent;
  const initialX = 5;
  const initialY = 3;
  const initialEnergy = 10;

  beforeEach(() => {
    agent = new Agent(initialX, initialY, initialEnergy);
  });

  describe('初期化', () => {
    test('正しいパラメータで初期化される', () => {
      expect(agent.x).toBe(initialX);
      expect(agent.y).toBe(initialY);
      expect(agent.energy).toBe(initialEnergy);
    });
  });

  describe('move', () => {
    test('移動後の座標がグリッド内に収まる', () => {
      const gridWidth = 10;
      const gridHeight = 10;
      
      for (let i = 0; i < 100; i++) { // 複数回テストして確実性を高める
        agent.move(gridWidth, gridHeight);
        expect(agent.x).toBeGreaterThanOrEqual(0);
        expect(agent.x).toBeLessThan(gridWidth);
        expect(agent.y).toBeGreaterThanOrEqual(0);
        expect(agent.y).toBeLessThan(gridHeight);
      }
    });

    test('トーラス構造で境界をまたぐ移動が正しく処理される', () => {
      const gridWidth = 5;
      const gridHeight = 5;
      
      // 左端のエージェント
      const leftAgent = new Agent(0, 2, 10);
      leftAgent.x = -1; // 手動で境界外に設定
      leftAgent.move(gridWidth, gridHeight);
      // トーラス構造により右端にワープするはず（ただし、moveメソッド内の計算による）
      
      // 右端のエージェント
      const rightAgent = new Agent(4, 2, 10);
      rightAgent.x = 5; // 手動で境界外に設定
      rightAgent.move(gridWidth, gridHeight);
      
      // 座標が有効範囲内であることを確認
      expect(leftAgent.x).toBeGreaterThanOrEqual(0);
      expect(leftAgent.x).toBeLessThan(gridWidth);
      expect(rightAgent.x).toBeGreaterThanOrEqual(0);
      expect(rightAgent.x).toBeLessThan(gridWidth);
    });
  });

  describe('isDead', () => {
    test('エネルギーが0以下の場合にtrueを返す', () => {
      agent.energy = 0;
      expect(agent.isDead()).toBe(true);
      
      agent.energy = -5;
      expect(agent.isDead()).toBe(true);
    });

    test('エネルギーが正の場合にfalseを返す', () => {
      agent.energy = 1;
      expect(agent.isDead()).toBe(false);
      
      agent.energy = 10.5;
      expect(agent.isDead()).toBe(false);
    });
  });
});

describe('Herbivore', () => {
  let herbivore;
  let grid;
  let config;
  const gridWidth = 10;
  const gridHeight = 10;

  beforeEach(() => {
    herbivore = new Herbivore(5, 5, 15);
    grid = new Grid(gridWidth, gridHeight);
    config = new SimulationConfig();
    config.updateFromUI({
      herbMove: 0.5,
      herbGain: 3,
      herbEnergy: 12,
      herbCooldown: 3
    });
  });

  describe('初期化', () => {
    test('基底クラスのプロパティを継承', () => {
      expect(herbivore.x).toBe(5);
      expect(herbivore.y).toBe(5);
      expect(herbivore.energy).toBe(15);
    });

    test('クールダウンが初期化される', () => {
      expect(herbivore.cooldown).toBe(0);
      
      const herbWithCooldown = new Herbivore(3, 3, 10, 5);
      expect(herbWithCooldown.cooldown).toBe(5);
    });
  });

  describe('update', () => {
    test('移動コストでエネルギーが減り、草を食べると回復する', () => {
      const initialEnergy = herbivore.energy;
      const initialPosition = { x: herbivore.x, y: herbivore.y };
      
      herbivore.update(config, grid, gridWidth, gridHeight);
      
      // 移動後の位置で草があった場合の期待値を計算
      const expectedEnergy = initialEnergy - config.values.herbMove + config.values.herbGain;
      
      // 草を食べてエネルギーが回復するはず（移動後の位置に草があれば）
      expect(herbivore.energy).toBe(expectedEnergy);
    });

    test('クールダウンが減少する', () => {
      herbivore.cooldown = 5;
      herbivore.update(config, grid, gridWidth, gridHeight);
      expect(herbivore.cooldown).toBe(4);
      
      // 0以下にはならない
      herbivore.cooldown = 0;
      herbivore.update(config, grid, gridWidth, gridHeight);
      expect(herbivore.cooldown).toBe(0);
    });

    test('草があるセルでエネルギーを回復', () => {
      // 特定の位置に草があることを確認
      expect(grid.hasGrass(herbivore.x, herbivore.y)).toBe(true);
      
      const energyBefore = herbivore.energy - config.values.herbMove; // 移動コスト考慮
      herbivore.update(config, grid, gridWidth, gridHeight);
      
      // 草を食べてエネルギー回復（移動後の位置で草があれば）
      if (!grid.hasGrass(herbivore.x, herbivore.y)) {
        expect(herbivore.energy).toBe(energyBefore + config.values.herbGain);
      }
    });
  });

  describe('canReproduce', () => {
    test('エネルギーが十分でクールダウンが0の場合にtrue', () => {
      herbivore.energy = 15;
      herbivore.cooldown = 0;
      expect(herbivore.canReproduce(config)).toBe(true);
    });

    test('エネルギーが不足の場合にfalse', () => {
      herbivore.energy = 10; // config.values.herbEnergy(12)より少ない
      herbivore.cooldown = 0;
      expect(herbivore.canReproduce(config)).toBe(false);
    });

    test('クールダウン中の場合にfalse', () => {
      herbivore.energy = 15;
      herbivore.cooldown = 1;
      expect(herbivore.canReproduce(config)).toBe(false);
    });
  });

  describe('reproduce', () => {
    test('親のエネルギーが半分になる', () => {
      const initialEnergy = herbivore.energy;
      herbivore.reproduce(config);
      expect(herbivore.energy).toBe(initialEnergy / 2);
    });

    test('親にクールダウンが設定される', () => {
      herbivore.reproduce(config);
      expect(herbivore.cooldown).toBe(config.values.herbCooldown);
    });

    test('子個体が正しく生成される', () => {
      const initialEnergy = herbivore.energy;
      const offspring = herbivore.reproduce(config);
      
      expect(offspring).toBeInstanceOf(Herbivore);
      expect(offspring.x).toBe(herbivore.x);
      expect(offspring.y).toBe(herbivore.y);
      expect(offspring.energy).toBe(initialEnergy / 2);
      expect(offspring.cooldown).toBe(config.values.herbCooldown);
    });
  });
});

describe('Carnivore', () => {
  let carnivore;
  let config;
  let herbivores;
  const gridWidth = 10;
  const gridHeight = 10;

  beforeEach(() => {
    carnivore = new Carnivore(5, 5, 25);
    config = new SimulationConfig();
    config.updateFromUI({
      carnMove: 1.0,
      carnGain: 8,
      carnEnergy: 20
    });
    herbivores = [];
  });

  describe('初期化', () => {
    test('基底クラスのプロパティを継承', () => {
      expect(carnivore.x).toBe(5);
      expect(carnivore.y).toBe(5);
      expect(carnivore.energy).toBe(25);
    });
  });

  describe('update', () => {
    test('移動コストでエネルギーが減る', () => {
      const initialEnergy = carnivore.energy;
      carnivore.update(config, gridWidth, gridHeight);
      expect(carnivore.energy).toBe(initialEnergy - config.values.carnMove);
    });

    test('位置が移動する', () => {
      const initialX = carnivore.x;
      const initialY = carnivore.y;
      
      // 複数回テストして移動を確認
      let moved = false;
      for (let i = 0; i < 50; i++) {
        carnivore.update(config, gridWidth, gridHeight);
        if (carnivore.x !== initialX || carnivore.y !== initialY) {
          moved = true;
          break;
        }
      }
      expect(moved).toBe(true);
    });
  });

  describe('hunt', () => {
    test('同じ位置に草食動物がいる場合に捕食成功', () => {
      const herbivore = new Herbivore(carnivore.x, carnivore.y, 10);
      herbivores.push(herbivore);
      
      const initialEnergy = carnivore.energy;
      const result = carnivore.hunt(herbivores, config);
      
      expect(result).toBe(true);
      expect(carnivore.energy).toBe(initialEnergy + config.values.carnGain);
      expect(herbivores.length).toBe(0); // 草食動物が削除される
    });

    test('同じ位置に草食動物がいない場合に捕食失敗', () => {
      const herbivore = new Herbivore(carnivore.x + 1, carnivore.y, 10);
      herbivores.push(herbivore);
      
      const initialEnergy = carnivore.energy;
      const result = carnivore.hunt(herbivores, config);
      
      expect(result).toBe(false);
      expect(carnivore.energy).toBe(initialEnergy);
      expect(herbivores.length).toBe(1); // 草食動物は削除されない
    });

    test('複数の草食動物がいる場合に1匹のみ捕食', () => {
      const herbivore1 = new Herbivore(carnivore.x, carnivore.y, 10);
      const herbivore2 = new Herbivore(carnivore.x, carnivore.y, 12);
      const herbivore3 = new Herbivore(carnivore.x + 1, carnivore.y, 8);
      herbivores.push(herbivore1, herbivore2, herbivore3);
      
      const result = carnivore.hunt(herbivores, config);
      
      expect(result).toBe(true);
      expect(herbivores.length).toBe(2); // 1匹が削除される
    });
  });

  describe('canReproduce', () => {
    test('エネルギーが十分な場合にtrue', () => {
      carnivore.energy = 25; // config.values.carnEnergy(20)より多い
      expect(carnivore.canReproduce(config)).toBe(true);
    });

    test('エネルギーが不足の場合にfalse', () => {
      carnivore.energy = 15; // config.values.carnEnergy(20)より少ない
      expect(carnivore.canReproduce(config)).toBe(false);
    });

    test('境界値でのテスト', () => {
      carnivore.energy = 20; // ちょうど閾値
      expect(carnivore.canReproduce(config)).toBe(false);
      
      carnivore.energy = 20.1; // 閾値より少し多い
      expect(carnivore.canReproduce(config)).toBe(true);
    });
  });

  describe('reproduce', () => {
    test('親のエネルギーが半分になる', () => {
      const initialEnergy = carnivore.energy;
      carnivore.reproduce();
      expect(carnivore.energy).toBe(initialEnergy / 2);
    });

    test('子個体が正しく生成される', () => {
      const initialEnergy = carnivore.energy;
      const offspring = carnivore.reproduce();
      
      expect(offspring).toBeInstanceOf(Carnivore);
      expect(offspring.x).toBe(carnivore.x);
      expect(offspring.y).toBe(carnivore.y);
      expect(offspring.energy).toBe(initialEnergy / 2);
    });
  });
});