# GOAL.md - Enemies

## 1. Objective

Add basic enemy spawning, downward enemy movement, bullet-enemy collision, and enemy recycling so the shooter has destructible targets.

By the end of this goal, the game should support:

- Enemies spawning from the top edge at varied x positions.
- Enemies moving downward and recycling offscreen.
- Player bullets destroying enemies through Arcade overlap checks.

## 2. Genre & Physics Config

- **Genre**: shoot-em-up (Raiden-type vertical shooter)
- **Physics system**: Arcade
- **Gravity**: `{ x: 0, y: 0 }`
- **World bounds**: 800 x 600, enemies recycle below the bottom edge

No changes to physics config in this goal.

## 3. Scope

### In scope

- Create pooled enemy objects.
- Spawn enemies from the top at a configurable interval.
- Move enemies downward.
- Detect bullet-enemy overlap and recycle both objects.
- Track active enemies and total destroyed.

### Out of scope

- Enemy bullets.
- Player damage from enemies.
- Score rewards.
- Wave sequencing.
- Final enemy art.

### Do not touch

- HUD, health, scoring, wave, and polish systems except for safe extension points.
- Audio.

## 4. Depends On

- `goals/00-foundation/` - scaffold and tests.
- `goals/01-player-ship/` - player and input.
- `goals/02-player-weapons/` - bullet pool and firing.

## 5. Allowed Files

/goal may create or modify:

- `src/game/scenes/GameScene.ts`
- `src/game/objects/Enemy.ts`
- `src/game/systems/EnemySpawner.ts`
- `src/game/configs/constants.ts` (add new constants only)
- `src/state-bridge.ts` (add new fields only - do not remove existing ones)
- `tests/game/enemies.spec.ts`
- `goals/03-enemies/PROGRESS.md`

/goal must not edit:

- Goal folders belonging to other goals.
- `package.json`.
- `index.html`.
- `vite.config.ts`.
- `AGENTS.md`.

## 6. Scene Architecture

### GameScene (modify)

- **`init()`**: Reset enemy counters such as total destroyed.
- **`preload()`**: Not used - placeholder enemy texture can be generated in code.
- **`create()`**: Create enemy pool, enemy spawner, and bullet-enemy overlap.
- **`update(dt)`**: Update spawner timing, move active enemies downward, recycle offscreen enemies, and publish enemy counts.

## 7. Game Systems

### EnemySpawner

- **Purpose**: Spawn enemies on a timed interval at top-edge positions.
- **Pattern**: Timed spawner using delta accumulation and pooled enemies.
- **Key methods**: `update(delta)`, `spawnEnemy()`, `getActiveCount()`, `getTotalDestroyed()`.
- **Owns**: Enemy group, spawn interval, spawn range, and destroyed counter.

### Enemy

- **Purpose**: Represent one pooled enemy.
- **Pattern**: Arcade physics sprite with activate/deactivate lifecycle.
- **Key methods**: `spawn(x, y, speed)`, `recycle()`, `preUpdate()`.
- **Owns**: Enemy velocity and offscreen recycling behavior.

## 8. State Bridge Additions

New fields added by this goal:

- `enemies: { activeCount: number; totalDestroyed: number }` - enemy pool activity and kill count.

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
}
```

## 9. Acceptance Criteria

- [ ] AC-03.1 - Enemies spawn at varied x positions along the top edge at a configured interval.
- [ ] AC-03.2 - Enemies move downward at their configured speed.
- [ ] AC-03.3 - Bullet-enemy overlap destroys the enemy and deactivates the bullet.
- [ ] AC-03.4 - Enemies that exit the bottom of the screen are recycled.
- [ ] AC-03.5 - State bridge reports `enemies: { activeCount, totalDestroyed }`.

## 10. Asset Requirements

| Asset | Type | Size / Format | Source |
|-------|------|---------------|--------|
| enemy placeholder | sprite | 28 x 28 generated texture | Placeholder rectangle or diamond |

Placeholder OK - final art ships in Goal 07 Polish.

## 11. Definition of Done

The goal is complete only when:

- [ ] Every acceptance criterion (AC-03.*) is implemented.
- [ ] Every verification command in `goals/03-enemies/VERIFY.md` passes or has a documented external blocker.
- [ ] All previous goals' tests still pass.
- [ ] New game systems have corresponding Playwright tests.
- [ ] State bridge fields are updated and report correct values.
- [ ] `goals/03-enemies/PROGRESS.md` contains final evidence.
- [ ] /goal has performed a completion audit mapping each AC to evidence.

## 12. Completion Audit Checklist

Before marking the goal complete, /goal must update `goals/03-enemies/PROGRESS.md` with this table:

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-03.1 | | |
| AC-03.2 | | |
| AC-03.3 | | |
| AC-03.4 | | |
| AC-03.5 | | |

## 13. Stop Conditions

/goal must stop and ask for human review if:

- Enemy behavior requires attack patterns or enemy bullets.
- Bullet-enemy collision cannot be tested through state bridge counters.
- Score or health changes are required before Goal 04.
- Prior goal tests fail for unrelated reasons.
- A new dependency is needed.
