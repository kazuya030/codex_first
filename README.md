# Multi Agent Simulation

This repository contains a simple multi-agent simulation implemented in JavaScript. It models a grid-based world where herbivores and carnivores wander around, eat, reproduce, and die based on their energy.

## Repository Structure

- `index.html` - Minimal HTML page that sets up a 500x500 canvas and loads `main.js`.
- `main.js` - All simulation logic. Defines the environment, agent behaviour, drawing routines, and a main loop driven by `requestAnimationFrame`.
- `README.md` - This documentation file.

The Git repository currently has two local branches, `main` and `work`, both pointing to the latest commit. No remote repository is configured.

### Commit history

1. **Initial commit** – created the repository and added a basic README.
2. **Add basic multi-agent simulation** – introduced `index.html` and `main.js` and updated the README with usage instructions.
3. **Merge pull request #1** – merged the changes adding the simulation into the `main` branch.

## Simulation Overview

The world is a grid of 50x50 cells (10px per cell). Each cell may contain grass that regrows after being eaten.

### Agents

- **Herbivores**
  - Start with half of the energy required for reproduction.
  - Move randomly each step, losing 1 energy per move.
  - Eat grass on their current cell to gain 4 energy.
  - Reproduce when their energy exceeds 10, splitting their energy with the offspring.
  - Die when their energy drops to 0 or below.

- **Carnivores**
  - Start with half of the energy required for reproduction.
  - Move randomly each step, losing 2 energy per move.
  - If they land on a cell containing a herbivore, they consume it and gain 20 energy.
  - Reproduce when their energy exceeds 30, splitting their energy with the offspring.
  - Die when their energy drops to 0 or below.

### Grass Regrowth

After a herbivore eats grass, the patch becomes empty and starts a timer. Grass reappears on that cell after 20 steps.

### Rendering

The `draw` function paints each frame:

- Grass patches are green while present, or gray when eaten.
- Herbivores are drawn in blue.
- Carnivores are drawn in red.

## Running the Simulation

Simply open `index.html` in a modern web browser with JavaScript enabled. The simulation will start automatically and run continuously, updating the canvas on each animation frame.

No additional build tools or dependencies are required.

### Controls

Above the canvas there are sliders that let you tweak the behaviour while the simulation is running:

- **Time Speed** – how many simulation steps are performed per animation frame.
- **Herbivore Birth Cooldown** – number of steps a herbivore must wait after reproducing.
- **Herbivore Reproduction Energy** – energy threshold required for herbivores to give birth.

Adjusting these values updates the simulation immediately.

