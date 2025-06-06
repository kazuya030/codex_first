/**
 * テスト用のモジュールエクスポート版
 * main.jsから必要なクラスを抽出してエクスポート
 * 
 * 🤖 このファイルは自動生成されています
 * generate-module.js により main.js から生成
 * 手動で編集しないでください
 */

const CONFIG = {
  // ===== 描画関連設定 =====
  /** グリッドの各セルのピクセルサイズ */
  CELL_SIZE: 10,
  
  /** チャートに表示する最大データポイント数（メモリ使用量制限のため） */
  MAX_DATA_POINTS: 100,
  
  // ===== エージェント行動設定 =====
  /** エージェントが1ステップで移動可能な範囲（-1〜+1の3x3グリッド） */
  AGENT_MOVEMENT_RANGE: 3,
  
  // ===== デフォルト値設定 =====
  /** 草食動物の繁殖に必要なデフォルトエネルギー値 */
  DEFAULT_HERBIVORE_REPRODUCE_ENERGY: 10,
  
  /** 肉食動物の繁殖に必要なデフォルトエネルギー値 */
  DEFAULT_CARNIVORE_REPRODUCE_ENERGY: 30,
  
  // ===== 色設定 =====
  /** 各要素の表示色定義 */
  COLORS: {
    /** 草の色（緑） */
    GRASS: 'green',
    /** 草が食べられた後の土地の色（薄いグレー） */
    EMPTY_GRASS: '#ccc',
    /** 草食動物の色（青） */
    HERBIVORE: 'blue',
    /** 肉食動物の色（赤） */
    CARNIVORE: 'red'
  }
};

class UIManager {
  /**
   * コンストラクタ
   * HTML要素の取得のみ行い、イベントバインドは後で実行
   */
  constructor() {
    this.elements = this.initializeElements();
    this.config = null; // SimulationConfigへの参照を後で設定
  }

  /**
   * SimulationConfigインスタンスを設定し、コントロールをバインド
   * @param {SimulationConfig} config - シミュレーション設定オブジェクト
   */
  setConfig(config) {
    this.config = config;
    this.bindControls();
  }

  /**
   * 必要なHTML要素を取得してオブジェクトにまとめる
   * エラーハンドリングを含む安全な要素取得
   * @returns {Object} HTML要素のオブジェクト
   */
  initializeElements() {
    /**
     * 安全なDOM要素取得ヘルパー関数
     * @param {string} id - 要素のID
     * @returns {HTMLElement|null} DOM要素またはnull
     */
    const getElement = (id) => {
      const element = document.getElementById(id);
      if (!element) {
        console.error(`Element with id '${id}' not found`);
      }
      return element;
    };

    return {
      // ===== キャンバス要素 =====
      /** メインシミュレーション描画キャンバス */
      canvas: getElement('world'),
      
      // ===== パラメータコントロール =====
      /** シミュレーション速度制御 */
      speed: { 
        input: getElement('speed'), 
        box: getElement('speedBox') 
      },
      
      /** 草食動物の繁殖クールダウン時間制御 */
      herbCooldown: { 
        input: getElement('herbCooldown'), 
        box: getElement('herbCooldownBox') 
      },
      
      /** 草食動物の繁殖エネルギー閾値制御 */
      herbEnergy: { 
        input: getElement('herbEnergy'), 
        box: getElement('herbEnergyBox') 
      },
      
      /** 草の再生時間制御 */
      grassRegrow: { 
        input: getElement('grassRegrow'), 
        box: getElement('grassRegrowBox') 
      },
      
      /** 草食動物の移動コスト制御 */
      herbMove: { 
        input: getElement('herbMove'), 
        box: getElement('herbMoveBox') 
      },
      
      /** 肉食動物の移動コスト制御 */
      carnMove: { 
        input: getElement('carnMove'), 
        box: getElement('carnMoveBox') 
      },
      
      /** 草食動物の草からのエネルギー獲得量制御 */
      herbGain: { 
        input: getElement('herbGain'), 
        box: getElement('herbGainBox') 
      },
      
      /** 肉食動物の捕食によるエネルギー獲得量制御 */
      carnGain: { 
        input: getElement('carnGain'), 
        box: getElement('carnGainBox') 
      },
      
      /** 肉食動物の繁殖エネルギー閾値制御 */
      carnEnergy: { 
        input: getElement('carnEnergy'), 
        box: getElement('carnEnergyBox') 
      },
      
      /** 初期草食動物数制御 */
      initialHerb: { 
        input: getElement('initialHerb'), 
        box: getElement('initialHerbBox') 
      },
      
      /** 初期肉食動物数制御 */
      initialCarn: { 
        input: getElement('initialCarn'), 
        box: getElement('initialCarnBox') 
      },
      
      // ===== ボタン要素 =====
      /** 一時停止/再開ボタン */
      pauseResumeBtn: getElement('pauseResumeBtn'),
      
      /** リセットボタン */
      resetBtn: getElement('resetBtn'),
      
      // ===== チャート要素 =====
      /** 個体数推移グラフキャンバス */
      populationChart: getElement('populationChart')
    };
  }

