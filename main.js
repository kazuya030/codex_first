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

let herbivoreReproduceEnergy = 10;
const carnivoreReproduceEnergy = 30;

// UI elements
const speedInput = document.getElementById('speed');
const speedBox = document.getElementById('speedBox');
const herbCooldownInput = document.getElementById('herbCooldown');
const herbCooldownBox = document.getElementById('herbCooldownBox');
const herbEnergyInput = document.getElementById('herbEnergy');
const herbEnergyBox = document.getElementById('herbEnergyBox');
const grassRegrowInput = document.getElementById('grassRegrow');
const grassRegrowBox = document.getElementById('grassRegrowBox');
const herbMoveInput = document.getElementById('herbMove');
const herbMoveBox = document.getElementById('herbMoveBox');
const carnMoveInput = document.getElementById('carnMove');
const carnMoveBox = document.getElementById('carnMoveBox');
const herbGainInput = document.getElementById('herbGain');
const herbGainBox = document.getElementById('herbGainBox');
const carnGainInput = document.getElementById('carnGain');
const carnGainBox = document.getElementById('carnGainBox');
const carnEnergyInput = document.getElementById('carnEnergy');
const carnEnergyBox = document.getElementById('carnEnergyBox');
const initialHerbInput = document.getElementById('initialHerb');
const initialHerbBox = document.getElementById('initialHerbBox');
const initialCarnInput = document.getElementById('initialCarn');
const initialCarnBox = document.getElementById('initialCarnBox');

const pauseResumeBtn = document.getElementById('pauseResumeBtn');
const resetBtn = document.getElementById('resetBtn');
let animationId;

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
        fill: false,
        hidden: true
      },
      {
        label: 'Herbivores',
        data: [],
        borderColor: 'blue',
        fill: false
      },
      {
        label: 'Carnivores',
        data: [],
        borderColor: 'red',
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
speedBox.value = speedInput.value;
herbCooldownBox.value = herbCooldownInput.value;
herbEnergyBox.value = herbEnergyInput.value;
grassRegrowBox.value = grassRegrowInput.value;
herbMoveBox.value = herbMoveInput.value;
carnMoveBox.value = carnMoveInput.value;
herbGainBox.value = herbGainInput.value;
carnGainBox.value = carnGainInput.value;
carnEnergyBox.value = carnEnergyInput.value;
initialHerbBox.value = initialHerbInput.value;
initialCarnBox.value = initialCarnInput.value;
herbivoreReproduceEnergy = parseFloat(herbEnergyInput.value);

function bindControl(slider, box, callback) {
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

bindControl(speedInput, speedBox);
bindControl(herbCooldownInput, herbCooldownBox);
bindControl(herbEnergyInput, herbEnergyBox, v => {
  herbivoreReproduceEnergy = parseFloat(v);
});
bindControl(grassRegrowInput, grassRegrowBox);
bindControl(herbMoveInput, herbMoveBox);
bindControl(carnMoveInput, carnMoveBox);
bindControl(herbGainInput, herbGainBox);
bindControl(carnGainInput, carnGainBox);
bindControl(carnEnergyInput, carnEnergyBox);
bindControl(initialHerbInput, initialHerbBox);
bindControl(initialCarnInput, initialCarnBox);

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
  const currentInitialHerbivores = Math.floor(parseFloat(initialHerbInput.value));
  const currentInitialCarnivores = Math.floor(parseFloat(initialCarnInput.value));
  herbivores = [];
  for (let i = 0; i < currentInitialHerbivores; i++) {
    herbivores.push({ ...randPos(), energy: herbivoreReproduceEnergy / 2, cooldown: 0 });
  }
  carnivores = [];
  for (let i = 0; i < currentInitialCarnivores; i++) {
    carnivores.push({ ...randPos(), energy: carnivoreReproduceEnergy / 2 });
  }
  stepCount = 0;
  speedAccumulator = 0;
  chart.data.labels = [];
  chart.data.datasets.forEach(ds => ds.data = []);
  chart.update();
  draw();
}

initSimulation();
pauseResumeBtn.textContent = running ? 'Pause' : 'Resume';

function moveAgent(agent) {
  const dx = Math.floor(Math.random() * 3) - 1;
  const dy = Math.floor(Math.random() * 3) - 1;
  agent.x = (agent.x + dx + gridWidth) % gridWidth;
  agent.y = (agent.y + dy + gridHeight) % gridHeight;
}

function step() {
  const regrowTime = parseFloat(grassRegrowInput.value);
  const herbMove = parseFloat(herbMoveInput.value);
  const carnMove = parseFloat(carnMoveInput.value);
  const herbGain = parseFloat(herbGainInput.value);
  const carnGain = parseFloat(carnGainInput.value);
  const carnReproduce = parseFloat(carnEnergyInput.value);
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
  const reproduceEnergy = parseFloat(herbEnergyInput.value);
  const reproduceCooldown = parseFloat(herbCooldownInput.value);
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
  chart.data.datasets[2].data.push(carnivores.length);
  if (chart.data.labels.length > maxDataPoints) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    chart.data.datasets[1].data.shift();
    chart.data.datasets[2].data.shift();
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
  if (!running) {
    draw();
    return;
  }
  speedAccumulator += parseFloat(speedInput.value);
  while (speedAccumulator >= 1) {
    step();
    speedAccumulator -= 1;
  }
  draw();
  animationId = requestAnimationFrame(loop);
}

pauseResumeBtn.addEventListener('click', () => {
  running = !running;
  pauseResumeBtn.textContent = running ? 'Pause' : 'Resume';
  if (running) {
    animationId = requestAnimationFrame(loop);
  } else {
    cancelAnimationFrame(animationId);
    draw();
  }
});
resetBtn.addEventListener('click', () => {
  initSimulation();
  pauseResumeBtn.textContent = running ? 'Pause' : 'Resume';
  if (!running) {
    draw();
  }
});

animationId = requestAnimationFrame(loop);
