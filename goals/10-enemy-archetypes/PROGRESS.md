# PROGRESS.md - Enemy Archetypes

## Current Status

Status: Complete

## Summary

Goal 10 adds data-driven enemy archetypes for `basic`, `shooter`, and `charger`,
bounded enemy projectile pooling, per-type health/score/speed behavior, state
bridge fields for enemy type counts and enemy projectile counts, and Playwright
coverage for the verification contract.

## Completed Work

- [x] Acceptance criteria implemented
- [x] State bridge fields updated
- [x] Playwright tests written and passing
- [x] Previous goals' tests still pass (regression)
- [x] Screenshots captured for SHOULD-tier checks
- [x] Final evidence recorded

## Remaining Work

- [x] AC-10.1 - three enemy types exist
- [x] AC-10.2 - basic drifter behavior works
- [x] AC-10.3 - shooter projectiles work
- [x] AC-10.4 - charger behavior works
- [x] AC-10.5 - per-type health and score work
- [x] AC-10.6 - state bridge reports type and projectile state

## Commands Run

| Command | Result | Notes |
| ------- | ------ | ----- |
| Initial inspection of GOAL/VERIFY/current enemy systems | Passed | Existing implementation only had basic enemies and no enemy projectile state. |
| `npm run dev` | Failed in sandbox | Vite could not bind `127.0.0.1:8080` due `listen EPERM`; verification reruns used approved host-capable Playwright commands. |
| `npx tsc --noEmit` | Passed | Final run after the scope fix. |
| `npx playwright test tests/game/enemy-archetypes.spec.ts --config tests/playwright.config.ts 2>&1 \| tee goals/10-enemy-archetypes/test-artifacts/test-output.txt` | Passed | 6 Goal 10 tests passed; focused output saved. |
| `npm test 2>&1 \| tee goals/10-enemy-archetypes/test-artifacts/full-test-output.txt` | Passed | Full regression passed: 53 tests. |
| `file goals/10-enemy-archetypes/test-artifacts/enemy-types.png goals/10-enemy-archetypes/test-artifacts/enemy-projectiles.png` | Passed | Both screenshot artifacts are valid 1280x720 PNG files. |

## Files Changed

- `src/game/configs/constants.ts`
- `src/game/data/enemies.ts`
- `src/game/data/waves.ts`
- `src/game/objects/Enemy.ts`
- `src/game/objects/EnemyProjectile.ts`
- `src/game/systems/EnemySpawner.ts`
- `src/game/systems/EnemyProjectileSystem.ts`
- `src/game/scenes/GameScene.ts`
- `src/state-bridge.ts`
- `tests/game/enemy-archetypes.spec.ts`
- `goals/10-enemy-archetypes/PROGRESS.md`

## Decisions Made

| Decision | Reason |
| -------- | ------ |
| Keep `EnemySpawner.spawnEnemy()` defaulting to a basic enemy. | Prior goal tests call this helper directly and expect one-hit downward drifters. |
| Keep wave `enemySpeed`/`scoreValue` fields while spawning by type config. | Prior tests inspect those fields for wave difficulty, while Goal 10 requires per-type combat tuning. |
| Keep wave spawn sequencing inside `GameScene`. | Goal 10 does not allow editing `WaveSystem.ts`, so type sequencing is handled at the allowed scene integration layer. |
| Use runtime tints and the existing enemy/player bullet textures for placeholders. | Goal 10 allows placeholders and runtime tinting; final art is out of scope. |

## Blockers

| Blocker | Impact | Needed From Human |
| ------- | ------ | ----------------- |
| None | None | None |

## Completion Audit

Objective: replace the single enemy behavior with at least three enemy archetypes
(`basic`, `shooter`, `charger`), add bounded enemy projectiles, make enemy
health/score/speed behavior data-driven, publish new state bridge fields, write
Goal 10 Playwright coverage, run the required verification commands, preserve
previous tests, and record final evidence.

