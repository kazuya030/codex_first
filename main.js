const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');

const cellSize = 10;
const gridWidth = canvas.width / cellSize;
const gridHeight = canvas.height / cellSize;

// Environment
const grass = [];
const grassTimer = [];
let grassRegrowTime = 20; // steps
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

let herbivoreEnergyGainFromGrass = 4;
let carnivoreEnergyGainFromMeat = 20;
let herbivoreMoveCost = 1;
let carnivoreMoveCost = 2;
let herbivoreReproduceEnergy = 10;
let carnivoreReproduceEnergy = 30;

// UI elements
const speedInput = document.getElementById('speed');
const speedVal = document.getElementById('speedVal');
const herbCooldownInput = document.getElementById('herbCooldown');
const herbCooldownVal = document.getElementById('herbCooldownVal');
const herbEnergyInput = document.getElementById('herbEnergy');
const herbEnergyVal = document.getElementById('herbEnergyVal');
const grassRegrowInput = document.getElementById('grassRegrow');
const grassRegrowVal = document.getElementById('grassRegrowVal');
const herbGainInput = document.getElementById('herbGain');
const herbGainVal = document.getElementById('herbGainVal');
const herbMoveCostInput = document.getElementById('herbMoveCost');
const herbMoveCostVal = document.getElementById('herbMoveCostVal');
const carnGainInput = document.getElementById('carnGain');
const carnGainVal = document.getElementById('carnGainVal');
const carnMoveCostInput = document.getElementById('carnMoveCost');
const carnMoveCostVal = document.getElementById('carnMoveCostVal');
const carnEnergyInput = document.getElementById('carnEnergy');
const carnEnergyVal = document.getElementById('carnEnergyVal');

// update display values
speedVal.textContent = speedInput.value;
herbCooldownVal.textContent = herbCooldownInput.value;
herbEnergyVal.textContent = herbEnergyInput.value;
grassRegrowVal.textContent = grassRegrowInput.value;
herbGainVal.textContent = herbGainInput.value;
herbMoveCostVal.textContent = herbMoveCostInput.value;
carnGainVal.textContent = carnGainInput.value;
carnMoveCostVal.textContent = carnMoveCostInput.value;
carnEnergyVal.textContent = carnEnergyInput.value;
herbivoreReproduceEnergy = parseInt(herbEnergyInput.value, 10);
let herbivoreBirthCooldown = parseInt(herbCooldownInput.value, 10);
grassRegrowTime = parseInt(grassRegrowInput.value, 10);
herbivoreEnergyGainFromGrass = parseInt(herbGainInput.value, 10);
herbivoreMoveCost = parseFloat(herbMoveCostInput.value);
carnivoreEnergyGainFromMeat = parseInt(carnGainInput.value, 10);
carnivoreMoveCost = parseFloat(carnMoveCostInput.value);
carnivoreReproduceEnergy = parseInt(carnEnergyInput.value, 10);

herbEnergyInput.addEventListener('input', () => {
  herbEnergyVal.textContent = herbEnergyInput.value;
  herbivoreReproduceEnergy = parseInt(herbEnergyInput.value, 10);
});
speedInput.addEventListener('input', () => {
  speedVal.textContent = speedInput.value;
});
herbCooldownInput.addEventListener('input', () => {
  herbCooldownVal.textContent = herbCooldownInput.value;
  herbivoreBirthCooldown = parseInt(herbCooldownInput.value, 10);
});
grassRegrowInput.addEventListener('input', () => {
  grassRegrowVal.textContent = grassRegrowInput.value;
  grassRegrowTime = parseInt(grassRegrowInput.value, 10);
});
herbGainInput.addEventListener('input', () => {
  herbGainVal.textContent = herbGainInput.value;
  herbivoreEnergyGainFromGrass = parseInt(herbGainInput.value, 10);
});
herbMoveCostInput.addEventListener('input', () => {
  herbMoveCostVal.textContent = herbMoveCostInput.value;
  herbivoreMoveCost = parseFloat(herbMoveCostInput.value);
});
carnGainInput.addEventListener('input', () => {
  carnGainVal.textContent = carnGainInput.value;
  carnivoreEnergyGainFromMeat = parseInt(carnGainInput.value, 10);
});
carnMoveCostInput.addEventListener('input', () => {
  carnMoveCostVal.textContent = carnMoveCostInput.value;
  carnivoreMoveCost = parseFloat(carnMoveCostInput.value);
});
carnEnergyInput.addEventListener('input', () => {
  carnEnergyVal.textContent = carnEnergyInput.value;
  carnivoreReproduceEnergy = parseInt(carnEnergyInput.value, 10);
});

function randPos() {
  return {
    x: Math.floor(Math.random() * gridWidth),
    y: Math.floor(Math.random() * gridHeight)
  };
}

for (let i = 0; i < initialHerbivores; i++) {
  herbivores.push({ ...randPos(), energy: herbivoreReproduceEnergy / 2, cooldown: 0 });
}
for (let i = 0; i < initialCarnivores; i++) {
  carnivores.push({ ...randPos(), energy: carnivoreReproduceEnergy / 2 });
}

function moveAgent(agent) {
  const dx = Math.floor(Math.random() * 3) - 1;
  const dy = Math.floor(Math.random() * 3) - 1;
  agent.x = (agent.x + dx + gridWidth) % gridWidth;
  agent.y = (agent.y + dy + gridHeight) % gridHeight;
}

function step() {
  // Grass regrowth
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      if (!grass[x][y]) {
        grassTimer[x][y]++;
        if (grassTimer[x][y] >= grassRegrowTime) {
          grass[x][y] = true;
          grassTimer[x][y] = 0;
        }
      }
    }
  }

  // Herbivores act
  for (let i = herbivores.length - 1; i >= 0; i--) {
    const h = herbivores[i];
    h.energy -= herbivoreMoveCost;
    if (h.cooldown > 0) h.cooldown--;
    moveAgent(h);
    if (grass[h.x][h.y]) {
      grass[h.x][h.y] = false;
      grassTimer[h.x][h.y] = 0;
      h.energy += herbivoreEnergyGainFromGrass;
    }
    if (h.energy > herbivoreReproduceEnergy && h.cooldown === 0) {
      h.energy /= 2;
      herbivores.push({ x: h.x, y: h.y, energy: h.energy, cooldown: herbivoreBirthCooldown });
      h.cooldown = herbivoreBirthCooldown;
    }
    if (h.energy <= 0) {
      herbivores.splice(i, 1);
    }
  }

  // Carnivores act
  for (let i = carnivores.length - 1; i >= 0; i--) {
    const c = carnivores[i];
    c.energy -= carnivoreMoveCost;
    moveAgent(c);
    // check for herbivore at same position
    const preyIndex = herbivores.findIndex(h => h.x === c.x && h.y === c.y);
    if (preyIndex >= 0) {
      herbivores.splice(preyIndex, 1);
      c.energy += carnivoreEnergyGainFromMeat;
    }
    if (c.energy > carnivoreReproduceEnergy) {
      c.energy /= 2;
      carnivores.push({ x: c.x, y: c.y, energy: c.energy });
    }
    if (c.energy <= 0) {
      carnivores.splice(i, 1);
    }
  }
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

let stepAccumulator = 0;
function loop() {
  const speed = parseFloat(speedInput.value);
  stepAccumulator += speed;
  while (stepAccumulator >= 1) {
    step();
    stepAccumulator -= 1;
  }
  draw();
  requestAnimationFrame(loop);
}

loop();
