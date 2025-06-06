# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a JavaScript multi-agent ecological simulation that models grass, herbivores, and carnivores in a grid environment. The project features a modern class-based architecture with comprehensive Japanese documentation and accessibility features.

## File Structure
- **index.html** - Main HTML page with semantic structure, accessibility features, and responsive design
- **styles.css** - External stylesheet with CSS custom properties and responsive design
- **main.js** - Complete simulation logic using ES6 classes with extensive Japanese comments
- **README.md** - Project documentation
- **CLAUDE.md** - This guidance file

## Commands
- **Run:** Open index.html in a browser (no build step needed)
- **Build:** `cd test && node generate-module.js` - Auto-generates main.module.js from main.js for testing
- **Lint:** No linting tools configured
- **Test:** Jest test suite with setup for DOM mocking, Chart.js mocking, and Canvas API mocking (test files: Agent.test.js, Grid.test.js, SimulationConfig.test.js, UIManager.test.js)
- **Pre-commit:** Update README.md before committing changes

## Code Style Guidelines
- **Formatting:** Use 2-space indentation throughout
- **Naming:** camelCase for variables and functions, PascalCase for classes
- **Variables:** Declare using const/let (avoid var)
- **DOM Access:** Use getElementById for element selection
- **Event Handlers:** Use addEventListener pattern
- **Comments:** Extensive Japanese documentation using JSDoc format
- **Error Handling:** Include try-catch blocks and console error logging

## Architecture
- **Single-page application** with vanilla JavaScript ES6+ features
- **Class-based design** with clear separation of concerns:
  - `UIManager` - Handles all UI controls and parameter synchronization
  - `SimulationConfig` - Manages simulation parameters and settings
  - `Grid` - Manages grass growth and environment state
  - `Agent`, `Herbivore`, `Carnivore` - Entity behavior with inheritance
  - `Renderer` - Canvas-based rendering system
  - `ChartManager` - Chart.js integration for population graphs
  - `Simulation` - Main orchestrator class
- **Canvas-based rendering** with optimized drawing routines
- **Chart.js integration** for real-time population tracking
- **Responsive design** using CSS Grid and Flexbox
- **Accessibility compliance** with ARIA labels and screen reader support
- **CSS custom properties** for consistent theming
- **Simulation loop** driven by requestAnimationFrame with speed control

## Key Features
- **Parameter controls:** Real-time adjustment via sliders and number inputs
- **Population tracking:** Dynamic charts showing grass, herbivore, and carnivore populations
- **Pause/Resume/Reset:** Full simulation control
- **Initial population settings:** Configurable starting conditions
- **Decimal parameter support:** Fine-grained control over simulation variables
- **Responsive UI:** Works on desktop and mobile devices
- **Internationalization:** Japanese interface and documentation

## Synchronization Rule
**IMPORTANT:** This file (CLAUDE.md) must be kept synchronized with AGENTS.md. Any updates to project structure, guidelines, or features should be applied to both files simultaneously to ensure consistency across different AI coding assistants.