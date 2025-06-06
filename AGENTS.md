# AGENTS.md

This file provides guidance to OpenAI Codex and other AI coding assistants when working with code in this repository.

## Project Overview
This is a JavaScript multi-agent ecological simulation that models grass, herbivores, and carnivores in a grid environment. The project features a modern class-based architecture with comprehensive Japanese documentation and accessibility features.

## File Structure
- **index.html** - Main HTML page with semantic structure, accessibility features, and responsive design
- **styles.css** - External stylesheet with CSS custom properties and responsive design
- **main.js** - Complete simulation logic using ES6 classes with extensive Japanese comments
- **README.md** - Project documentation
- **CLAUDE.md** - Guidance file for Claude Code
- **AGENTS.md** - This guidance file for OpenAI Codex and other AI assistants

## Commands
- **Run:** Open index.html in a browser (no build step needed)
- **Lint:** No linting tools configured
- **Test:** No test suite configured

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
**IMPORTANT:** This file (AGENTS.md) must be kept synchronized with CLAUDE.md. Any updates to project structure, guidelines, or features should be applied to both files simultaneously to ensure consistency across different AI coding assistants.