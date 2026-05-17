# GOAL.md - New Game Plus

## 1. Objective

Let players restart after defeating the boss into a higher difficulty loop. Each loop should increase enemy speed and health, and the boss should become tougher, while transient gameplay state resets cleanly.

By the end of this goal, the game should support:

- Victory restart into the next difficulty loop.
- Difficulty multipliers for enemies and boss.
- Clean restart state with increased challenge.
- State bridge reporting for current loop and multipliers.

## 2. Genre & Physics Config

- **Genre**: shoot-em-up (Raiden-style vertical shooter)
- **Physics system**: Arcade
- **Gravity**: `{ x: 0, y: 0 }`
- **World bounds**: 800x600, player clamped to bounds

No changes to physics config in this goal.

## 3. Scope

### In scope

- Add a difficulty loop counter that starts at 1.
- Add VictoryScene restart input that starts GameScene with loop + 1.
- Scale enemy speed and health by loop.
- Scale boss health or phase pressure by loop.
- Preserve the loop value through victory restart while resetting transient combat, wave, boss, projectile, and power-up state.
- Report difficulty state through the state bridge.

### Out of scope

- Persistent save/load of highest loop.
- Online leaderboards.
- New enemy types or bosses.
- Dynamic difficulty based on player performance.
- Changing base resolution or controls.

### Do not touch

- Rebrand metadata.
- New boss feature scope beyond applying difficulty multipliers.
- Randomized wave fairness rules except for multiplier-aware balance.

## 4. Depends On

All previous goals must be complete:

- `goals/12-boss-fight/` - New Game Plus starts from boss victory.

## 5. Allowed Files

/goal may create or modify:

- `src/game/configs/constants.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/scenes/VictoryScene.ts`
- `src/game/scenes/GameOverScene.ts`
- `src/game/scenes/HUDScene.ts`
- `src/game/systems/DifficultySystem.ts` (new)
- `src/game/systems/WaveSystem.ts`
- `src/game/systems/EnemySpawner.ts`
- `src/game/systems/BossSystem.ts`
- `src/state-bridge.ts` (add new fields only - do not remove existing ones)
- `tests/game/new-game-plus.spec.ts` (new)
- `goals/13-new-game-plus/PROGRESS.md`

/goal must not edit:

- Goal folders belonging to other goals.
- `package.json`
- `index.html`
- `vite.config.ts`
- `AGENTS.md`

## 6. Scene Architecture

### VictoryScene (modify)

- **`init(data?)`**: Receive current difficulty loop and final score.
- **`preload()`**: Not used.
- **`create()`**: Show current loop cleared and next-loop restart prompt.
- **`update(dt)`**: Not used unless input polling is preferred over event handlers.

### GameScene (modify)

- **`init(data?)`**: Read `difficultyLoop` from scene data; default to 1; reset transient state.
- **`preload()`**: Not used.
- **`create()`**: Construct systems with difficulty multipliers.
- **`update(dt)`**: Publish difficulty state alongside gameplay state.

### GameOverScene (modify)

- **`init(data?)`**: Receive difficulty loop if game over should restart the same loop.
- **`preload()`**: Not used.
- **`create()`**: Restart the current loop on SPACE rather than accidentally resetting or incrementing loop.
- **`update(dt)`**: Not used.

## 7. Game Systems

### DifficultySystem

- **Purpose**: Convert difficulty loop count into enemy and boss multipliers.
- **Pattern**: Pure calculation helper or small service owned by GameScene.
- **Key methods**: `fromLoop(loop)`, `getEnemySpeedMultiplier()`, `getEnemyHealthMultiplier()`, `getBossHealthMultiplier()`, `getState()`.
- **Owns**: Loop count and multiplier calculations.

## 8. State Bridge Additions

New fields added by this goal:

- `difficulty: { loop: number; enemySpeedMultiplier: number; enemyHealthMultiplier: number; bossHealthMultiplier: number }` - current New Game Plus difficulty state.

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
  boss: {
    active: boolean;
    health: number;
    maxHealth: number;
    phase: number;
    defeated: boolean;
  };
  victoryVisible: boolean;
  difficulty: {
    loop: number;
    enemySpeedMultiplier: number;
    enemyHealthMultiplier: number;
    bossHealthMultiplier: number;
  };
}
```

## 9. Acceptance Criteria

- [ ] AC-13.1 - Difficulty loop starts at 1 on a fresh game from the menu.
- [ ] AC-13.2 - VictoryScene offers a restart that starts the next difficulty loop.
- [ ] AC-13.3 - Difficulty loop increments by exactly 1 after each boss clear and victory restart.
- [ ] AC-13.4 - Enemy speed and health are higher on loop 2 than loop 1.
- [ ] AC-13.5 - Boss max health or phase pressure is higher on loop 2 than loop 1.
- [ ] AC-13.6 - Restart resets transient gameplay state while preserving the intended loop.
- [ ] AC-13.7 - State bridge reports loop and multiplier values.

## 10. Asset Requirements

No new assets.

| Asset | Type | Size / Format | Source |
|-------|------|---------------|--------|
| (none) | - | - | Existing assets only |

## 11. Definition of Done

The goal is complete only when:

- [ ] Every acceptance criterion (AC-13.*) is implemented.
- [ ] Every verification command in `goals/13-new-game-plus/VERIFY.md` passes or has a documented external blocker.
- [ ] All previous goals' tests still pass (run full test suite).
- [ ] New game systems have corresponding Playwright tests.
- [ ] State bridge fields are updated and report correct values.
- [ ] `goals/13-new-game-plus/PROGRESS.md` contains final evidence.
- [ ] /goal has performed a completion audit mapping each AC to evidence.

## 12. Completion Audit Checklist

Before marking the goal complete, /goal must update `goals/13-new-game-plus/PROGRESS.md` with this table:

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-13.1 | | |
| AC-13.2 | | |
| AC-13.3 | | |
| AC-13.4 | | |
| AC-13.5 | | |
| AC-13.6 | | |
| AC-13.7 | | |

## 13. Stop Conditions

/goal must stop and ask for human review if:

- Difficulty scaling makes loop 2 unwinnable or trivial based on verification evidence.
- There is ambiguity about whether GameOverScene should restart the same loop or reset to loop 1.
- Preserving difficulty loop requires persistent storage, which is out of scope.
- Existing restart tests fail because of unclear intended loop behavior.
