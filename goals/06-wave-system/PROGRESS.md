# PROGRESS.md - Wave System

## Current Status

Status: Complete - audit passed

## Summary

Implemented a typed, data-driven wave system that spawns configured enemy waves, advances after all wave enemies are cleared, escalates difficulty across three waves, and sets `gameWon` after the final wave. HUD and state bridge now report current wave, total waves, and victory state.

## Completed Work

- [x] Acceptance criteria implemented
- [x] State bridge fields updated
- [x] Playwright tests written and passing
- [x] Previous goals' tests still pass (regression)
- [x] Screenshots captured for SHOULD-tier checks
- [x] Final evidence recorded

## Remaining Work

- [x] AC-06.1 - Waves spawn from config
- [x] AC-06.2 - Waves advance after clear
- [x] AC-06.3 - Later waves are harder
- [x] AC-06.4 - Final wave sets gameWon
- [x] AC-06.5 - Wave state bridge reports

## Commands Run

| Command | Result | Notes |
| ------- | ------ | ----- |
| `sed -n '1,240p' goals/06-wave-system/GOAL.md` | Pass | Read goal requirements. |
| `sed -n '1,260p' goals/06-wave-system/VERIFY.md` | Pass | Read verification contract. |
| `sed -n '1,260p' src/game/scenes/GameScene.ts` and related source files | Pass | Confirmed current implementation has endless spawning and placeholder wave HUD. |
| `npx tsc --noEmit` | Pass | TypeScript completed with exit code 0. |
| `npx playwright test tests/game/wave-system.spec.ts --config tests/playwright.config.ts --reporter=line > goals/06-wave-system/test-artifacts/test-output.txt 2>&1` | Pass | Initial sandbox attempt failed because Vite could not bind `127.0.0.1:8080` (`EPERM`); reran outside sandbox and 5/5 wave tests passed. |
| `npm test -- --reporter=line > goals/06-wave-system/test-artifacts/regression-output.txt 2>&1` | Pass | Ran outside sandbox for localhost binding; 34/34 tests passed. |

## Files Changed

- `src/game/scenes/GameScene.ts`
- `src/game/scenes/HUDScene.ts`
- `src/game/systems/EnemySpawner.ts`
- `src/game/systems/WaveSystem.ts`
- `src/game/data/waves.ts`
- `src/state-bridge.ts`
- `tests/game/wave-system.spec.ts`
- `goals/06-wave-system/PROGRESS.md`

## Decisions Made

| Decision | Reason |
| -------- | ------ |
| Keep `EnemySpawner.spawnEnemy()` backwards-compatible with default arguments. | Prior goal tests call it directly through the Phaser scene for deterministic collision setup. |
| Count both destroyed and offscreen recycled wave enemies as cleared. | AC-06.2 requires wave advancement after enemies are destroyed or cleared. |

## Blockers

| Blocker | Impact | Needed From Human |
| ------- | ------ | ----------------- |
| Sandbox cannot bind `127.0.0.1:8080` for Vite (`listen EPERM`). | Browser tests cannot start the dev server inside the sandbox. | None; tests were rerun successfully outside the sandbox with approval. |

## Acceptance Criteria Evidence

| Requirement | Evidence | Status |
| ----------- | -------- | ------ |
| AC-06.1 | `src/game/data/waves.ts` defines typed `WAVE_CONFIGS` with type, count, delay, speed, and score values; `WaveSystem.update()` passes config into `EnemySpawner.spawnEnemy()`; `wave-system.spec.ts` M-001 verified configured spawning. | Pass |
| AC-06.2 | `WaveSystem` tracks spawned and cleared counts; `EnemySpawner` calls clear callbacks on destruction and offscreen recycle; `wave-system.spec.ts` M-002 cleared wave 1 and observed `currentWave === 2`. | Pass |
| AC-06.3 | Wave config escalates from 4/500ms/120px/100 score to 6/300ms/180px/200 score; `wave-system.spec.ts` M-003 verified later wave difficulty. | Pass |
| AC-06.4 | `WaveSystem.advanceIfWaveClear()` sets `gameWon` after final wave; GameScene stops calling spawner directly and `WaveSystem.update()` returns when won; `wave-system.spec.ts` M-004 verified `gameWon`, `gameOver === false`, no active enemies, and no extra spawns. | Pass |
| AC-06.5 | `src/state-bridge.ts` adds `currentWave`, `waveCount`, and `gameWon`; `GameScene.publishWaveState()` updates registry; `wave-system.spec.ts` M-005 verified field types and initial values. | Pass |

