const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');

const cellSize = 10;
const gridWidth = canvas.width / cellSize;
const gridHeight = canvas.height / cellSize;

// Environment
const grass = [];
const grassTimer = [];
for (let x = 0; x < gridWidth; x++) {
  grass[x] = [];
  grassTimer[x] = [];
  for (let y = 0; y < gridHeight; y++) {
    grass[x][y] = true;
    grassTimer[x][y] = 0;
  }
}

// Agents
let herbivores = [];
let carnivores = [];

const initialHerbivores = 20;
const initialCarnivores = 5;

const herbivoreEnergyGainFromGrass = 4; // default, UI overrides
const carnivoreEnergyGainFromMeat = 20; // default, UI overrides
const herbivoreMoveCost = 1; // default, UI overrides
const carnivoreMoveCost = 2; // default, UI overrides
let herbivoreReproduceEnergy = 10;
const carnivoreReproduceEnergy = 30;

// UI elements
const speedInput = document.getElementById('speed');
const speedBox = document.getElementById('speedBox');
const speedVal = document.getElementById('speedVal');
const herbCooldownInput = document.getElementById('herbCooldown');
const herbCooldownBox = document.getElementById('herbCooldownBox');
const herbCooldownVal = document.getElementById('herbCooldownVal');
const herbEnergyInput = document.getElementById('herbEnergy');
const herbEnergyBox = document.getElementById('herbEnergyBox');
const herbEnergyVal = document.getElementById('herbEnergyVal');
const grassRegrowInput = document.getElementById('grassRegrow');
const grassRegrowBox = document.getElementById('grassRegrowBox');
const grassRegrowVal = document.getElementById('grassRegrowVal');
const herbMoveInput = document.getElementById('herbMove');
const herbMoveBox = document.getElementById('herbMoveBox');
const herbMoveVal = document.getElementById('herbMoveVal');
const carnMoveInput = document.getElementById('carnMove');
const carnMoveBox = document.getElementById('carnMoveBox');
const carnMoveVal = document.getElementById('carnMoveVal');
const herbGainInput = document.getElementById('herbGain');
const herbGainBox = document.getElementById('herbGainBox');
const herbGainVal = document.getElementById('herbGainVal');
const carnGainInput = document.getElementById('carnGain');
const carnGainBox = document.getElementById('carnGainBox');
const carnGainVal = document.getElementById('carnGainVal');
const carnEnergyInput = document.getElementById('carnEnergy');
const carnEnergyBox = document.getElementById('carnEnergyBox');
const carnEnergyVal = document.getElementById('carnEnergyVal');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const resetBtn = document.getElementById('resetBtn');

let running = true;

let speedAccumulator = 0;

let stepCount = 0;
const chartCtx = document.getElementById('populationChart').getContext('2d');
const maxDataPoints = 100;
const chart = new Chart(chartCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Grass',
        data: [],
        borderColor: 'green',
        fill: false
      },
      {
        label: 'Herbivores',
        data: [],
        borderColor: 'blue',
        fill: false
      }
    ]
  },
  options: {
    animation: false,
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

// update display values
speedVal.textContent = speedInput.value;
speedBox.value = speedInput.value;
herbCooldownVal.textContent = herbCooldownInput.value;
herbCooldownBox.value = herbCooldownInput.value;
herbEnergyVal.textContent = herbEnergyInput.value;
herbEnergyBox.value = herbEnergyInput.value;
grassRegrowVal.textContent = grassRegrowInput.value;
grassRegrowBox.value = grassRegrowInput.value;
herbMoveVal.textContent = herbMoveInput.value;
herbMoveBox.value = herbMoveInput.value;
carnMoveVal.textContent = carnMoveInput.value;
carnMoveBox.value = carnMoveInput.value;
herbGainVal.textContent = herbGainInput.value;
herbGainBox.value = herbGainInput.value;
carnGainVal.textContent = carnGainInput.value;
carnGainBox.value = carnGainInput.value;
carnEnergyVal.textContent = carnEnergyInput.value;
carnEnergyBox.value = carnEnergyInput.value;
herbivoreReproduceEnergy = parseInt(herbEnergyInput.value, 10);

function bindControl(slider, box, display, callback) {
  const fromSlider = () => {
    box.value = slider.value;
    display.textContent = slider.value;
    if (callback) callback(slider.value);
  };
  const fromBox = () => {
    slider.value = box.value;
    display.textContent = box.value;
    if (callback) callback(box.value);
  };
  slider.addEventListener('input', fromSlider);
  box.addEventListener('input', fromBox);
  slider.addEventListener('change', fromSlider);
  box.addEventListener('change', fromBox);
  fromSlider();
}

bindControl(speedInput, speedBox, speedVal);
bindControl(herbCooldownInput, herbCooldownBox, herbCooldownVal);
bindControl(herbEnergyInput, herbEnergyBox, herbEnergyVal, v => {
  herbivoreReproduceEnergy = parseInt(v, 10);
});
bindControl(grassRegrowInput, grassRegrowBox, grassRegrowVal);
bindControl(herbMoveInput, herbMoveBox, herbMoveVal);
bindControl(carnMoveInput, carnMoveBox, carnMoveVal);
bindControl(herbGainInput, herbGainBox, herbGainVal);
bindControl(carnGainInput, carnGainBox, carnGainVal);
bindControl(carnEnergyInput, carnEnergyBox, carnEnergyVal);

function randPos() {
  return {
    x: Math.floor(Math.random() * gridWidth),
    y: Math.floor(Math.random() * gridHeight)
  };
}

function initSimulation() {
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      grass[x][y] = true;
      grassTimer[x][y] = 0;
    }
  }
  herbivores = [];
  for (let i = 0; i < initialHerbivores; i++) {
    herbivores.push({ ...randPos(), energy: herbivoreReproduceEnergy / 2, cooldown: 0 });
  }
  carnivores = [];
  for (let i = 0; i < initialCarnivores; i++) {
    carnivores.push({ ...randPos(), energy: carnivoreReproduceEnergy / 2 });
  }
  stepCount = 0;
  speedAccumulator = 0;
  chart.data.labels = [];
  chart.data.datasets.forEach(ds => ds.data = []);
  chart.update();
}

