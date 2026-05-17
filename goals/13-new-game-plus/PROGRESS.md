# PROGRESS.md - New Game Plus

## Current Status

Status: Complete

## Summary

Implemented New Game Plus loop state, deterministic difficulty multipliers, loop-aware restart behavior, state bridge reporting, HUD loop display, and Playwright verification.

## Completed Work

- [x] Acceptance criteria implemented
- [x] State bridge fields updated
- [x] Playwright tests written and passing
- [x] Previous goals' tests still pass (regression)
- [x] Screenshots captured for SHOULD-tier checks
- [x] Final evidence recorded

## Remaining Work

- [x] AC-13.1 - fresh game starts at loop 1
- [x] AC-13.2 - victory restart offered
- [x] AC-13.3 - loop increments by 1
- [x] AC-13.4 - enemies scale up
- [x] AC-13.5 - boss scales up
- [x] AC-13.6 - transient state resets
- [x] AC-13.7 - state bridge reports difficulty

## Commands Run

| Command | Result | Notes |
| ------- | ------ | ----- |
| `date '+%Y-%m-%d %H:%M:%S %Z'` | Pass | Work started at 2026-05-17 18:53:22 +08. |
| `npx tsc --noEmit` | Pass | Type check passed after implementation. |
| `npx playwright test --config tests/playwright.config.ts new-game-plus.spec.ts` | Pass | 3 tests passed after final cleanup; screenshots saved under goal artifacts. |
| `npm test` | Pass | 65 tests passed in 2.4m; output saved to `goals/13-new-game-plus/test-artifacts/test-output.txt`. |

## Files Changed

- `src/game/configs/constants.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/scenes/VictoryScene.ts`
- `src/game/scenes/GameOverScene.ts`
- `src/game/scenes/HUDScene.ts`
- `src/game/systems/DifficultySystem.ts`
- `src/game/systems/EnemySpawner.ts`
- `src/game/systems/BossSystem.ts`
- `src/state-bridge.ts`
- `tests/game/new-game-plus.spec.ts`
- `goals/13-new-game-plus/PROGRESS.md`

## Decisions Made

| Decision | Reason |
| -------- | ------ |
| Scale enemy speed, enemy health, and boss max health from a pure `DifficultySystem`. | Keeps loop tuning deterministic and testable without changing wave fairness or adding new content. |
| Restarting from GameOverScene preserves the same difficulty loop. | GOAL.md specifies game over should restart the current loop instead of resetting or incrementing. |

## Blockers

| Blocker | Impact | Needed From Human |
| ------- | ------ | ----------------- |
| None | None | None |

## Acceptance Criteria Evidence

| Requirement | Evidence | Status |
| ----------- | -------- | ------ |
| AC-13.1 | `new-game-plus.spec.ts` M-001 starts from menu and asserts loop 1 with all multipliers at 1. | Pass |
| AC-13.2 | VictoryScene displays loop-cleared text and `Press SPACE for loop 2`; S-001 screenshot saved at `goals/13-new-game-plus/test-artifacts/victory-next-loop.png`. | Pass |
| AC-13.3 | `new-game-plus.spec.ts` M-002 asserts loop 2 equals previous loop + 1 after SPACE on VictoryScene. | Pass |
| AC-13.4 | `new-game-plus.spec.ts` M-003 asserts loop 2 enemy speed/health multipliers and sampled spawned enemy speed/health are greater than loop 1. | Pass |
| AC-13.5 | `new-game-plus.spec.ts` M-004 asserts loop 2 boss max health is greater than loop 1. | Pass |
| AC-13.6 | `new-game-plus.spec.ts` M-005 asserts loop 2 restart resets score, player health, flags, boss, enemies, projectiles, and Ion Blast state; S-002 screenshot saved at `goals/13-new-game-plus/test-artifacts/loop-2-gameplay.png`. | Pass |
| AC-13.7 | `src/state-bridge.ts` includes `difficulty`; `new-game-plus.spec.ts` M-001/M-002/M-003 assert loop and multiplier values. | Pass |

## Final Verification Evidence

### Automated Check Evidence (MUST tier)

| Check ID | AC ID | Expected | Actual | Status |
| -------- | ----- | -------- | ------ | ------ |
| M-001 | AC-13.1, AC-13.7 | Fresh game from menu starts at loop 1 with base multipliers. | `new-game-plus.spec.ts` M-001 passed; asserted loop 1 and all multipliers equal 1. | Pass |
| M-002 | AC-13.2, AC-13.3, AC-13.7 | Victory restart starts previous loop + 1. | `new-game-plus.spec.ts` M-002 passed; loop 2 equaled loop 1 + 1 after SPACE on VictoryScene. | Pass |
| M-003 | AC-13.4, AC-13.7 | Loop 2 enemy speed and health multipliers are greater than loop 1. | `new-game-plus.spec.ts` M-003 passed; state multipliers and sampled basic enemy speed/health increased. | Pass |
| M-004 | AC-13.5, AC-13.7 | Loop 2 boss max health is greater than loop 1. | `new-game-plus.spec.ts` M-004 passed; sampled loop 2 boss max health exceeded loop 1. | Pass |
| M-005 | AC-13.6, AC-13.7 | Restart into loop 2 preserves loop and resets transient state. | `new-game-plus.spec.ts` M-005 passed; score, health, flags, boss, enemies, projectiles, and Ion Blast reset. | Pass |

