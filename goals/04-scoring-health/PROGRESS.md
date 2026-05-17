# PROGRESS.md - Scoring and Health

## Current Status

Status: Complete

## Summary

Goal 04 adds score rewards for enemy kills, player health, player-enemy contact damage, invulnerability flashing, and GameOverScene transition when health reaches zero.

## Completed Work

- [x] Acceptance criteria implemented
- [x] State bridge fields updated
- [x] Playwright tests written and passing
- [x] Previous goals' tests still pass (regression)
- [x] Screenshots captured for SHOULD-tier checks
- [x] Final evidence recorded

## Remaining Work

- [x] AC-04.1 - Enemy kills increase score
- [x] AC-04.2 - Enemy contact damages player
- [x] AC-04.3 - Invulnerability works and flashes player
- [x] AC-04.4 - Zero health reaches GameOverScene
- [x] AC-04.5 - Score and health state bridge reports

## Commands Run

| Command | Result | Notes |
| ------- | ------ | ----- |
| Initial inspection of Goal 04 docs and current source | Passed | Existing game had Goal 03 enemy/bullet behavior but no CombatSystem, playerHealth, or scoring on kills yet. |
| `npx tsc --noEmit` | Failed | `CombatSystem.health` inferred as literal `3`; widened it to `number`. |
| `npx tsc --noEmit` | Passed | TypeScript strict check is clean after widening `CombatSystem.health`. |
| `npx playwright test tests/game/scoring-health.spec.ts --config tests/playwright.config.ts 2>&1 \| tee goals/04-scoring-health/test-artifacts/test-output.txt` | Failed | Artifact directory did not exist before `tee`; created `goals/04-scoring-health/test-artifacts/` and reran. |
| `npm run dev` | Failed in sandbox | Vite could not bind `127.0.0.1:8080` with `listen EPERM`; browser tests were rerun outside sandbox with approval. |
| `npx playwright test tests/game/scoring-health.spec.ts --config tests/playwright.config.ts 2>&1 \| tee goals/04-scoring-health/test-artifacts/test-output.txt` | Passed | 5 Goal 04 tests passed; screenshots written for damage flash and game over. |
| `npm test 2>&1 \| tee -a goals/04-scoring-health/test-artifacts/test-output.txt` | Passed | Full regression passed: 24 tests passed. |

## Files Changed

- `src/game/configs/constants.ts`
- `src/game/objects/Enemy.ts`
- `src/game/objects/PlayerShip.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/systems/CombatSystem.ts`
- `src/state-bridge.ts`
- `tests/game/scoring-health.spec.ts`
- `goals/04-scoring-health/PROGRESS.md`
- `goals/04-scoring-health/test-artifacts/damage-flash.png`
- `goals/04-scoring-health/test-artifacts/game-over.png`
- `goals/04-scoring-health/test-artifacts/test-output.txt`

## Decisions Made

| Decision | Reason |
| -------- | ------ |
| Use constants for enemy score, starting health, and invulnerability duration | Keeps damage tuning explicit and avoids ambiguous hard-coded values. |
| Keep player-enemy contact enemy active during tests | Allows the invulnerability window and later death transition to be verified without adding test-only state bridge fields. |

## Blockers

| Blocker | Impact | Needed From Human |
| ------- | ------ | ----------------- |
| None | None | None |

## Acceptance Criteria Evidence

| Requirement | Evidence | Status |
| ----------- | -------- | ------ |
| AC-04.1 | `CombatSystem.awardEnemyKill()` adds `enemy.getScoreValue()`; `tests/game/scoring-health.spec.ts` M-001 passed and verifies `score === before.score + scoreValue`. | Passed |
| AC-04.2 | `GameScene` registers player-enemy overlap and `CombatSystem.damagePlayer()` subtracts 1; M-002 passed. | Passed |
| AC-04.3 | `CombatSystem` ignores damage during `PLAYER_COMBAT.INVULNERABILITY_MS` and toggles `PlayerShip.setDamageFlash()` alpha; M-003 passed and `damage-flash.png` reviewed. | Passed |
| AC-04.4 | `CombatSystem` sets health to 0, sets `gameOver`, marks player not alive, and starts `GameOverScene`; M-004 passed. | Passed |
| AC-04.5 | `state-bridge.ts` now reports `playerHealth` while preserving `score` and `gameOver`; M-005 passed. | Passed |