## Final Verification Evidence

### Automated Check Evidence (MUST tier)

| Check ID | AC ID | Expected | Actual | Status |
| -------- | ----- | -------- | ------ | ------ |
| M-001 | AC-06.1, AC-06.5 | `currentWave` starts at 1, `waveCount` matches config, and enemies spawn. | Focused spec passed; `currentWave === 1`, `waveCount === WAVE_CONFIGS.length`, spawned/active enemies observed. | Pass |
| M-002 | AC-06.2 | Clearing first wave advances to wave 2. | Focused spec passed; after deterministic clear, `currentWave === 2`. | Pass |
| M-003 | AC-06.3 | Later wave has higher count, faster speed, or tighter delay. | Focused spec passed; final wave has higher count, faster speed, and shorter delay than first wave. | Pass |
| M-004 | AC-06.4 | Clearing final wave sets `gameWon`, stops spawning, leaves `gameOver` false. | Focused spec passed; `gameWon === true`, `gameOver === false`, active enemies `0`, total spawns unchanged after wait. | Pass |
| M-005 | AC-06.5 | Wave bridge fields are typed and correct. | Focused spec passed; `currentWave`/`waveCount` numbers and `gameWon` boolean. | Pass |

### Screenshot Evidence (SHOULD tier)

| Check ID | Screenshot Path | Human Verdict | Notes |
| -------- | --------------- | ------------- | ----- |
| S-001 | `goals/06-wave-system/test-artifacts/wave-hud.png` | Pass | Reviewed screenshot; HUD visibly shows `Wave: 2/3`. |
| S-002 | `goals/06-wave-system/test-artifacts/win-state.png` | Pass | Reviewed screenshot; HUD visibly shows `Victory!`. |

### Edge Case Evidence (NICE tier)

| Check ID | Expected | Actual | Status |
| -------- | -------- | ------ | ------ |
| E-001 | Enemy spawning remains stopped after win. | M-004 waited past the final wave spawn delay and verified `totalSpawned` did not increase. | Pass |

### Regression

| Test Suite | Result | Notes |
| ---------- | ------ | ----- |
| `npx tsc --noEmit` | Pass | Exit code 0. |
| `npx playwright test tests/game/wave-system.spec.ts --config tests/playwright.config.ts --reporter=line` | Pass | 5/5 tests passed; output saved to `goals/06-wave-system/test-artifacts/test-output.txt`. |
| `npm test -- --reporter=line` | Pass | 34/34 tests passed; output saved to `goals/06-wave-system/test-artifacts/regression-output.txt`. |

### Acceptance Criteria Summary

| AC ID | Check IDs | Status |
| ----- | --------- | ------ |
| AC-06.1 | M-001 | Pass |
| AC-06.2 | M-002, S-001 | Pass |
| AC-06.3 | M-003 | Pass |
| AC-06.4 | M-004, S-002, E-001 | Pass |
| AC-06.5 | M-001, M-005, S-001 | Pass |

### Files Changed

- `src/game/scenes/GameScene.ts`
- `src/game/scenes/HUDScene.ts`
- `src/game/systems/EnemySpawner.ts`
- `src/game/systems/WaveSystem.ts`
- `src/game/data/waves.ts`
- `src/state-bridge.ts`
- `tests/game/wave-system.spec.ts`
- `goals/06-wave-system/PROGRESS.md`

### Remaining Risks

None known.