initSimulation();

function moveAgent(agent) {
  const dx = Math.floor(Math.random() * 3) - 1;
  const dy = Math.floor(Math.random() * 3) - 1;
  agent.x = (agent.x + dx + gridWidth) % gridWidth;
  agent.y = (agent.y + dy + gridHeight) % gridHeight;
}

function step() {
  const regrowTime = parseInt(grassRegrowInput.value, 10);
  const herbMove = parseInt(herbMoveInput.value, 10);
  const carnMove = parseInt(carnMoveInput.value, 10);
  const herbGain = parseInt(herbGainInput.value, 10);
  const carnGain = parseInt(carnGainInput.value, 10);
  const carnReproduce = parseInt(carnEnergyInput.value, 10);
  // Grass regrowth
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      if (!grass[x][y]) {
        grassTimer[x][y]++;
        if (grassTimer[x][y] >= regrowTime) {
          grass[x][y] = true;
          grassTimer[x][y] = 0;
        }
      }
    }
  }

  // Herbivores act
  const reproduceEnergy = parseInt(herbEnergyInput.value, 10);
  const reproduceCooldown = parseInt(herbCooldownInput.value, 10);
  for (let i = herbivores.length - 1; i >= 0; i--) {
    const h = herbivores[i];
    h.energy -= herbMove;
    if (h.cooldown > 0) h.cooldown--;
    moveAgent(h);
    if (grass[h.x][h.y]) {
      grass[h.x][h.y] = false;
      grassTimer[h.x][h.y] = 0;
      h.energy += herbGain;
    }
    if (h.energy > reproduceEnergy && h.cooldown === 0) {
      h.energy /= 2;
      herbivores.push({ x: h.x, y: h.y, energy: h.energy, cooldown: reproduceCooldown });
      h.cooldown = reproduceCooldown;
    }
    if (h.energy <= 0) {
      herbivores.splice(i, 1);
    }
  }

  // Carnivores act
  for (let i = carnivores.length - 1; i >= 0; i--) {
    const c = carnivores[i];
    c.energy -= carnMove;
    moveAgent(c);
    // check for herbivore at same position
    const preyIndex = herbivores.findIndex(h => h.x === c.x && h.y === c.y);
    if (preyIndex >= 0) {
      herbivores.splice(preyIndex, 1);
      c.energy += carnGain;
    }
    if (c.energy > carnReproduce) {
      c.energy /= 2;
      carnivores.push({ x: c.x, y: c.y, energy: c.energy });
    }
    if (c.energy <= 0) {
      carnivores.splice(i, 1);
    }
  }

  stepCount++;
  updateChart();
}

function updateChart() {
  let grassCount = 0;
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      if (grass[x][y]) grassCount++;
    }
  }
  chart.data.labels.push(stepCount.toString());
  chart.data.datasets[0].data.push(grassCount);
  chart.data.datasets[1].data.push(herbivores.length);
  if (chart.data.labels.length > maxDataPoints) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    chart.data.datasets[1].data.shift();
  }
  chart.update();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw grass
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      if (grass[x][y]) {
        ctx.fillStyle = 'green';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else {
        ctx.fillStyle = '#ccc';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  // draw herbivores
  ctx.fillStyle = 'blue';
  herbivores.forEach(h => {
    ctx.fillRect(h.x * cellSize, h.y * cellSize, cellSize, cellSize);
  });

  // draw carnivores
  ctx.fillStyle = 'red';
  carnivores.forEach(c => {
    ctx.fillRect(c.x * cellSize, c.y * cellSize, cellSize, cellSize);
  });
}

function loop() {
  if (running) {
    speedAccumulator += parseFloat(speedInput.value);
    while (speedAccumulator >= 1) {
      step();
      speedAccumulator -= 1;
    }
  }
  draw();
  requestAnimationFrame(loop);
}

pauseBtn.addEventListener('click', () => { running = false; });
resumeBtn.addEventListener('click', () => { running = true; });
resetBtn.addEventListener('click', () => { initSimulation(); });

loop();
