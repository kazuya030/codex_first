# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a JavaScript multi-agent simulation that models herbivores and carnivores in a grid environment.

## Commands
- **Run:** Open index.html in a browser (no build step needed)
- **Lint:** No linting tools configured
- **Test:** No test suite configured

## Code Style Guidelines
- **Formatting:** Use 2-space indentation
- **Naming:** camelCase for variables and functions
- **Variables:** Declare using const/let (avoid var)
- **DOM Access:** Use getElementById for element selection
- **Event Handlers:** Use addEventListener pattern
- **Error Handling:** No specific patterns established

## Architecture
- Single-page application with vanilla JavaScript
- Canvas-based rendering with Chart.js for population graphs
- Simulation loop driven by requestAnimationFrame