## Completion Audit

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-04.1 | Score reward is implemented in `src/game/systems/CombatSystem.ts`; enemy score value is defined in `src/game/configs/constants.ts`; M-001 passed. | Passed |
| AC-04.2 | Player-enemy overlap is registered in `src/game/scenes/GameScene.ts`; health decrement is implemented in `CombatSystem.damagePlayer()`; M-002 passed. | Passed |
| AC-04.3 | Invulnerability timer and repeated-damage guard are implemented in `CombatSystem`; alpha flash is implemented in `PlayerShip`; M-003 and S-001 passed. | Passed |
| AC-04.4 | Death flow is implemented in `CombatSystem` and starts `GameOverScene`; M-004 and S-002 passed. | Passed |
| AC-04.5 | `playerHealth` was added to the cumulative `GameState`; M-005 passed. | Passed |

## Final Verification Evidence

### Automated Check Evidence (MUST tier)

| Check ID | AC ID | Expected | Actual | Status |
| -------- | ----- | -------- | ------ | ------ |
| M-001 | AC-04.1 | Destroying one enemy increases score by configured enemy score value. | Passed: score equals previous score plus `enemy.getScoreValue()` and destroyed count increases. | Passed |
| M-002 | AC-04.2 | Enemy contact decreases `playerHealth` by 1. | Passed: contact changes health from starting value to starting value minus 1. | Passed |
| M-003 | AC-04.3 | Repeated overlap during invulnerability does not apply another damage tick. | Passed: health remained unchanged after 400 ms within the 1000 ms invulnerability window. | Passed |
| M-004 | AC-04.4 | Health reaches 0, `gameOver` is true, and active scene is `GameOverScene`. | Passed: final state has `playerHealth: 0`, `gameOver: true`, `scene: GameOverScene`. | Passed |
| M-005 | AC-04.5 | `score` and `playerHealth` are numbers and `gameOver` is boolean. | Passed: state bridge reports all three fields with expected types. | Passed |

### Screenshot Evidence (SHOULD tier)

| Check ID | Screenshot Path | Human Verdict | Notes |
| -------- | --------------- | ------------- | ----- |
| S-001 | `goals/04-scoring-health/test-artifacts/damage-flash.png` | Passed | Player is visibly dimmed during invulnerability and remains readable. |
| S-002 | `goals/04-scoring-health/test-artifacts/game-over.png` | Passed | Game over text, final score, and restart prompt are readable. |

### Edge Case Evidence (NICE tier)

| Check ID | Expected | Actual | Status |
| -------- | -------- | ------ | ------ |
| Invulnerability timing | Damage should not repeat inside the configured invulnerability window. | M-003 kept an overlap active for 400 ms and health stayed unchanged. | Passed |

### Regression

| Test Suite | Result | Notes |
| ---------- | ------ | ----- |
| `npx tsc --noEmit` | Passed | Strict TypeScript check is clean. |
| `npx playwright test tests/game/scoring-health.spec.ts --config tests/playwright.config.ts` | Passed | 5 tests passed. |
| `npm test` | Passed | 24 tests passed, covering Goals 00 through 04. |

### Acceptance Criteria Summary

| AC ID | Check IDs | Status |
| ----- | --------- | ------ |
| AC-04.1 | M-001 | Passed |
| AC-04.2 | M-002 | Passed |
| AC-04.3 | M-003, S-001 | Passed |
| AC-04.4 | M-004, S-002 | Passed |
| AC-04.5 | M-005 | Passed |

### Files Changed

- `src/game/configs/constants.ts`
- `src/game/objects/Enemy.ts`
- `src/game/objects/PlayerShip.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/systems/CombatSystem.ts`
- `src/state-bridge.ts`
- `tests/game/scoring-health.spec.ts`
- `goals/04-scoring-health/PROGRESS.md`

### Remaining Risks

None known.
