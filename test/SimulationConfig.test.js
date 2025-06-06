/**
 * SimulationConfigクラスの単体テスト
 */

// main.module.jsからクラスをインポート
const { CONFIG, SimulationConfig } = require('./main.module.js');

describe('SimulationConfig', () => {
  let config;

  beforeEach(() => {
    config = new SimulationConfig();
  });

  describe('初期化', () => {
    test('デフォルト値で正しく初期化される', () => {
      expect(config.herbivoreReproduceEnergy).toBe(CONFIG.DEFAULT_HERBIVORE_REPRODUCE_ENERGY);
      expect(config.carnivoreReproduceEnergy).toBe(CONFIG.DEFAULT_CARNIVORE_REPRODUCE_ENERGY);
    });

    test('valuesプロパティが未定義で開始される', () => {
      expect(config.values).toBeUndefined();
    });
  });

  describe('updateFromUI', () => {
    test('UI値で設定が正しく更新される', () => {
      const uiValues = {
        speed: 1.5,
        herbCooldown: 5,
        herbEnergy: 15,
        grassRegrow: 10,
        herbMove: 0.5,
        carnMove: 1.0,
        herbGain: 3,
        carnGain: 8,
        carnEnergy: 25,
        initialHerb: 50,
        initialCarn: 10
      };

      config.updateFromUI(uiValues);

      expect(config.values).toEqual(uiValues);
      expect(config.values.speed).toBe(1.5);
      expect(config.values.herbEnergy).toBe(15);
      expect(config.values.initialHerb).toBe(50);
    });

    test('部分的なUI値でも更新される', () => {
      const partialValues = {
        speed: 2.0,
        herbEnergy: 20
      };

      config.updateFromUI(partialValues);

      expect(config.values.speed).toBe(2.0);
      expect(config.values.herbEnergy).toBe(20);
    });
  });

  describe('草食動物の繁殖エネルギー', () => {
    test('初期値から変更可能', () => {
      const newEnergy = 25;
      config.herbivoreReproduceEnergy = newEnergy;
      
      expect(config.herbivoreReproduceEnergy).toBe(newEnergy);
    });

    test('小数値も設定可能', () => {
      const decimalEnergy = 12.5;
      config.herbivoreReproduceEnergy = decimalEnergy;
      
      expect(config.herbivoreReproduceEnergy).toBe(decimalEnergy);
    });
  });

  describe('肉食動物の繁殖エネルギー', () => {
    test('デフォルト値が固定値として設定される', () => {
      expect(config.carnivoreReproduceEnergy).toBe(CONFIG.DEFAULT_CARNIVORE_REPRODUCE_ENERGY);
    });

    test('値を変更可能', () => {
      const newEnergy = 40;
      config.carnivoreReproduceEnergy = newEnergy;
      
      expect(config.carnivoreReproduceEnergy).toBe(newEnergy);
    });
  });
});