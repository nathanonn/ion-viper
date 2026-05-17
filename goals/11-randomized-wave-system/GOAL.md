# GOAL.md - Randomized Waves

## 1. Objective

Update the wave system so enemy starting positions, timing, and spacing are randomized enough to keep playthroughs unpredictable while still enforcing fair reaction windows and reliable wave completion.

By the end of this goal, the game should support:

- Randomized enemy spawn positions instead of fixed cycling.
- Fair spacing rules that prevent unfair same-lane stacking.
- Wave timing adjustments that account for enemy archetypes.
- State bridge metrics that make randomization testable.

## 2. Genre & Physics Config

- **Genre**: shoot-em-up (Raiden-style vertical shooter)
- **Physics system**: Arcade
- **Gravity**: `{ x: 0, y: 0 }`
- **World bounds**: 800x600, player clamped to bounds

No changes to physics config in this goal.

## 3. Scope

### In scope

- Replace fixed spawn-position cycling with balanced random selection.
- Add spawn lane spacing rules that avoid immediate unfair repeats.
- Tune spawn delays and wave composition around basic, shooter, and charger enemies.
- Preserve reliable wave advancement and final-wave completion.
- Expose randomization metrics through the state bridge.

### Out of scope

- Fully procedural wave generation.
- New enemy types.
- Boss fight implementation.
- New Game Plus scaling.
- Online seeds, leaderboards, or replay sharing.

### Do not touch

- Ion Blast pickup behavior except for normal gameplay coexistence.
- Enemy type definitions except wave composition references and balance values.
- Package or app identity metadata.

## 4. Depends On

All previous goals must be complete:

- `goals/10-enemy-archetypes/` - randomized waves must work with all enemy types.

## 5. Allowed Files

/goal may create or modify:

- `src/game/configs/constants.ts`
- `src/game/data/waves.ts`
- `src/game/systems/WaveSystem.ts`
- `src/game/systems/EnemySpawner.ts`
- `src/game/systems/WaveRandomizer.ts` (new)
- `src/game/scenes/GameScene.ts`
- `src/state-bridge.ts` (add new fields only - do not remove existing ones)
- `tests/game/randomized-waves.spec.ts` (new)
- `goals/11-randomized-wave-system/PROGRESS.md`

/goal must not edit:

- Goal folders belonging to other goals.
- `package.json`
- `index.html`
- `vite.config.ts`
- `AGENTS.md`

## 6. Scene Architecture

### GameScene (modify)

- **`init()`**: Reset randomization metrics and wave state.
- **`preload()`**: Not used.
- **`create()`**: Construct WaveSystem/EnemySpawner with randomization config.
- **`update(dt)`**: Update waves normally and publish randomization metrics.

## 7. Game Systems

### WaveRandomizer

- **Purpose**: Choose spawn lanes and timing offsets with fairness constraints.
- **Pattern**: Small deterministic-friendly service owned by wave/enemy spawning.
- **Key methods**: `nextSpawnX()`, `nextDelay(baseDelay)`, `recordSpawn(x)`, `getState()`.
- **Owns**: Recent spawn history, unique lane count, minimum recent spacing, optional seed.

### WaveSystem

- **Purpose**: Continue wave progression while using balanced randomized spawn requests.
- **Pattern**: Existing wave state machine.
- **Key methods**: Existing `start()`, `update(delta)`, and state publishing plus randomization integration.
- **Owns**: Current wave index, spawn elapsed time, clear counts.

## 8. State Bridge Additions

New fields added by this goal:

- `waveRandomization: { enabled: boolean; spawnCount: number; uniqueSpawnLanes: number; minimumRecentSpacing: number; lastSpawnX: number; previousSpawnX: number }` - metrics for randomization and fairness assertions.

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
  enemies: {
    activeCount: number;
    totalDestroyed: number;
    totalSpawned: number;
    totalRecycled: number;
    lastSpawnX: number;
    previousSpawnX: number;
    samplePosition: { x: number; y: number };
  };
  playerHealth: number;
  hudVisible: boolean;
  currentWave: number;
  waveCount: number;
  gameWon: boolean;
  gameIdentity: { title: string; description: string };
  ionBlast: {
    active: boolean;
    remainingMs: number;
    collectedCount: number;
    projectileCount: number;
  };
  enemyProjectiles: { activeCount: number };
  enemyTypes: {
    activeBasic: number;
    activeShooter: number;
    activeCharger: number;
    lastSpawnedType: string;
  };
  waveRandomization: {
    enabled: boolean;
    spawnCount: number;
    uniqueSpawnLanes: number;
    minimumRecentSpacing: number;
    lastSpawnX: number;
    previousSpawnX: number;
  };
}
```

## 9. Acceptance Criteria

- [ ] AC-11.1 - Enemy spawn x-positions vary between playthroughs or wave runs instead of fixed cycling.
- [ ] AC-11.2 - Randomization prevents unfair immediate stacking by enforcing a configured minimum lane spacing.
- [ ] AC-11.3 - Wave spawn timing and spacing are tuned for readable challenge with basic, shooter, and charger enemies.
- [ ] AC-11.4 - Randomized waves still advance and complete reliably through the final regular wave.
- [ ] AC-11.5 - State bridge reports randomization enabled, spawn count, unique lane count, recent spacing, and last/previous spawn x values.
- [ ] AC-11.6 - All existing wave, enemy, and Ion Blast tests still pass after timing updates.

## 10. Asset Requirements

No new assets.

| Asset | Type | Size / Format | Source |
|-------|------|---------------|--------|
| (none) | - | - | Existing assets only |

## 11. Definition of Done

The goal is complete only when:

- [ ] Every acceptance criterion (AC-11.*) is implemented.
- [ ] Every verification command in `goals/11-randomized-wave-system/VERIFY.md` passes or has a documented external blocker.
- [ ] All previous goals' tests still pass (run full test suite).
- [ ] New game systems have corresponding Playwright tests.
- [ ] State bridge fields are updated and report correct values.
- [ ] `goals/11-randomized-wave-system/PROGRESS.md` contains final evidence.
- [ ] /goal has performed a completion audit mapping each AC to evidence.

## 12. Completion Audit Checklist

Before marking the goal complete, /goal must update `goals/11-randomized-wave-system/PROGRESS.md` with this table:

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-11.1 | | |
| AC-11.2 | | |
| AC-11.3 | | |
| AC-11.4 | | |
| AC-11.5 | | |
| AC-11.6 | | |

## 13. Stop Conditions

/goal must stop and ask for human review if:

- Randomization makes tests flaky and cannot be stabilized through state metrics or deterministic test hooks.
- Fair spacing conflicts with requested wave density in a way that requires design input.
- Timing changes make previous wave progression tests invalid for reasons unrelated to intended randomization.
- The implementation requires procedural generation beyond balanced spawn randomization.
