# GOAL.md - QC Checkpoint (Final Validation)

## 1. Objective

Validate Ion Viper as a cohesive, playable vertical shooter after the extension goals. This checkpoint should verify the complete loop, find integration issues, fix regressions, and ensure the state bridge remains reliable across rebrand, Ion Blast, enemy archetypes, randomized waves, boss victory, New Game Plus, loss, and restart paths.

By the end of this goal:

- The full win path works: boot -> menu -> play -> waves -> boss -> victory -> New Game Plus restart.
- The full loss path works: boot -> menu -> play -> lose -> game over -> restart.
- All state bridge fields report correct values through transitions and restarts.
- Difficulty and randomized waves are challenging but fair.
- No console errors, dead-end scenes, stale registry fields, or broken references remain.

## 2. Genre & Physics Config

- **Genre**: shoot-em-up (Raiden-style vertical shooter)
- **Physics system**: Arcade
- **Gravity**: `{ x: 0, y: 0 }`
- **World bounds**: 800x600, player clamped to bounds

No changes to physics config in this goal. This goal validates existing configuration.

## 3. Scope

### In scope

- Validate full win and loss gameplay loops.
- Validate scene transitions across BootScene, MenuScene, GameScene, HUDScene, GameOverScene, and VictoryScene.
- Validate state bridge regression for all fields from Goals 00 through 13.
- Tune balance only when needed to fix clear integration problems.
- Fix scene restart, object pool, registry, or state bridge leaks found during validation.
- Add an end-to-end integration Playwright test.

### Out of scope

- New features or mechanics.
- New enemy types, bosses, power-ups, or art passes.
- Persistent save/load, online leaderboards, deployment, or mobile controls.
- Package dependency changes.

### Do not touch

- Goal folders for completed goals other than `goals/14-qc-checkpoint/PROGRESS.md`.
- `package.json` unless a severe test script bug blocks all verification and no safer fix exists.
- `index.html`, `vite.config.ts`, and `AGENTS.md` unless a confirmed integration bug directly requires it.

## 4. Depends On

All previous goals must be complete:

- `goals/00-foundation/` - baseline boot and state bridge.
- `goals/01-player-ship/` - player movement.
- `goals/02-player-weapons/` - player bullet pool.
- `goals/03-enemies/` - enemy spawning and destruction.
- `goals/04-scoring-health/` - score, health, and game over.
- `goals/05-hud/` - parallel HUD scene.
- `goals/06-wave-system/` - configured waves.
- `goals/07-polish/` - art, audio, feedback.
- `goals/08-rebrand-ion-viper/` - Ion Viper identity.
- `goals/09-ion-blast-power-up/` - Ion Blast timed power-up.
- `goals/10-enemy-archetypes/` - enemy variety and enemy projectiles.
- `goals/11-randomized-wave-system/` - balanced randomized wave spawning.
- `goals/12-boss-fight/` - boss and victory screen.
- `goals/13-new-game-plus/` - difficulty loop restart.

## 5. Allowed Files

/goal may create or modify:

- `src/game/scenes/*.ts` (fix integration issues only)
- `src/game/systems/*.ts` (fix integration issues only)
- `src/game/objects/*.ts` (fix integration issues only)
- `src/game/configs/constants.ts` (balance tuning only)
- `src/game/data/*.ts` (balance and wave tuning only)
- `src/state-bridge.ts` (fix reporting bugs only - do not remove fields)
- `tests/game/integration.spec.ts` (new or update)
- `goals/14-qc-checkpoint/PROGRESS.md`

/goal must not edit:

- Goal folders belonging to other goals.
- `package.json`
- `index.html`
- `vite.config.ts`
- `tsconfig.json`
- `AGENTS.md`

## 6. Scene Architecture

This goal does not create new scenes. It validates and fixes transitions between all existing scenes:

### Transition checklist

- **BootScene -> MenuScene**: Assets load, registry initializes, and identity state is available.
- **MenuScene -> GameScene**: SPACE starts a fresh loop 1 game.
- **GameScene + HUDScene**: HUD runs in parallel without blocking input.
- **GameScene -> GameOverScene**: Loss path stops gameplay, stops HUD, preserves score, and offers restart.
- **GameScene -> VictoryScene**: Boss defeat sets victory state and stops active gameplay cleanly.
- **VictoryScene -> GameScene**: Restart enters the next difficulty loop and resets transient state.
- **GameOverScene -> GameScene**: Restart returns to a valid gameplay state without stale boss, projectile, wave, or power-up data.

