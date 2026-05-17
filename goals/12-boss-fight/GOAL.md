# GOAL.md - Boss Fight

## 1. Objective

Add a boss fight that starts after all regular waves are cleared. The boss must have visible health, multiple attack phases, pooled attacks, and a victory screen when defeated.

By the end of this goal, the game should support:

- A boss encounter after the final regular wave.
- A visible boss health bar.
- Multiple boss phases with distinct attack pressure.
- A VictoryScene that appears only after boss defeat.
- State bridge reporting for boss and victory state.

## 2. Genre & Physics Config

- **Genre**: shoot-em-up (Raiden-style vertical shooter)
- **Physics system**: Arcade
- **Gravity**: `{ x: 0, y: 0 }`
- **World bounds**: 800x600, player clamped to bounds

No changes to physics config in this goal.

## 3. Scope

### In scope

- Add a boss object with health, max health, phase, and defeated state.
- Change final regular wave completion so it starts the boss instead of immediately winning.
- Add at least three boss phases based on health thresholds or time.
- Reuse or extend enemy projectile pooling for boss attacks.
- Add a visible boss health bar in HUDScene or GameScene.
- Add VictoryScene and transition to it after boss defeat.

### Out of scope

- Multiple bosses.
- New Game Plus scaling; Goal 13 owns increased difficulty restarts.
- Additional player power-ups.
- Final bespoke boss art; placeholder or tinted generated shape is acceptable.
- Online score submission or persistence.

### Do not touch

- Ion Blast semantics except natural interaction with boss health.
- Randomized regular wave fairness rules except final-wave-to-boss transition.
- Package metadata.

## 4. Depends On

All previous goals must be complete:

- `goals/11-randomized-wave-system/` - boss starts after randomized regular waves are complete.

## 5. Allowed Files

/goal may create or modify:

- `src/game/configs/constants.ts`
- `src/game/main.ts`
- `src/game/scenes/BootScene.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/scenes/HUDScene.ts`
- `src/game/scenes/VictoryScene.ts` (new)
- `src/game/objects/Boss.ts` (new)
- `src/game/systems/BossSystem.ts` (new)
- `src/game/systems/WaveSystem.ts`
- `src/game/systems/EnemyProjectileSystem.ts`
- `src/game/systems/CombatSystem.ts`
- `src/state-bridge.ts` (add new fields only - do not remove existing ones)
- `tests/game/boss-fight.spec.ts` (new)
- `goals/12-boss-fight/PROGRESS.md`

/goal must not edit:

- Goal folders belonging to other goals.
- `package.json`
- `index.html`
- `vite.config.ts`
- `AGENTS.md`

## 6. Scene Architecture

### GameScene (modify)

- **`init()`**: Reset boss state to inactive, not defeated, full health when applicable.
- **`preload()`**: Not used unless BootScene is updated to load a boss placeholder asset.
- **`create()`**: Create BossSystem, boss/projectile overlaps, and final-wave completion callback.
- **`update(dt)`**: Update boss phases and attacks when active; publish boss state.

### HUDScene (modify)

- **`init()`**: Reset cached boss UI text/bar references if needed.
- **`preload()`**: Not used.
- **`create()`**: Add boss health bar UI that stays hidden until the boss is active.
- **`update(dt)`**: Update boss health bar based on registry/state.

### VictoryScene (create)

- **`init(data?)`**: Receive final score and difficulty loop data if present.
- **`preload()`**: Not used - assets loaded in BootScene.
- **`create()`**: Stop HUD, show victory title, score, and restart prompt for the next goal to extend.
- **`update(dt)`**: Not used.

## 7. Game Systems

### BossSystem

- **Purpose**: Own boss spawn, health, phases, attacks, defeat, and state publishing.
- **Pattern**: State machine with pooled projectile attacks.
- **Key methods**: `startBoss()`, `update(delta)`, `damageBoss(amount)`, `getState()`, `isActive()`, `isDefeated()`.
- **Owns**: Boss object, phase transition rules, health, attack cadence.

### Boss

- **Purpose**: Large pooled or persistent arcade sprite for the boss encounter.
- **Pattern**: Arcade sprite with bounded movement and explicit active/inactive state.
- **Key methods**: `spawn()`, `damage(amount)`, `setPhase(phase)`, `recycle()`.
- **Owns**: Position, body size, health-facing data supplied by BossSystem.

## 8. State Bridge Additions

New fields added by this goal:

- `boss: { active: boolean; health: number; maxHealth: number; phase: number; defeated: boolean }` - current boss encounter state.
- `victoryVisible: boolean` - true when VictoryScene is active and visible.

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
}
```

## 9. Acceptance Criteria

- [ ] AC-12.1 - Clearing the final regular wave starts the boss encounter instead of immediately ending the game.
- [ ] AC-12.2 - Boss state includes active, health, max health, phase, and defeated values.
- [ ] AC-12.3 - Boss health bar is visible while the boss is active and updates when damaged.
- [ ] AC-12.4 - Boss has at least three attack phases with distinguishable attack cadence, pattern, or movement.
- [ ] AC-12.5 - Player bullets, including Ion Blast projectiles, damage the boss.
- [ ] AC-12.6 - Defeating the boss sets `gameWon` true and transitions to VictoryScene.
- [ ] AC-12.7 - State bridge reports boss state and `victoryVisible` correctly.

## 10. Asset Requirements

Placeholder OK - final art can ship in a later polish pass.

| Asset | Type | Size / Format | Source |
|-------|------|---------------|--------|
| Boss placeholder | sprite/runtime shape | about 96x64 | Placeholder generated texture or tinted existing asset |
| Boss projectiles | sprite/runtime shape | 6x12 or similar | Reuse enemy projectile system |
| Boss health bar | UI shape | canvas rectangles/text | Runtime UI |

## 11. Definition of Done

The goal is complete only when:

- [ ] Every acceptance criterion (AC-12.*) is implemented.
- [ ] Every verification command in `goals/12-boss-fight/VERIFY.md` passes or has a documented external blocker.
- [ ] All previous goals' tests still pass (run full test suite).
- [ ] New game systems have corresponding Playwright tests.
- [ ] State bridge fields are updated and report correct values.
- [ ] `goals/12-boss-fight/PROGRESS.md` contains final evidence.
- [ ] /goal has performed a completion audit mapping each AC to evidence.

## 12. Completion Audit Checklist

Before marking the goal complete, /goal must update `goals/12-boss-fight/PROGRESS.md` with this table:

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-12.1 | | |
| AC-12.2 | | |
| AC-12.3 | | |
| AC-12.4 | | |
| AC-12.5 | | |
| AC-12.6 | | |
| AC-12.7 | | |

## 13. Stop Conditions

/goal must stop and ask for human review if:

- Boss phase behavior makes the fight unwinnable with current movement, health, and Ion Blast tuning.
- VictoryScene routing conflicts with existing GameOverScene restart behavior.
- Adding boss attacks would require unbounded projectile creation.
- Boss state requires breaking existing `gameWon` semantics instead of extending them.
