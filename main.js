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
const speedVal = document.getElementById('speedVal');
const herbCooldownInput = document.getElementById('herbCooldown');
const herbCooldownVal = document.getElementById('herbCooldownVal');
const herbEnergyInput = document.getElementById('herbEnergy');
const herbEnergyVal = document.getElementById('herbEnergyVal');
const grassRegrowInput = document.getElementById('grassRegrow');
const grassRegrowVal = document.getElementById('grassRegrowVal');
const herbMoveInput = document.getElementById('herbMove');
const herbMoveVal = document.getElementById('herbMoveVal');
const carnMoveInput = document.getElementById('carnMove');
const carnMoveVal = document.getElementById('carnMoveVal');
const herbGainInput = document.getElementById('herbGain');
const herbGainVal = document.getElementById('herbGainVal');
const carnGainInput = document.getElementById('carnGain');
const carnGainVal = document.getElementById('carnGainVal');
const carnEnergyInput = document.getElementById('carnEnergy');
const carnEnergyVal = document.getElementById('carnEnergyVal');

let speedAccumulator = 0;

// update display values
speedVal.textContent = speedInput.value;
herbCooldownVal.textContent = herbCooldownInput.value;
herbEnergyVal.textContent = herbEnergyInput.value;
grassRegrowVal.textContent = grassRegrowInput.value;
herbMoveVal.textContent = herbMoveInput.value;
carnMoveVal.textContent = carnMoveInput.value;
herbGainVal.textContent = herbGainInput.value;
carnGainVal.textContent = carnGainInput.value;
carnEnergyVal.textContent = carnEnergyInput.value;
herbivoreReproduceEnergy = parseInt(herbEnergyInput.value, 10);

herbEnergyInput.addEventListener('input', () => {
  herbEnergyVal.textContent = herbEnergyInput.value;
  herbivoreReproduceEnergy = parseInt(herbEnergyInput.value, 10);
});
speedInput.addEventListener('input', () => {
  speedVal.textContent = speedInput.value;
});
herbCooldownInput.addEventListener('input', () => {
  herbCooldownVal.textContent = herbCooldownInput.value;
});
grassRegrowInput.addEventListener('input', () => {
  grassRegrowVal.textContent = grassRegrowInput.value;
});
herbMoveInput.addEventListener('input', () => {
  herbMoveVal.textContent = herbMoveInput.value;
});
carnMoveInput.addEventListener('input', () => {
  carnMoveVal.textContent = carnMoveInput.value;
});
herbGainInput.addEventListener('input', () => {
  herbGainVal.textContent = herbGainInput.value;
});
carnGainInput.addEventListener('input', () => {
  carnGainVal.textContent = carnGainInput.value;
});
carnEnergyInput.addEventListener('input', () => {
  carnEnergyVal.textContent = carnEnergyInput.value;
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
  speedAccumulator += parseFloat(speedInput.value);
  while (speedAccumulator >= 1) {
    step();
    speedAccumulator -= 1;
  }
  draw();
  requestAnimationFrame(loop);
}

loop();
