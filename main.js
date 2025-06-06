/**
 * Multi-Agent Simulation - 生態系シミュレーション
 * 
 * このプログラムは草食動物と肉食動物の生態系をシミュレートします。
 * - 草食動物：草を食べて生存・繁殖する
 * - 肉食動物：草食動物を捕食して生存・繁殖する
 * - 草：一定時間で再生する
 * 
 * @author Claude Code
 * @version 2.0 (リファクタリング版)
 */

/**
 * アプリケーション全体の設定定数
 * マジックナンバーを排除し、設定を一箇所に集約
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

/**
 * UI要素とイベント処理を統合管理するクラス
 * HTMLの各種コントロール要素へのアクセスと、
 * スライダーと数値入力ボックスの同期を担当
 */
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

/**
 * シミュレーション設定の管理クラス
 * UIから取得した設定値を保持し、各エージェントクラスからアクセス可能にする
 */
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

/**
 * グリッド環境の管理クラス
 * 草の生育状態と再生タイマーを管理
 */
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

/**
 * エージェント（草食動物・肉食動物）の基底クラス
 * 共通の属性（位置、エネルギー）と基本動作（移動、生存判定）を定義
 */
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

/**
 * 草食動物クラス
 * Agentクラスを継承し、草食動物特有の行動を実装
 */
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

/**
 * 肉食動物クラス
 * Agentクラスを継承し、肉食動物特有の行動を実装
 */
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

/**
 * キャンバス描画管理クラス
 * シミュレーション環境の視覚的な描画を担当
 */
class Renderer {
  /**
   * コンストラクタ
   * @param {HTMLCanvasElement} canvas - 描画対象のキャンバス要素
   */
  constructor(canvas) {
    /** 描画対象のキャンバス要素 */
    this.canvas = canvas;
    
    /** 2D描画コンテキスト */
    this.ctx = canvas.getContext('2d');
    
    /** グリッドの幅（セル数） */
    this.gridWidth = canvas.width / CONFIG.CELL_SIZE;
    
    /** グリッドの高さ（セル数） */
    this.gridHeight = canvas.height / CONFIG.CELL_SIZE;
  }

  /**
   * キャンバス全体をクリア
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 草の描画
   * 各セルを緑色（草あり）または薄灰色（草なし）で塗りつぶし
   * @param {Grid} grid - グリッド環境オブジェクト
   */
  drawGrass(grid) {
    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        // 草の有無に応じて色を決定
        this.ctx.fillStyle = grid.hasGrass(x, y) ? 
          CONFIG.COLORS.GRASS : CONFIG.COLORS.EMPTY_GRASS;
        
        // セルを塗りつぶし
        this.ctx.fillRect(
          x * CONFIG.CELL_SIZE, 
          y * CONFIG.CELL_SIZE, 
          CONFIG.CELL_SIZE, 
          CONFIG.CELL_SIZE
        );
      }
    }
  }

  /**
   * エージェント群の描画
   * 指定された色でエージェントの配列を描画
   * @param {Array<Agent>} agents - 描画するエージェントの配列
   * @param {string} color - 描画色
   */
  drawAgents(agents, color) {
    this.ctx.fillStyle = color;
    agents.forEach(agent => {
      this.ctx.fillRect(
        agent.x * CONFIG.CELL_SIZE, 
        agent.y * CONFIG.CELL_SIZE, 
        CONFIG.CELL_SIZE, 
        CONFIG.CELL_SIZE
      );
    });
  }

  /**
   * シミュレーション環境全体の描画
   * 草 → 草食動物 → 肉食動物の順序で重ね描き
   * @param {Grid} grid - グリッド環境
   * @param {Array<Herbivore>} herbivores - 草食動物配列
   * @param {Array<Carnivore>} carnivores - 肉食動物配列
   */
  render(grid, herbivores, carnivores) {
    // キャンバスクリア
    this.clear();
    
    // 背景として草を描画
    this.drawGrass(grid);
    
    // 草食動物を青で描画
    this.drawAgents(herbivores, CONFIG.COLORS.HERBIVORE);
    
    // 肉食動物を赤で描画（最前面）
    this.drawAgents(carnivores, CONFIG.COLORS.CARNIVORE);
  }
}