### Key validation: restart state leaks

Check that:

- `init()` resets mutable scene state.
- Registry values are reset or preserved intentionally.
- Object pools recycle correctly.
- State bridge fields do not report stale values after scene transitions.
- Audio, HUD, and input handlers do not duplicate across restarts.

## 7. Game Systems

Not applicable. This goal validates existing systems and fixes integration issues found during validation.

### Validation targets

- **PlayerWeapon**: Normal and Ion Blast firing stay bounded and responsive.
- **PowerUpSystem**: Ion Blast pickup and timer reset correctly.
- **EnemySpawner**: Type counts and randomized spawn metrics remain accurate.
- **EnemyProjectileSystem**: Enemy and boss projectiles recycle correctly.
- **WaveSystem**: Randomized waves complete and route to boss.
- **BossSystem**: Boss phases, health, defeat, and victory routing work.
- **DifficultySystem**: Loop multipliers apply only where intended.
- **State bridge**: Every field reports current serializable values.

## 8. State Bridge Additions

No new state bridge fields in this goal. This goal validates all existing fields.

State bridge regression checklist:

- `scene`
- `ready`
- `score`
- `gameOver`
- `playerPosition`
- `playerAlive`
- `playerBullets`
- `enemies`
- `playerHealth`
- `hudVisible`
- `currentWave`
- `waveCount`
- `gameWon`
- `gameIdentity`
- `ionBlast`
- `enemyProjectiles`
- `enemyTypes`
- `waveRandomization`
- `boss`
- `victoryVisible`
- `difficulty`

Key regression patterns to check:

- Fields reset correctly on scene restart.
- Fields update in real time during gameplay.
- Fields do not report stale values after transitions.
- `gameOver`, `gameWon`, `boss.defeated`, `victoryVisible`, and `ionBlast.active` clear or persist only when intended.
- `difficulty.loop` increments only from victory restart, not from loss restart.

## 9. Acceptance Criteria

- [ ] AC-14.1 - Full win path completes without errors: boot -> menu -> play -> waves -> boss -> victory -> New Game Plus restart -> play again.
- [ ] AC-14.2 - Full loss path completes without errors: boot -> menu -> play -> lose -> game over -> restart -> play again.
- [ ] AC-14.3 - State bridge reports every field correctly at menu, gameplay, boss, victory, game over, and restart states.
- [ ] AC-14.4 - No console errors or page errors occur during full win and loss sessions.
- [ ] AC-14.5 - Restart cleans transient state: bullets, enemies, projectiles, power-ups, wave state, boss state, and game flags.
- [ ] AC-14.6 - Randomized waves and New Game Plus difficulty feel fair enough for a first playable extension.
- [ ] AC-14.7 - All prior goal tests still pass in the full suite.

## 10. Asset Requirements

No new assets. This goal uses existing assets only.

| Asset | Type | Size / Format | Source |
|-------|------|---------------|--------|
| (none) | - | - | Existing assets only |

## 11. Definition of Done

The goal is complete only when:

- [ ] Every acceptance criterion (AC-14.*) is implemented or validated.
- [ ] An integration test (`tests/game/integration.spec.ts`) exercises the full win path and loss path.
- [ ] `npm test` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] No console errors or page errors are captured during normal full-loop gameplay.
- [ ] State bridge fields report correctly throughout the entire session lifecycle.
- [ ] `goals/14-qc-checkpoint/PROGRESS.md` contains final evidence including screenshots of the full loop.
- [ ] /goal has performed a completion audit mapping each AC to evidence.

## 12. Completion Audit Checklist

Before marking the goal complete, /goal must update `goals/14-qc-checkpoint/PROGRESS.md` with this table:

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-14.1 - Win path loop | | |
| AC-14.2 - Loss path loop | | |
| AC-14.3 - State bridge regression | | |
| AC-14.4 - No console errors | | |
| AC-14.5 - Clean restart | | |
| AC-14.6 - Difficulty and randomization balance | | |
| AC-14.7 - Full test suite pass | | |

## 13. Stop Conditions

/goal must stop and ask for human review if:

- A validation failure requires a new design decision rather than an integration fix.
- Multiple prior goals' tests fail in unrelated systems, indicating a deeper architectural issue.
- The game is technically correct but the difficulty tuning requires subjective design approval.
- Fixing the issue requires adding a new feature, dependency, persistent storage, or deployment step.
- State bridge correctness would require breaking or removing existing fields.
