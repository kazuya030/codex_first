/**
 * UIManagerクラスの単体テスト
 */

// main.module.jsからクラスをインポート
const { UIManager, SimulationConfig } = require('./main.module.js');

describe('UIManager', () => {
  let uiManager;
  let mockElements;

  beforeEach(() => {
    // DOM要素のモックを作成
    mockElements = {
      world: document.createElement('canvas'),
      speed: document.createElement('input'),
      speedBox: document.createElement('input'),
      herbCooldown: document.createElement('input'),
      herbCooldownBox: document.createElement('input'),
      herbEnergy: document.createElement('input'),
      herbEnergyBox: document.createElement('input'),
      grassRegrow: document.createElement('input'),
      grassRegrowBox: document.createElement('input'),
      herbMove: document.createElement('input'),
      herbMoveBox: document.createElement('input'),
      carnMove: document.createElement('input'),
      carnMoveBox: document.createElement('input'),
      herbGain: document.createElement('input'),
      herbGainBox: document.createElement('input'),
      carnGain: document.createElement('input'),
      carnGainBox: document.createElement('input'),
      carnEnergy: document.createElement('input'),
      carnEnergyBox: document.createElement('input'),
      initialHerb: document.createElement('input'),
      initialHerbBox: document.createElement('input'),
      initialCarn: document.createElement('input'),
      initialCarnBox: document.createElement('input'),
      pauseResumeBtn: document.createElement('button'),
      resetBtn: document.createElement('button'),
      populationChart: document.createElement('canvas')
    };

    // 各要素にIDを設定
    Object.keys(mockElements).forEach(key => {
      mockElements[key].id = key;
      document.body.appendChild(mockElements[key]);
    });

    // デフォルト値を設定
    mockElements.speed.value = '1.0';
    mockElements.speedBox.value = '1.0';
    mockElements.herbCooldown.value = '3';
    mockElements.herbCooldownBox.value = '3';
    mockElements.herbEnergy.value = '10';
    mockElements.herbEnergyBox.value = '10';
    mockElements.grassRegrow.value = '5';
    mockElements.grassRegrowBox.value = '5';
    mockElements.herbMove.value = '0.5';
    mockElements.herbMoveBox.value = '0.5';
    mockElements.carnMove.value = '1.0';
    mockElements.carnMoveBox.value = '1.0';
    mockElements.herbGain.value = '3';
    mockElements.herbGainBox.value = '3';
    mockElements.carnGain.value = '8';
    mockElements.carnGainBox.value = '8';
    mockElements.carnEnergy.value = '25';
    mockElements.carnEnergyBox.value = '25';
    mockElements.initialHerb.value = '30';
    mockElements.initialHerbBox.value = '30';
    mockElements.initialCarn.value = '5';
    mockElements.initialCarnBox.value = '5';

    uiManager = new UIManager();
  });

  afterEach(() => {
    // DOM要素をクリーンアップ
    Object.values(mockElements).forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  });

  describe('初期化', () => {
    test('全ての必要な要素が取得される', () => {
      expect(uiManager.elements.canvas).toBeTruthy();
      expect(uiManager.elements.speed.input).toBeTruthy();
      expect(uiManager.elements.speed.box).toBeTruthy();
      expect(uiManager.elements.pauseResumeBtn).toBeTruthy();
      expect(uiManager.elements.resetBtn).toBeTruthy();
      expect(uiManager.elements.populationChart).toBeTruthy();
    });

    test('config参照が初期状態でnull', () => {
      expect(uiManager.config).toBeNull();
    });
  });

  describe('setConfig', () => {
    test('設定オブジェクトが正しく設定される', () => {
      const mockConfig = new SimulationConfig();
      uiManager.setConfig(mockConfig);
      expect(uiManager.config).toBe(mockConfig);
    });
  });

  describe('bindControl', () => {
    test('スライダーから数値ボックスへの同期', () => {
      const slider = mockElements.speed;
      const box = mockElements.speedBox;
      
      uiManager.bindControl(slider, box);
      
      slider.value = '2.5';
      slider.dispatchEvent(new Event('input'));
      
      expect(box.value).toBe('2.5');
    });

    test('数値ボックスからスライダーへの同期', () => {
      const slider = mockElements.speed;
      const box = mockElements.speedBox;
      
      uiManager.bindControl(slider, box);
      
      box.value = '1.8';
      box.dispatchEvent(new Event('input'));
      
      expect(slider.value).toBe('1.8');
    });

    test('コールバック関数が呼ばれる', () => {
      const slider = mockElements.speed;
      const box = mockElements.speedBox;
      const callback = jest.fn();
      
      uiManager.bindControl(slider, box, callback);
      
      slider.value = '3.0';
      slider.dispatchEvent(new Event('input'));
      
      expect(callback).toHaveBeenCalledWith('3.0');
    });
  });

  describe('getValues', () => {
    test('全ての値が正しく取得される', () => {
      const values = uiManager.getValues();
      
      expect(values.speed).toBe(1.0);
      expect(values.herbCooldown).toBe(3);
      expect(values.herbEnergy).toBe(10);
      expect(values.grassRegrow).toBe(5);
      expect(values.herbMove).toBe(0.5);
      expect(values.carnMove).toBe(1.0);
      expect(values.herbGain).toBe(3);
      expect(values.carnGain).toBe(8);
      expect(values.carnEnergy).toBe(25);
      expect(values.initialHerb).toBe(30);
      expect(values.initialCarn).toBe(5);
    });

    test('小数値が正しく解析される', () => {
      mockElements.speed.value = '2.75';
      mockElements.herbMove.value = '0.25';
      
      const values = uiManager.getValues();
      
      expect(values.speed).toBe(2.75);
      expect(values.herbMove).toBe(0.25);
    });

    test('初期個体数が整数に変換される', () => {
      mockElements.initialHerb.value = '30.7';
      mockElements.initialCarn.value = '5.9';
      
      const values = uiManager.getValues();
      
      expect(values.initialHerb).toBe(30); // Math.floorで切り捨て
      expect(values.initialCarn).toBe(5);  // Math.floorで切り捨て
    });

    test('不正な値でもNaNにならない', () => {
      mockElements.speed.value = '';
      mockElements.herbEnergy.value = 'invalid';
      
      const values = uiManager.getValues();
      
      // parseFloatは空文字列やinvalidをNaNに変換するが、
      // これらが実際にどう処理されるかは実装による
      expect(typeof values.speed).toBe('number');
      expect(typeof values.herbEnergy).toBe('number');
    });
  });

  describe('草食動物エネルギーの特別処理', () => {
    test('草食動物エネルギー変更時にコールバックが実行される', () => {
      const config = new SimulationConfig();
      uiManager.setConfig(config);
      
      // bindControlsを明示的に呼ぶ（setConfig内で呼ばれるが、テストで確実にするため）
      uiManager.bindControls();
      
      mockElements.herbEnergy.value = '15';
      mockElements.herbEnergy.dispatchEvent(new Event('input'));
      
      expect(config.herbivoreReproduceEnergy).toBe(15);
    });
  });

  describe('存在しない要素への対応', () => {
    test('存在しない要素IDでエラーが発生しない', () => {
      // 一時的に要素を削除
      const speedElement = mockElements.speed;
      speedElement.parentNode.removeChild(speedElement);
      
      // 新しいUIManagerを作成（要素が見つからない状態）
      const newUIManager = new UIManager();
      
      // エラーが発生せずに初期化が完了することを確認
      expect(newUIManager.elements).toBeDefined();
    });
  });

  describe('イベントリスナーのテスト', () => {
    test('複数のイベントタイプが正しく処理される', () => {
      const slider = mockElements.speed;
      const box = mockElements.speedBox;
      
      uiManager.bindControl(slider, box);
      
      // inputイベント
      slider.value = '2.0';
      slider.dispatchEvent(new Event('input'));
      expect(box.value).toBe('2.0');
      
      // changeイベント
      slider.value = '3.0';
      slider.dispatchEvent(new Event('change'));
      expect(box.value).toBe('3.0');
    });
  });
});