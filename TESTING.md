# Testing Guide

This project includes unit, component, and End-to-End (E2E) tests. We use `vitest` for fast unit/component testing and `playwright` for comprehensive E2E testing.

## Prerequisites

- Node.js environment
- Firebase local emulators (if needed for local development testing)

## Unit and Component Tests

We use Vitest and React Testing Library for testing custom hooks, utility functions, and UI components.

### Commands

- **Run Tests**:
  ```bash
  npm run test
  ```
- **Run Tests with Watch Mode**:
  ```bash
  npm run test:watch
  ```
- **Run Tests with Coverage**:
  ```bash
  npm run test:coverage
  ```
  Our coverage thresholds are currently configured at 80% for functions and 70% for lines.

## E2E Tests

Playwright is used for End-to-End tests to cover critical user and admin flows, like searching properties and admin authentication.

### Commands

- **Run E2E Tests**:
  ```bash
  npm run test:e2e
  ```
  This command will start the dev server automatically if it isn't already running.

## Adding Tests

- Name your unit or component test files `*.test.ts` or `*.test.tsx` and place them alongside the source file.
- Add your E2E test files with `.spec.ts` inside the `e2e/` folder.