/**
 * チャート管理クラス
 * 個体数推移グラフの作成・更新を担当
 */
class ChartManager {
  /**
   * コンストラクタ
   * Chart.jsを使用してラインチャートを初期化
   * @param {HTMLCanvasElement} canvasElement - チャート描画用キャンバス
   */
  constructor(canvasElement) {
    /** Chart.jsチャートインスタンス */
    this.chart = new Chart(canvasElement.getContext('2d'), {
      type: 'line',
      data: {
        /** 時間軸ラベル配列 */
        labels: [],
        datasets: [
          {
            label: 'Grass',
            data: [],
            borderColor: CONFIG.COLORS.GRASS,
            fill: false,
            hidden: true // 初期状態では非表示
          },
          {
            label: 'Herbivores',
            data: [],
            borderColor: CONFIG.COLORS.HERBIVORE,
            fill: false
          },
          {
            label: 'Carnivores',
            data: [],
            borderColor: CONFIG.COLORS.CARNIVORE,
            fill: false
          }
        ]
      },
      options: {
        /** アニメーション無効化（パフォーマンス向上） */
        animation: false,
        /** レスポンシブ無効化（固定サイズ） */
        responsive: false,
        scales: {
          x: { 
            title: { display: true, text: 'Time' } 
          },
          y: { 
            title: { display: true, text: 'Count' }, 
            beginAtZero: true 
          }
        }
      }
    });
  }

  /**
   * チャートデータの更新
   * 新しいデータポイントを追加し、古いデータを削除
   * @param {number} stepCount - 現在のステップ数
   * @param {number} grassCount - 草の総数
   * @param {number} herbivoreCount - 草食動物数
   * @param {number} carnivoreCount - 肉食動物数
   */
  update(stepCount, grassCount, herbivoreCount, carnivoreCount) {
    // 新しいデータポイントを追加
    this.chart.data.labels.push(stepCount.toString());
    this.chart.data.datasets[0].data.push(grassCount);
    this.chart.data.datasets[1].data.push(herbivoreCount);
    this.chart.data.datasets[2].data.push(carnivoreCount);

    // データポイント数の制限（メモリ使用量制御）
    if (this.chart.data.labels.length > CONFIG.MAX_DATA_POINTS) {
      this.chart.data.labels.shift();
      this.chart.data.datasets.forEach(dataset => dataset.data.shift());
    }
    
    // チャートの再描画
    this.chart.update();
  }

  /**
   * チャートデータのリセット
   * すべてのデータポイントを削除
   */
  reset() {
    this.chart.data.labels = [];
    this.chart.data.datasets.forEach(dataset => dataset.data = []);
    this.chart.update();
  }
}

/**
 * メインシミュレーションクラス
 * 全体の統合管理と実行制御を担当
 */
class Simulation {
  /**
   * コンストラクタ
   * 各コンポーネントの初期化と依存関係の設定
   */
  constructor() {
    // ===== コンポーネントの初期化 =====
    /** UI管理インスタンス */
    this.uiManager = new UIManager();
    
    /** シミュレーション設定インスタンス */
    this.simulationConfig = new SimulationConfig();
    
    // UI管理とシミュレーション設定を連携
    this.uiManager.setConfig(this.simulationConfig);
    
    /** メイン描画キャンバス */
    this.canvas = this.uiManager.elements.canvas;
    
    /** 描画管理インスタンス */
    this.renderer = new Renderer(this.canvas);
    
    /** チャート管理インスタンス */
    this.chartManager = new ChartManager(this.uiManager.elements.populationChart);
    
    // ===== シミュレーション環境の初期化 =====
    /** グリッド環境インスタンス */
    this.grid = new Grid(this.renderer.gridWidth, this.renderer.gridHeight);
    
    /** 草食動物配列 */
    this.herbivores = [];
    
    /** 肉食動物配列 */
    this.carnivores = [];
    
    // ===== 実行制御変数 =====
    /** シミュレーション実行状態 */
    this.running = true;
    
    /** 現在のステップ数 */
    this.stepCount = 0;
    
    /** 速度制御用アキュムレータ */
    this.speedAccumulator = 0;
    
    /** アニメーションフレームID */
    this.animationId = null;

    // ===== 初期化処理の実行 =====
    this.initializeSimulation();
    this.setupEventListeners();
    this.start();
  }