  /**
   * 各パラメータのスライダーと数値入力ボックスをバインド
   * 双方向の同期を実現し、草食動物エネルギーの特別処理も含む
   */
  bindControls() {
    Object.entries(this.elements).forEach(([key, element]) => {
      // input（スライダー）とbox（数値入力）の両方が存在する要素のみ処理
      if (element && element.input && element.box) {
        // 草食動物の繁殖エネルギーのみ特別なコールバック処理
        this.bindControl(element.input, element.box, key === 'herbEnergy' ? (v) => {
          if (this.config) {
            // 草食動物の繁殖エネルギー値をリアルタイムで更新
            this.config.herbivoreReproduceEnergy = parseFloat(v);
          }
        } : null);
      }
    });
  }

  /**
   * スライダーと数値入力ボックスの双方向バインディング
   * @param {HTMLInputElement} slider - range型のスライダー要素
   * @param {HTMLInputElement} box - number型の入力ボックス要素
   * @param {Function|null} callback - 値変更時のコールバック関数
   */
  bindControl(slider, box, callback) {
    /**
     * スライダーから数値ボックスへの同期処理
     */
    const fromSlider = () => {
      box.value = slider.value;
      if (callback) callback(slider.value);
    };
    
    /**
     * 数値ボックスからスライダーへの同期処理
     */
    const fromBox = () => {
      slider.value = box.value;
      if (callback) callback(box.value);
    };
    
    // イベントリスナーの登録
    slider.addEventListener('input', fromSlider);    // リアルタイム更新
    box.addEventListener('input', fromBox);          // リアルタイム更新
    slider.addEventListener('change', fromSlider);   // 確定時更新
    box.addEventListener('change', fromBox);         // 確定時更新
    
    // 初期同期の実行
    fromSlider();
  }

  /**
   * 現在のUI要素の値をすべて取得
   * @returns {Object} 各パラメータの現在値
   */
  getValues() {
    return {
      // ===== 基本パラメータ =====
      /** シミュレーション実行速度（倍率） */
      speed: parseFloat(this.elements.speed.input.value),
      
      /** 草食動物の繁殖後クールダウン時間 */
      herbCooldown: parseFloat(this.elements.herbCooldown.input.value),
      
      /** 草食動物の繁殖エネルギー閾値 */
      herbEnergy: parseFloat(this.elements.herbEnergy.input.value),
      
      /** 草の再生に必要な時間 */
      grassRegrow: parseFloat(this.elements.grassRegrow.input.value),
      
      /** 草食動物の1ステップあたりの移動エネルギーコスト */
      herbMove: parseFloat(this.elements.herbMove.input.value),
      
      /** 肉食動物の1ステップあたりの移動エネルギーコスト */
      carnMove: parseFloat(this.elements.carnMove.input.value),
      
      /** 草食動物が草から得るエネルギー量 */
      herbGain: parseFloat(this.elements.herbGain.input.value),
      
      /** 肉食動物が捕食で得るエネルギー量 */
      carnGain: parseFloat(this.elements.carnGain.input.value),
      
      /** 肉食動物の繁殖エネルギー閾値 */
      carnEnergy: parseFloat(this.elements.carnEnergy.input.value),
      
      // ===== 初期設定（整数値） =====
      /** 初期草食動物数（小数点以下切り捨て） */
      initialHerb: Math.floor(parseFloat(this.elements.initialHerb.input.value)),
      
      /** 初期肉食動物数（小数点以下切り捨て） */
      initialCarn: Math.floor(parseFloat(this.elements.initialCarn.input.value))
    };
  }
}

class SimulationConfig {
  /**
   * コンストラクタ
   * デフォルト値で初期化
   */
  constructor() {
    /** 草食動物の繁殖に必要なエネルギー（動的に変更可能） */
    this.herbivoreReproduceEnergy = CONFIG.DEFAULT_HERBIVORE_REPRODUCE_ENERGY;
    
    /** 肉食動物の繁殖に必要なエネルギー（固定値） */
    this.carnivoreReproduceEnergy = CONFIG.DEFAULT_CARNIVORE_REPRODUCE_ENERGY;
  }

