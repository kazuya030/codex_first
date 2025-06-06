/**
 * テスト用のモジュールエクスポート版
 * main.jsから必要なクラスを抽出してエクスポート
 */

/**
 * アプリケーション全体の設定定数
 */
const CONFIG = {
  CELL_SIZE: 10,
  MAX_DATA_POINTS: 100,
  AGENT_MOVEMENT_RANGE: 3,
  DEFAULT_HERBIVORE_REPRODUCE_ENERGY: 10,
  DEFAULT_CARNIVORE_REPRODUCE_ENERGY: 30,
  COLORS: {
    GRASS: 'green',
    EMPTY_GRASS: '#ccc',
    HERBIVORE: 'blue',
    CARNIVORE: 'red'
  }
};

/**
 * UI要素とイベント処理を統合管理するクラス
 */
class UIManager {
  constructor() {
    this.elements = this.initializeElements();
    this.config = null;
  }

  setConfig(config) {
    this.config = config;
    this.bindControls();
  }

  initializeElements() {
    const getElement = (id) => {
      const element = document.getElementById(id);
      if (!element) {
        console.error(`Element with id '${id}' not found`);
      }
      return element;
    };

    return {
      canvas: getElement('world'),
      speed: { 
        input: getElement('speed'), 
        box: getElement('speedBox') 
      },
      herbCooldown: { 
        input: getElement('herbCooldown'), 
        box: getElement('herbCooldownBox') 
      },
      herbEnergy: { 
        input: getElement('herbEnergy'), 
        box: getElement('herbEnergyBox') 
      },
      grassRegrow: { 
        input: getElement('grassRegrow'), 
        box: getElement('grassRegrowBox') 
      },
      herbMove: { 
        input: getElement('herbMove'), 
        box: getElement('herbMoveBox') 
      },
      carnMove: { 
        input: getElement('carnMove'), 
        box: getElement('carnMoveBox') 
      },
      herbGain: { 
        input: getElement('herbGain'), 
        box: getElement('herbGainBox') 
      },
      carnGain: { 
        input: getElement('carnGain'), 
        box: getElement('carnGainBox') 
      },
      carnEnergy: { 
        input: getElement('carnEnergy'), 
        box: getElement('carnEnergyBox') 
      },
      initialHerb: { 
        input: getElement('initialHerb'), 
        box: getElement('initialHerbBox') 
      },
      initialCarn: { 
        input: getElement('initialCarn'), 
        box: getElement('initialCarnBox') 
      },
      pauseResumeBtn: getElement('pauseResumeBtn'),
      resetBtn: getElement('resetBtn'),
      populationChart: getElement('populationChart')
    };
  }

  bindControls() {
    Object.entries(this.elements).forEach(([key, element]) => {
      if (element && element.input && element.box) {
        this.bindControl(element.input, element.box, key === 'herbEnergy' ? (v) => {
          if (this.config) {
            this.config.herbivoreReproduceEnergy = parseFloat(v);
          }
        } : null);
      }
    });
  }

  bindControl(slider, box, callback) {
    const fromSlider = () => {
      box.value = slider.value;
      if (callback) callback(slider.value);
    };
    
    const fromBox = () => {
      slider.value = box.value;
      if (callback) callback(box.value);
    };
    
    slider.addEventListener('input', fromSlider);
    box.addEventListener('input', fromBox);
    slider.addEventListener('change', fromSlider);
    box.addEventListener('change', fromBox);
    
    fromSlider();
  }

  getValues() {
    return {
      speed: parseFloat(this.elements.speed.input.value),
      herbCooldown: parseFloat(this.elements.herbCooldown.input.value),
      herbEnergy: parseFloat(this.elements.herbEnergy.input.value),
      grassRegrow: parseFloat(this.elements.grassRegrow.input.value),
      herbMove: parseFloat(this.elements.herbMove.input.value),
      carnMove: parseFloat(this.elements.carnMove.input.value),
      herbGain: parseFloat(this.elements.herbGain.input.value),
      carnGain: parseFloat(this.elements.carnGain.input.value),
      carnEnergy: parseFloat(this.elements.carnEnergy.input.value),
      initialHerb: Math.floor(parseFloat(this.elements.initialHerb.input.value)),
      initialCarn: Math.floor(parseFloat(this.elements.initialCarn.input.value))
    };
  }
}