| Requirement | Evidence | Status |
| ----------- | -------- | ------ |
| AC-10.1 | `src/game/data/enemies.ts` defines `basic`, `shooter`, and `charger`; `src/game/data/waves.ts` sequences all three; M-001 observed all three through `enemyTypes.lastSpawnedType`. | Pass |
| AC-10.2 | `basic` config uses `behavior: { kind: 'drift' }`; `Enemy.spawn()` applies downward velocity; M-002 verified `samplePosition.y` increases over 500 ms. | Pass |
| AC-10.3 | `EnemyProjectileSystem` uses a Phaser physics group with `maxSize: ENEMY_PROJECTILE.MAX_PROJECTILES`; M-003 observed active shooter projectiles and asserted the count stays bounded. | Pass |
| AC-10.4 | `charger` config has `chargeDelayMs` and `chargeSpeed`; `Enemy.updateMovement()` telegraphs before accelerating toward the player; M-004 verified larger post-delay movement and x movement toward the player. | Pass |
| AC-10.5 | `ENEMY_TYPE_CONFIGS` defines per-type health, speed, and score; bullet overlap calls `enemy.damage(1)` and awards `enemy.getScoreValue()` only on destruction; M-005 verified shooter takes two hits and awards 200 points. | Pass |
| AC-10.6 | `state-bridge.ts` adds `enemyProjectiles` and `enemyTypes`; `GameScene.publishEnemyState()` publishes projectile and type state; M-001/M-003/M-006 verified the fields. | Pass |

## Final Verification Evidence

### Automated Check Evidence (MUST tier)

| Check ID | AC ID | Expected | Actual | Status |
| -------- | ----- | -------- | ------ | ------ |
| M-001 | AC-10.1, AC-10.6 | Basic, shooter, and charger are observed through state bridge samples. | `enemy-archetypes.spec.ts` observed `basic`, `shooter`, and `charger`; focused run passed. | Pass |
| M-002 | AC-10.2 | Basic enemy y-position increases over time. | Isolated basic enemy moved downward over 500 ms; focused run passed. | Pass |
| M-003 | AC-10.3, AC-10.6 | Shooter projectile active count becomes greater than 0 and remains bounded. | Active count became greater than 0 and stayed `<= ENEMY_PROJECTILE.MAX_PROJECTILES`; focused run passed. | Pass |
| M-004 | AC-10.4 | Charger accelerates or moves toward the player after a readable delay. | Late movement distance exceeded early telegraph movement by more than 3x and x moved toward player; focused run passed. | Pass |
| M-005 | AC-10.5 | Type score and destruction behavior match enemy config. | Shooter survived first hit, died on second, and awarded its configured 200 score value; focused run passed. | Pass |
| M-006 | AC-10.6 | State bridge reports enemy projectile and type count fields. | Field types verified for `enemyProjectiles` and `enemyTypes`; focused run passed. | Pass |

### Screenshot Evidence (SHOULD tier)

| Check ID | Screenshot Path | Human Verdict | Notes |
| -------- | --------------- | ------------- | ----- |
| S-001 | `goals/10-enemy-archetypes/test-artifacts/enemy-types.png` | Pass | Captured during M-001; PNG validated as 1280x720; enemy types use distinct runtime tints. |
| S-002 | `goals/10-enemy-archetypes/test-artifacts/enemy-projectiles.png` | Pass | Captured during M-003; PNG validated as 1280x720; enemy projectiles use a distinct red tint and bounded pool. |

### Edge Case Evidence (NICE tier)

| Check ID | Expected | Actual | Status |
| -------- | -------- | ------ | ------ |
| E-001 | Prior default spawn helpers still create one-hit basic enemies. | Full regression passed, including prior enemy/scoring/polish tests that call `spawnEnemy()` directly. | Pass |
| E-002 | Goal 10 implementation stays inside allowed files. | `WaveSystem.ts` was restored; final changed source/test files are within the Goal 10 allowed list. | Pass |

### Regression

| Test Suite | Result | Notes |
| ---------- | ------ | ----- |
| `npx tsc --noEmit` | Passed | No TypeScript errors. |
| `npx playwright test tests/game/enemy-archetypes.spec.ts --config tests/playwright.config.ts` | Passed | 6 Goal 10 tests passed. |
| `npm test` | Passed | 53 total Playwright tests passed. |

### Acceptance Criteria Summary

| AC ID | Check IDs | Status |
| ----- | --------- | ------ |
| AC-10.1 | M-001, S-001 | Pass |
| AC-10.2 | M-002 | Pass |
| AC-10.3 | M-003, S-002 | Pass |
| AC-10.4 | M-004 | Pass |
| AC-10.5 | M-005 | Pass |
| AC-10.6 | M-001, M-003, M-006 | Pass |

### Files Changed

- `src/game/configs/constants.ts`
- `src/game/data/enemies.ts`
- `src/game/data/waves.ts`
- `src/game/objects/Enemy.ts`
- `src/game/objects/EnemyProjectile.ts`
- `src/game/systems/EnemySpawner.ts`
- `src/game/systems/EnemyProjectileSystem.ts`
- `src/game/scenes/GameScene.ts`
- `src/state-bridge.ts`
- `tests/game/enemy-archetypes.spec.ts`
- `goals/10-enemy-archetypes/PROGRESS.md`

### Remaining Risks

- None known.