  /**
   * UIから取得した値で設定を更新
   * @param {Object} uiValues - UIManagerから取得した値のオブジェクト
   */
  updateFromUI(uiValues) {
    /** 現在のUI設定値を保存 */
    this.values = uiValues;
  }
}

class Grid {
  /**
   * コンストラクタ
   * @param {number} width - グリッドの幅（セル数）
   * @param {number} height - グリッドの高さ（セル数）
   */
  constructor(width, height) {
    /** グリッドの幅 */
    this.width = width;
    
    /** グリッドの高さ */
    this.height = height;
    
    /** 各セルの草の有無を表す2次元配列 */
    this.grass = [];
    
    /** 各セルの草再生タイマーを表す2次元配列 */
    this.grassTimer = [];
    
    // 初期化の実行
    this.initialize();
  }

  /**
   * グリッドを初期状態にリセット
   * 全セルに草を配置し、タイマーを0にセット
   */
  initialize() {
    for (let x = 0; x < this.width; x++) {
      this.grass[x] = [];
      this.grassTimer[x] = [];
      for (let y = 0; y < this.height; y++) {
        this.grass[x][y] = true;  // 初期状態では全セルに草がある
        this.grassTimer[x][y] = 0; // タイマーは0から開始
      }
    }
  }

  /**
   * グリッドの状態を1ステップ更新
   * 草が食べられたセルの再生タイマーを進める
   * @param {number} regrowTime - 草の再生に必要な時間
   */
  update(regrowTime) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        // 草がないセルのタイマーを進める
        if (!this.grass[x][y]) {
          this.grassTimer[x][y]++;
          
          // 再生時間に到達したら草を再生
          if (this.grassTimer[x][y] >= regrowTime) {
            this.grass[x][y] = true;
            this.grassTimer[x][y] = 0;
          }
        }
      }
    }
  }

  /**
   * 指定座標に草があるかチェック
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @returns {boolean} 草の有無
   */
  hasGrass(x, y) {
    return this.grass[x][y];
  }

  /**
   * 指定座標の草を消費（食べる）
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @returns {boolean} 消費に成功したかどうか
   */
  consumeGrass(x, y) {
    if (this.grass[x][y]) {
      this.grass[x][y] = false;
      this.grassTimer[x][y] = 0; // 再生タイマーをリセット
      return true;
    }
    return false;
  }

  /**
   * グリッド全体の草の総数をカウント
   * @returns {number} 現在の草の総数
   */
  countGrass() {
    let count = 0;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.grass[x][y]) count++;
      }
    }
    return count;
  }
}

class Agent {
  /**
   * コンストラクタ
   * @param {number} x - 初期X座標
   * @param {number} y - 初期Y座標
   * @param {number} energy - 初期エネルギー値
   */
  constructor(x, y, energy) {
    /** 現在のX座標 */
    this.x = x;
    
    /** 現在のY座標 */
    this.y = y;
    
    /** 現在のエネルギー値 */
    this.energy = energy;
  }

  /**
   * ランダムに移動する
   * -1, 0, +1 のいずれかの方向にX, Y軸それぞれ移動
   * グリッドの端では反対側にワープ（トーラス構造）
   * @param {number} gridWidth - グリッドの幅
   * @param {number} gridHeight - グリッドの高さ
   */
  move(gridWidth, gridHeight) {
    // -1, 0, +1 のランダムな移動量を生成
    const dx = Math.floor(Math.random() * CONFIG.AGENT_MOVEMENT_RANGE) - 1;
    const dy = Math.floor(Math.random() * CONFIG.AGENT_MOVEMENT_RANGE) - 1;
    
    // 境界処理付きの座標更新（トーラス構造）
    this.x = (this.x + dx + gridWidth) % gridWidth;
    this.y = (this.y + dy + gridHeight) % gridHeight;
  }

  /**
   * エージェントが死亡しているかチェック
   * @returns {boolean} エネルギーが0以下の場合true
   */
  isDead() {
    return this.energy <= 0;
  }
}

class Herbivore extends Agent {
  /**
   * コンストラクタ
   * @param {number} x - 初期X座標
   * @param {number} y - 初期Y座標
   * @param {number} energy - 初期エネルギー値
   * @param {number} cooldown - 繁殖クールダウン初期値（デフォルト0）
   */
  constructor(x, y, energy, cooldown = 0) {
    super(x, y, energy);
    
    /** 繁殖後のクールダウンタイマー */
    this.cooldown = cooldown;
  }