  /**
   * シミュレーション環境の初期化
   * グリッドリセット、エージェント配置、チャートリセット
   */
  initializeSimulation() {
    // グリッド環境のリセット
    this.grid.initialize();
    
    // エージェント配列のクリア
    this.herbivores = [];
    this.carnivores = [];
    
    // 現在のUI設定値を取得
    const values = this.uiManager.getValues();
    this.simulationConfig.updateFromUI(values);
    
    // ===== 草食動物の初期配置 =====
    for (let i = 0; i < values.initialHerb; i++) {
      const pos = this.getRandomPosition();
      this.herbivores.push(new Herbivore(
        pos.x, 
        pos.y, 
        this.simulationConfig.herbivoreReproduceEnergy / 2
      ));
    }
    
    // ===== 肉食動物の初期配置 =====
    for (let i = 0; i < values.initialCarn; i++) {
      const pos = this.getRandomPosition();
      this.carnivores.push(new Carnivore(
        pos.x, 
        pos.y, 
        this.simulationConfig.carnivoreReproduceEnergy / 2
      ));
    }
    
    // ===== 状態変数のリセット =====
    this.stepCount = 0;
    this.speedAccumulator = 0;
    
    // チャートとキャンバスの初期化
    this.chartManager.reset();
    this.renderer.render(this.grid, this.herbivores, this.carnivores);
  }

  /**
   * ランダムな位置座標を生成
   * @returns {Object} x, y座標を含むオブジェクト
   */
  getRandomPosition() {
    return {
      x: Math.floor(Math.random() * this.renderer.gridWidth),
      y: Math.floor(Math.random() * this.renderer.gridHeight)
    };
  }

  /**
   * シミュレーションの1ステップ実行
   * 環境更新 → エージェント更新 → 繁殖処理 → 死亡処理
   */
  step() {
    // UI設定値の最新化
    const values = this.uiManager.getValues();
    this.simulationConfig.updateFromUI(values);
    
    // ===== 環境の更新 =====
    this.grid.update(values.grassRegrow);
    
    // ===== 草食動物の処理 =====
    // 逆順ループで安全な要素削除
    for (let i = this.herbivores.length - 1; i >= 0; i--) {
      const herbivore = this.herbivores[i];
      
      // 個体の状態更新
      herbivore.update(
        this.simulationConfig, 
        this.grid, 
        this.renderer.gridWidth, 
        this.renderer.gridHeight
      );
      
      // 繁殖処理
      if (herbivore.canReproduce(this.simulationConfig)) {
        const offspring = herbivore.reproduce(this.simulationConfig);
        this.herbivores.push(offspring);
      }
      
      // 死亡処理
      if (herbivore.isDead()) {
        this.herbivores.splice(i, 1);
      }
    }
    
    // ===== 肉食動物の処理 =====
    // 逆順ループで安全な要素削除
    for (let i = this.carnivores.length - 1; i >= 0; i--) {
      const carnivore = this.carnivores[i];
      
      // 個体の状態更新
      carnivore.update(
        this.simulationConfig, 
        this.renderer.gridWidth, 
        this.renderer.gridHeight
      );
      
      // 捕食処理
      carnivore.hunt(this.herbivores, this.simulationConfig);
      
      // 繁殖処理
      if (carnivore.canReproduce(this.simulationConfig)) {
        const offspring = carnivore.reproduce();
        this.carnivores.push(offspring);
      }
      
      // 死亡処理
      if (carnivore.isDead()) {
        this.carnivores.splice(i, 1);
      }
    }
    
    // ステップカウンタの増加とチャート更新
    this.stepCount++;
    this.updateChart();
  }

