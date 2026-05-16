# GOAL.md - Wave System

## 1. Objective

Replace open-ended enemy spawning with configured waves that escalate difficulty and end with a clear win condition when the final wave is cleared.

By the end of this goal, the game should support:

- Data-driven enemy waves.
- Wave advancement after clearing spawned enemies.
- A `gameWon` state when the final wave is complete.

## 2. Genre & Physics Config

- **Genre**: shoot-em-up (Raiden-type vertical shooter)
- **Physics system**: Arcade
- **Gravity**: `{ x: 0, y: 0 }`
- **World bounds**: 800 x 600, enemies spawn at top and recycle below bottom

No changes to physics config in this goal.

## 3. Scope

### In scope

- Add WaveConfig data.
- Spawn enemies according to wave count, delay, speed, and score values.
- Advance waves when all enemies for the current wave are cleared.
- Increase difficulty across waves.
- Set `gameWon` after the final wave.
- Update HUD wave display.

### Out of scope

- Boss fights.
- Power-ups.
- Procedural wave generation.
- Online leaderboards or high-score persistence.
- Final art and audio.

### Do not touch

- Single-weapon MVP constraints.
- Polish assets except placeholder wave labels.

## 4. Depends On

- `goals/00-foundation/` - scaffold.
- `goals/01-player-ship/` - player movement.
- `goals/02-player-weapons/` - firing.
- `goals/03-enemies/` - enemies and collisions.
- `goals/04-scoring-health/` - score, health, and game over.
- `goals/05-hud/` - wave display surface.

## 5. Allowed Files

/goal may create or modify:

- `src/game/scenes/GameScene.ts`
- `src/game/scenes/HUDScene.ts`
- `src/game/systems/EnemySpawner.ts`
- `src/game/systems/WaveSystem.ts`
- `src/game/data/waves.ts`
- `src/game/configs/constants.ts` (add new constants only)
- `src/state-bridge.ts` (add new fields only - do not remove existing ones)
- `tests/game/wave-system.spec.ts`
- `goals/06-wave-system/PROGRESS.md`

/goal must not edit:

- Goal folders belonging to other goals.
- `package.json`.
- `index.html`.
- `vite.config.ts`.
- `AGENTS.md`.

## 6. Scene Architecture

### GameScene (modify)

- **`init()`**: Reset current wave, wave completion, and gameWon state.
- **`preload()`**: Not used unless wave data moves to JSON.
- **`create()`**: Create WaveSystem and connect it to enemy spawning.
- **`update(dt)`**: Advance wave timers, spawn scheduled enemies, detect cleared waves, and stop spawning on win or game over.

### HUDScene (modify)

- **`init()`**: Not used.
- **`preload()`**: Not used.
- **`create()`**: Keep wave text reference.
- **`update(dt)`**: Display current wave and total wave count.

## 7. Game Systems

### WaveSystem

- **Purpose**: Drive wave progression and win state.
- **Pattern**: Data-driven state machine.
- **Key methods**: `start()`, `update(delta)`, `onEnemyDestroyed()`, `isWaveClear()`, `getCurrentWave()`, `isGameWon()`.
- **Owns**: Current wave index, spawn schedule, per-wave spawn counts, and win flag.

### WaveConfig

- **Purpose**: Define wave content in data rather than hard-coded scene logic.
- **Pattern**: Typed configuration array.
- **Key fields**: `enemyCount`, `spawnDelayMs`, `enemySpeed`, `scoreValue`.
- **Owns**: Difficulty curve for the MVP.

## 8. State Bridge Additions

New fields added by this goal:

- `currentWave: number` - one-based current wave number while playing.
- `waveCount: number` - total configured wave count.
- `gameWon: boolean` - true after final wave clears.

Cumulative state bridge after this goal:

```typescript
interface GameState {
  scene: string;
  ready: boolean;
  score: number;
  gameOver: boolean;
  playerPosition: { x: number; y: number };
  playerAlive: boolean;
  playerBullets: { activeCount: number };
  enemies: { activeCount: number; totalDestroyed: number };
  playerHealth: number;
  hudVisible: boolean;
  currentWave: number;
  waveCount: number;
  gameWon: boolean;
}
```

## 9. Acceptance Criteria

- [ ] AC-06.1 - Enemies spawn from WaveConfig with type, count, speed, score value, and delay.
- [ ] AC-06.2 - Wave advances when all enemies in the current wave are destroyed or cleared.
- [ ] AC-06.3 - Later waves are harder through higher count, faster enemies, or tighter delays.
- [ ] AC-06.4 - Clearing the final wave sets `gameWon` to true and stops enemy spawning.
- [ ] AC-06.5 - State bridge reports `currentWave`, `waveCount`, and `gameWon`.

## 10. Asset Requirements

| Asset | Type | Size / Format | Source |
|-------|------|---------------|--------|
| wave config | TypeScript data | typed array | Hand-authored |

Placeholder OK - final art ships in Goal 07 Polish.

## 11. Definition of Done

The goal is complete only when:

- [ ] Every acceptance criterion (AC-06.*) is implemented.
- [ ] Every verification command in `goals/06-wave-system/VERIFY.md` passes or has a documented external blocker.
- [ ] All previous goals' tests still pass.
- [ ] New game systems have corresponding Playwright tests.
- [ ] State bridge fields are updated and report correct values.
- [ ] `goals/06-wave-system/PROGRESS.md` contains final evidence.
- [ ] /goal has performed a completion audit mapping each AC to evidence.

## 12. Completion Audit Checklist

Before marking the goal complete, /goal must update `goals/06-wave-system/PROGRESS.md` with this table:

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-06.1 | | |
| AC-06.2 | | |
| AC-06.3 | | |
| AC-06.4 | | |
| AC-06.5 | | |

## 13. Stop Conditions

/goal must stop and ask for human review if:

- Wave completion cannot be made deterministic enough for Playwright tests.
- The MVP needs a boss, power-up, or procedural generation to satisfy wave design.
- HUD changes require a broader UI redesign.
- Prior goal tests fail for unrelated reasons.
- A new dependency is needed.
