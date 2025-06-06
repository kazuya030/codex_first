# Multi Agent Simulation

This repository contains a comprehensive multi-agent ecological simulation implemented in modern JavaScript. It models a grid-based ecosystem where grass, herbivores, and carnivores interact in a dynamic environment with real-time parameter control and population tracking.

## Features

- 🌱 **Three-tier ecosystem**: Grass → Herbivores → Carnivores
- 🎛️ **Real-time controls**: Adjust all simulation parameters while running
- 📊 **Population tracking**: Live charts showing species populations over time
- ⏯️ **Simulation controls**: Pause, resume, and reset functionality
- 📱 **Responsive design**: Works on desktop and mobile devices
- ♿ **Accessible**: Full screen reader support and keyboard navigation
- 🌐 **Bilingual**: Japanese interface with English documentation

## Repository Structure

- **`index.html`** - Main HTML page with semantic structure and accessibility features
- **`styles.css`** - External stylesheet with CSS custom properties and responsive design
- **`main.js`** - Complete simulation logic using ES6 classes with extensive Japanese documentation
- **`test/`** - Test suite with Jest configuration and auto-generation tools
  - **`generate-module.js`** - Script to auto-generate test module from main.js
  - **`main.module.js`** - Auto-generated module exports for testing (do not edit manually)
  - **`setup.js`** - Jest configuration with DOM and Canvas mocking
  - **`*.test.js`** - Unit tests for all major classes
- **`README.md`** - This documentation file
- **`CLAUDE.md`** - Development guidance file
- **`AGENTS.md`** - AI assistant guidance file

## Architecture

The simulation uses a modern class-based architecture:

- **`UIManager`** - Handles all UI controls and parameter synchronization
- **`SimulationConfig`** - Manages simulation parameters and settings
- **`Grid`** - Manages grass growth and environment state
- **`Agent`** - Base class for all moving entities
- **`Herbivore`** - Grass-eating agents with reproduction cooldown
- **`Carnivore`** - Predator agents that hunt herbivores
- **`Renderer`** - Canvas-based rendering system
- **`ChartManager`** - Chart.js integration for population graphs
- **`Simulation`** - Main orchestrator class

## Simulation Mechanics

### Environment
- **Grid size**: 50×50 cells (10px per cell)
- **Grass regrowth**: Configurable timer-based regeneration
- **Wraparound world**: Agents moving off one edge appear on the opposite side

### Herbivores (Blue)
- Move randomly, consuming energy per step
- Eat grass to gain energy
- Reproduce when energy exceeds threshold (after cooldown period)
- Die when energy reaches zero

### Carnivores (Red)
- Move randomly, consuming more energy than herbivores
- Hunt herbivores on the same cell for energy
- Reproduce when energy exceeds threshold
- Die when energy reaches zero

### Grass (Green/Gray)
- Grows on all cells initially
- Consumed by herbivores, leaving empty patches (gray)
- Regenerates after configurable time period

## Running the Simulation

1. Open `index.html` in any modern web browser
2. No build tools or dependencies required
3. Simulation starts automatically
4. Use controls to adjust parameters in real-time

A live version is hosted on GitHub Pages: <https://kazuya030.github.io/codex_first/>

## Development

### Testing

The project includes a comprehensive Jest test suite:

```bash
# Run all tests
npm test

# Generate test module from main.js
cd test && node generate-module.js
```

**Test Coverage:**
- **67 tests** across 4 test suites
- Unit tests for all major classes: Agent, Herbivore, Carnivore, Grid, UIManager, SimulationConfig
- DOM and Canvas API mocking for browser environment simulation
- Automatic synchronization between main.js and test module

### File Synchronization

The project maintains two versions of the core logic:
- **`main.js`** - Production version with full DOM integration
- **`test/main.module.js`** - Auto-generated test version with module exports

**Important:** Never edit `test/main.module.js` manually. Always run `cd test && node generate-module.js` after modifying `main.js` to regenerate the test module.

## Controls

The interface provides comprehensive real-time control over all simulation parameters:

### Basic Settings
- **Simulation Speed** - Execution speed multiplier (0.1-10x)

### Herbivore Settings
- **Birth Cooldown** - Steps required between reproductions (0-50)
- **Reproduction Energy** - Energy threshold for reproduction (5-30)
- **Move Cost** - Energy lost per movement step (0-5)
- **Energy Gain** - Energy gained from eating grass (1-10)
- **Initial Count** - Starting population (1-50)

### Carnivore Settings
- **Move Cost** - Energy lost per movement step (0-5)
- **Energy Gain** - Energy gained from hunting (1-50)
- **Reproduction Energy** - Energy threshold for reproduction (10-50)
- **Initial Count** - Starting population (1-200)

### Environment Settings
- **Grass Regrow Time** - Steps for grass regeneration (1-100)

## Population Chart

The simulation includes a real-time population chart showing:
- **Grass** (Green line) - Total grass patches (initially hidden)
- **Herbivores** (Blue line) - Herbivore population
- **Carnivores** (Red line) - Carnivore population

## Technical Features

- **ES6+ JavaScript**: Modern class syntax and features
- **Canvas Rendering**: Optimized 2D graphics
- **Chart.js Integration**: Professional population tracking
- **CSS Custom Properties**: Consistent theming system
- **Responsive Design**: CSS Grid and Flexbox layouts
- **Accessibility**: ARIA labels, screen reader support
- **Parameter Persistence**: Real-time UI synchronization
- **Error Handling**: Comprehensive error checking and logging

## Browser Compatibility

Requires a modern browser with support for:
- ES6 Classes
- Canvas 2D API
- CSS Custom Properties
- requestAnimationFrame

Tested on Chrome, Firefox, Safari, and Edge.