  /**
   * チャートの更新処理
   * 現在の各個体数をチャートに反映
   */
  updateChart() {
    const grassCount = this.grid.countGrass();
    this.chartManager.update(
      this.stepCount, 
      grassCount, 
      this.herbivores.length, 
      this.carnivores.length
    );
  }

  /**
   * メインループ処理
   * 速度制御とアニメーションフレーム管理
   */
  loop() {
    // 停止中は描画のみ実行
    if (!this.running) {
      this.renderer.render(this.grid, this.herbivores, this.carnivores);
      return;
    }
    
    // 速度制御ロジック
    const values = this.uiManager.getValues();
    this.speedAccumulator += values.speed;
    
    // アキュムレータが1以上になった分だけステップ実行
    while (this.speedAccumulator >= 1) {
      this.step();
      this.speedAccumulator -= 1;
    }
    
    // 描画更新
    this.renderer.render(this.grid, this.herbivores, this.carnivores);
    
    // 次のフレームをスケジュール
    this.animationId = requestAnimationFrame(() => this.loop());
  }

  /**
   * シミュレーション開始
   */
  start() {
    this.animationId = requestAnimationFrame(() => this.loop());
  }

  /**
   * シミュレーション一時停止
   */
  pause() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    // 停止状態でも最終描画を実行
    this.renderer.render(this.grid, this.herbivores, this.carnivores);
  }

  /**
   * シミュレーション再開
   */
  resume() {
    this.running = true;
    this.start();
  }

  /**
   * シミュレーションリセット
   */
  reset() {
    this.initializeSimulation();
    // 停止中の場合は描画更新
    if (!this.running) {
      this.renderer.render(this.grid, this.herbivores, this.carnivores);
    }
  }

  /**
   * UIイベントリスナーの設定
   * ボタンクリック等のユーザー操作への対応
   */
  setupEventListeners() {
    // ===== 一時停止/再開ボタン =====
    this.uiManager.elements.pauseResumeBtn.addEventListener('click', () => {
      if (this.running) {
        this.pause();
        this.uiManager.elements.pauseResumeBtn.textContent = 'Resume';
      } else {
        this.resume();
        this.uiManager.elements.pauseResumeBtn.textContent = 'Pause';
      }
    });

    // ===== リセットボタン =====
    this.uiManager.elements.resetBtn.addEventListener('click', () => {
      this.reset();
      // ボタンテキストを現在の状態に合わせて更新
      this.uiManager.elements.pauseResumeBtn.textContent = 
        this.running ? 'Pause' : 'Resume';
    });
  }
}

// ===== グローバル変数（後方互換性のため保持） =====
/** 
 * 後方互換性のためのグローバル変数
 * UIManagerから参照される可能性があるため残している
 */
let simulationConfig;

// ===== アプリケーション開始処理 =====
/**
 * DOM読み込み完了後にシミュレーションを開始
 * エラーハンドリングを含む安全な初期化
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
    // メインシミュレーションインスタンスの作成
    const simulation = new Simulation();
    
    // グローバル変数の設定（後方互換性）
    simulationConfig = simulation.simulationConfig;
    
    console.log('Multi-Agent Simulation initialized successfully');
  } catch (error) {
    console.error('Failed to initialize simulation:', error);
    
    // ユーザーへのエラー表示（オプション）
    const errorMessage = document.createElement('div');
    errorMessage.style.cssText = `
      position: fixed; top: 20px; left: 20px; 
      background: #ffebee; color: #c62828; 
      padding: 10px; border-radius: 4px; 
      border: 1px solid #e57373;
      font-family: monospace;
      z-index: 1000;
    `;
    errorMessage.textContent = `シミュレーションの初期化に失敗しました: ${error.message}`;
    document.body.appendChild(errorMessage);
  }
});