/**
 * シミュレーション設定の管理クラス
 */
class SimulationConfig {
  constructor() {
    this.herbivoreReproduceEnergy = CONFIG.DEFAULT_HERBIVORE_REPRODUCE_ENERGY;
    this.carnivoreReproduceEnergy = CONFIG.DEFAULT_CARNIVORE_REPRODUCE_ENERGY;
  }

  updateFromUI(uiValues) {
    this.values = uiValues;
  }
}

/**
 * グリッド環境の管理クラス
 */
class Grid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grass = [];
    this.grassTimer = [];
    this.initialize();
  }

  initialize() {
    for (let x = 0; x < this.width; x++) {
      this.grass[x] = [];
      this.grassTimer[x] = [];
      for (let y = 0; y < this.height; y++) {
        this.grass[x][y] = true;
        this.grassTimer[x][y] = 0;
      }
    }
  }

  update(regrowTime) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (!this.grass[x][y]) {
          this.grassTimer[x][y]++;
          if (this.grassTimer[x][y] >= regrowTime) {
            this.grass[x][y] = true;
            this.grassTimer[x][y] = 0;
          }
        }
      }
    }
  }

  hasGrass(x, y) {
    return this.grass[x][y];
  }

  consumeGrass(x, y) {
    if (this.grass[x][y]) {
      this.grass[x][y] = false;
      this.grassTimer[x][y] = 0;
      return true;
    }
    return false;
  }

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
 */
class Agent {
  constructor(x, y, energy) {
    this.x = x;
    this.y = y;
    this.energy = energy;
  }

  move(gridWidth, gridHeight) {
    const dx = Math.floor(Math.random() * CONFIG.AGENT_MOVEMENT_RANGE) - 1;
    const dy = Math.floor(Math.random() * CONFIG.AGENT_MOVEMENT_RANGE) - 1;
    
    this.x = (this.x + dx + gridWidth) % gridWidth;
    this.y = (this.y + dy + gridHeight) % gridHeight;
  }

  isDead() {
    return this.energy <= 0;
  }
}

/**
 * 草食動物クラス
 */
class Herbivore extends Agent {
  constructor(x, y, energy, cooldown = 0) {
    super(x, y, energy);
    this.cooldown = cooldown;
  }

  update(config, grid, gridWidth, gridHeight) {
    this.energy -= config.values.herbMove;
    
    if (this.cooldown > 0) this.cooldown--;
    
    this.move(gridWidth, gridHeight);
    
    if (grid.consumeGrass(this.x, this.y)) {
      this.energy += config.values.herbGain;
    }
  }

  canReproduce(config) {
    return this.energy > config.values.herbEnergy && this.cooldown === 0;
  }

  reproduce(config) {
    this.energy /= 2;
    this.cooldown = config.values.herbCooldown;
    
    return new Herbivore(this.x, this.y, this.energy, config.values.herbCooldown);
  }
}

/**
 * 肉食動物クラス
 */
class Carnivore extends Agent {
  constructor(x, y, energy) {
    super(x, y, energy);
  }

  update(config, gridWidth, gridHeight) {
    this.energy -= config.values.carnMove;
    this.move(gridWidth, gridHeight);
  }

  hunt(herbivores, config) {
    const preyIndex = herbivores.findIndex(h => h.x === this.x && h.y === this.y);
    
    if (preyIndex >= 0) {
      herbivores.splice(preyIndex, 1);
      this.energy += config.values.carnGain;
      return true;
    }
    return false;
  }

  canReproduce(config) {
    return this.energy > config.values.carnEnergy;
  }

  reproduce() {
    this.energy /= 2;
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