  /**
   * 草食動物の1ステップの更新処理
   * 移動コスト消費 → クールダウン減少 → 移動 → 草の摂食
   * @param {SimulationConfig} config - シミュレーション設定
   * @param {Grid} grid - グリッド環境
   * @param {number} gridWidth - グリッドの幅
   * @param {number} gridHeight - グリッドの高さ
   */
  update(config, grid, gridWidth, gridHeight) {
    // 移動によるエネルギー消費
    this.energy -= config.values.herbMove;
    
    // クールダウンタイマーの減少
    if (this.cooldown > 0) this.cooldown--;
    
    // ランダム移動の実行
    this.move(gridWidth, gridHeight);
    
    // 現在地に草があれば摂食してエネルギー回復
    if (grid.consumeGrass(this.x, this.y)) {
      this.energy += config.values.herbGain;
    }
  }

  /**
   * 繁殖可能かどうかの判定
   * エネルギーが閾値を超え、かつクールダウンが終了している場合
   * @param {SimulationConfig} config - シミュレーション設定
   * @returns {boolean} 繁殖可能な場合true
   */
  canReproduce(config) {
    return this.energy > config.values.herbEnergy && this.cooldown === 0;
  }

  /**
   * 繁殖処理の実行
   * 自身のエネルギーを半分にし、同じエネルギーの子個体を生成
   * @param {SimulationConfig} config - シミュレーション設定
   * @returns {Herbivore} 新しく生成された子個体
   */
  reproduce(config) {
    // 親のエネルギーを半分に分割
    this.energy /= 2;
    
    // 親にクールダウンを設定
    this.cooldown = config.values.herbCooldown;
    
    // 同じ座標、同じエネルギーで子個体を生成
    return new Herbivore(this.x, this.y, this.energy, config.values.herbCooldown);
  }
}

class Carnivore extends Agent {
  /**
   * コンストラクタ
   * @param {number} x - 初期X座標
   * @param {number} y - 初期Y座標
   * @param {number} energy - 初期エネルギー値
   */
  constructor(x, y, energy) {
    super(x, y, energy);
  }

  /**
   * 肉食動物の1ステップの更新処理
   * 移動コスト消費 → 移動
   * （捕食は別途hunt()メソッドで処理）
   * @param {SimulationConfig} config - シミュレーション設定
   * @param {number} gridWidth - グリッドの幅
   * @param {number} gridHeight - グリッドの高さ
   */
  update(config, gridWidth, gridHeight) {
    // 移動によるエネルギー消費
    this.energy -= config.values.carnMove;
    
    // ランダム移動の実行
    this.move(gridWidth, gridHeight);
  }

  /**
   * 草食動物の捕食処理
   * 同じ座標にいる草食動物を探して捕食し、エネルギーを獲得
   * @param {Array<Herbivore>} herbivores - 草食動物の配列
   * @param {SimulationConfig} config - シミュレーション設定
   * @returns {boolean} 捕食に成功した場合true
   */
  hunt(herbivores, config) {
    // 同じ座標にいる草食動物を検索
    const preyIndex = herbivores.findIndex(h => h.x === this.x && h.y === this.y);
    
    if (preyIndex >= 0) {
      // 捕食対象を配列から削除
      herbivores.splice(preyIndex, 1);
      
      // エネルギーを獲得
      this.energy += config.values.carnGain;
      
      return true;
    }
    return false;
  }

  /**
   * 繁殖可能かどうかの判定
   * エネルギーが閾値を超えている場合
   * @param {SimulationConfig} config - シミュレーション設定
   * @returns {boolean} 繁殖可能な場合true
   */
  canReproduce(config) {
    return this.energy > config.values.carnEnergy;
  }

  /**
   * 繁殖処理の実行
   * 自身のエネルギーを半分にし、同じエネルギーの子個体を生成
   * @returns {Carnivore} 新しく生成された子個体
   */
  reproduce() {
    // 親のエネルギーを半分に分割
    this.energy /= 2;
    
    // 同じ座標、同じエネルギーで子個体を生成
    return new Carnivore(this.x, this.y, this.energy);
  }
}

// Node.js環境での条件付きエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CONFIG,
    UIManager,
    SimulationConfig,
    Grid,
    Agent,
    Herbivore,
    Carnivore
  };
}