### Screenshot Evidence (SHOULD tier)

| Check ID | Screenshot Path | Human Verdict | Notes |
| -------- | --------------- | ------------- | ----- |
| S-001 | `goals/13-new-game-plus/test-artifacts/victory-next-loop.png` | Pass | Victory screen communicates loop clear and next-loop restart prompt. |
| S-002 | `goals/13-new-game-plus/test-artifacts/loop-2-gameplay.png` | Pass | Loop 2 gameplay shows the HUD loop indicator without clutter. |

### Edge Case Evidence (NICE tier)

| Check ID | Expected | Actual | Status |
| -------- | -------- | ------ | ------ |
| E-001 | GameOverScene retry preserves current loop without incrementing. | `new-game-plus.spec.ts` edge test passed; loop 2 game over restarted loop 2. | Pass |

### Regression

| Test Suite | Result | Notes |
| ---------- | ------ | ----- |
| `npx tsc --noEmit` | Pass | Final type check passed. |
| `npx playwright test --config tests/playwright.config.ts new-game-plus.spec.ts` | Pass | 3 passed. |
| `npm test` | Pass | 65 passed in 2.4m; includes all prior goal tests and new NG+ tests. |

### Acceptance Criteria Summary

| AC ID | Check IDs | Status |
| ----- | --------- | ------ |
| AC-13.1 | M-001 | Pass |
| AC-13.2 | M-002, S-001 | Pass |
| AC-13.3 | M-002 | Pass |
| AC-13.4 | M-003 | Pass |
| AC-13.5 | M-004 | Pass |
| AC-13.6 | M-005, S-002 | Pass |
| AC-13.7 | M-001, M-002, M-003, M-004, M-005 | Pass |

### Completion Audit

| Requirement | Evidence | Status |
| ----------- | -------- | ------ |
| Victory restart into next difficulty loop | `VictoryScene` receives `difficultyLoop`, prompts for next loop, and starts `GameScene` with `difficultyLoop + 1`; M-002 passed. | Pass |
| Difficulty loop starts at 1 | `GameScene.init()` defaults through `DifficultySystem.fromLoop`; M-001 passed. | Pass |
| Enemy speed and health scale by loop | `EnemySpawner` applies `DifficultySystem` speed and health multipliers to spawned configs; M-003 sampled actual spawned enemy tuning. | Pass |
| Boss toughness scales by loop | `BossSystem.startBoss()` applies scaled boss max health; M-004 sampled actual boss max health. | Pass |
| Transient combat/wave/boss/projectile/power-up state resets | `GameScene.init()` resets registry state, systems are reconstructed, and M-005 asserts reset bridge values after loop restart. | Pass |
| State bridge reports current loop and multipliers | `src/state-bridge.ts` includes `difficulty` and tests assert it through `window.__GAME_STATE__`. | Pass |
| GameOverScene restarts same loop | `GameOverScene` preserves `difficultyLoop`; E-001 passed. | Pass |
| HUD or visible state communicates loop 2 | `HUDScene` displays `Loop N  Wave`; S-002 screenshot captured. | Pass |
| Required screenshots saved | `victory-next-loop.png` and `loop-2-gameplay.png` exist in goal test artifacts. | Pass |
| Required commands pass | `npx tsc --noEmit`, focused Playwright spec, and `npm test` all pass. | Pass |
| Allowed file boundary respected | Changed files are within GOAL.md allowed list. No disallowed project files were edited. | Pass |
| Progress contains final evidence | This file contains command results, AC evidence, screenshot evidence, regression evidence, changed files, and remaining risks. | Pass |

### Files Changed

- `src/game/configs/constants.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/scenes/VictoryScene.ts`
- `src/game/scenes/GameOverScene.ts`
- `src/game/scenes/HUDScene.ts`
- `src/game/systems/DifficultySystem.ts`
- `src/game/systems/EnemySpawner.ts`
- `src/game/systems/BossSystem.ts`
- `src/state-bridge.ts`
- `tests/game/new-game-plus.spec.ts`
- `goals/13-new-game-plus/PROGRESS.md`

### Remaining Risks

- None known.
