# GOAL.md - Enemy Archetypes

## 1. Objective

Replace the single enemy behavior with at least three enemy archetypes that demand different player responses: a basic drifter, a shooter, and a charger. The implementation must remain data-driven enough to add more enemy types later.

By the end of this goal, the game should support:

- Three configured enemy types with distinct movement and attack behavior.
- Enemy projectiles fired from a bounded pool.
- Per-type health, score, speed, and behavior tuning.
- State bridge reporting for active enemy type counts and enemy projectiles.

## 2. Genre & Physics Config

- **Genre**: shoot-em-up (Raiden-style vertical shooter)
- **Physics system**: Arcade
- **Gravity**: `{ x: 0, y: 0 }`
- **World bounds**: 800x600, player clamped to bounds

No changes to physics config in this goal.

## 3. Scope

### In scope

- Add enemy type data for `basic`, `shooter`, and `charger`.
- Extend enemy spawning so wave configs can request a type.
- Give enemies health so tougher types can survive more than one hit.
- Add shooter enemy projectile behavior using a bounded projectile pool.
- Add charger behavior that telegraphs or delays before accelerating toward the player.
- Update collision and scoring so health, destruction, and score value work per type.

### Out of scope

- Additional enemy types beyond the initial three.
- Boss fights.
- Randomized wave start positions; Goal 11 owns balanced randomization.
- New final art assets; placeholders or tinting are acceptable.
- New player power-ups beyond Ion Blast.

### Do not touch

- Game identity metadata from Goal 08.
- Ion Blast behavior except where enemy health collision naturally interacts with player bullets.
- Package or build configuration.

## 4. Depends On

All previous goals must be complete:

- `goals/09-ion-blast-power-up/` - enemy health and projectile collisions must coexist with Ion Blast multi-shot behavior.

## 5. Allowed Files

/goal may create or modify:

- `src/game/configs/constants.ts`
- `src/game/data/enemies.ts` (new)
- `src/game/data/waves.ts`
- `src/game/objects/Enemy.ts`
- `src/game/objects/EnemyProjectile.ts` (new)
- `src/game/systems/EnemySpawner.ts`
- `src/game/systems/EnemyProjectileSystem.ts` (new)
- `src/game/systems/CombatSystem.ts`
- `src/game/scenes/GameScene.ts`
- `src/state-bridge.ts` (add new fields only - do not remove existing ones)
- `tests/game/enemy-archetypes.spec.ts` (new)
- `goals/10-enemy-archetypes/PROGRESS.md`

/goal must not edit:

- Goal folders belonging to other goals.
- `package.json`
- `index.html`
- `vite.config.ts`
- `AGENTS.md`

## 6. Scene Architecture

### GameScene (modify)

- **`init()`**: Reset enemy projectile and enemy type registry fields.
- **`preload()`**: Not used - assets loaded in BootScene or represented with existing enemy art/tints.
- **`create()`**: Create enemy projectile pool, enemy/player overlaps, and bullet/enemy health collision handling.
- **`update(dt)`**: Update enemy behavior state, enemy projectile movement/recycling, and publish type counts.

## 7. Game Systems

### EnemySpawner

- **Purpose**: Spawn enemies by configured type and track active type counts.
- **Pattern**: Existing Phaser physics group pool.
- **Key methods**: `spawnEnemy(options)`, `destroyEnemy(enemy)`, `getState()`, `getTypeState()`.
- **Owns**: Enemy group and per-type active count metrics.

### EnemyProjectileSystem

- **Purpose**: Manage shooter enemy bullets and collision with the player.
- **Pattern**: Object pool.
- **Key methods**: `fireFromEnemy(enemy)`, `update(delta)`, `getState()`, `getGroup()`.
- **Owns**: Enemy projectile group.

### Enemy

- **Purpose**: Represent one pooled enemy with data-driven type behavior.
- **Pattern**: Pooled arcade sprite with internal behavior state.
- **Key methods**: `spawn(config, options)`, `damage(amount)`, `isDestroyed()`, `recycle()`, `preUpdate(time, delta)`.
- **Owns**: Health, enemy type, movement state, and score value.

## 8. State Bridge Additions

New fields added by this goal:

- `enemyProjectiles: { activeCount: number }` - active enemy projectile count.
- `enemyTypes: { activeBasic: number; activeShooter: number; activeCharger: number; lastSpawnedType: string }` - visible enemy type mix.

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
}
```

## 9. Acceptance Criteria

- [ ] AC-10.1 - At least three enemy types exist: basic drifter, shooter, and charger.
- [ ] AC-10.2 - Basic enemies retain the original downward-drifting behavior.
- [ ] AC-10.3 - Shooter enemies fire enemy projectiles from a bounded pool.
- [ ] AC-10.4 - Charger enemies telegraph or delay briefly before accelerating toward the player.
- [ ] AC-10.5 - Enemy health and score values are configured per type and affect combat outcomes.
- [ ] AC-10.6 - State bridge reports enemy projectile count and active counts for each enemy type.

## 10. Asset Requirements

Placeholder OK - final art can ship in a later polish pass.

| Asset | Type | Size / Format | Source |
|-------|------|---------------|--------|
| Basic enemy | sprite | existing enemy size | Existing `enemy-drone` asset |
| Shooter enemy | sprite/tinted variant | 28x28 PNG or runtime tint | Existing asset with tint or generated texture |
| Charger enemy | sprite/tinted variant | 28x28 PNG or runtime tint | Existing asset with tint or generated texture |
| Enemy projectile | sprite/runtime shape | 4x10 or similar | Placeholder shape or generated texture |

## 11. Definition of Done

The goal is complete only when:

- [ ] Every acceptance criterion (AC-10.*) is implemented.
- [ ] Every verification command in `goals/10-enemy-archetypes/VERIFY.md` passes or has a documented external blocker.
- [ ] All previous goals' tests still pass (run full test suite).
- [ ] New game systems have corresponding Playwright tests.
- [ ] State bridge fields are updated and report correct values.
- [ ] `goals/10-enemy-archetypes/PROGRESS.md` contains final evidence.
- [ ] /goal has performed a completion audit mapping each AC to evidence.

## 12. Completion Audit Checklist

Before marking the goal complete, /goal must update `goals/10-enemy-archetypes/PROGRESS.md` with this table:

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-10.1 | | |
| AC-10.2 | | |
| AC-10.3 | | |
| AC-10.4 | | |
| AC-10.5 | | |
| AC-10.6 | | |

## 13. Stop Conditions

/goal must stop and ask for human review if:

- Enemy type implementation requires replacing the existing pooled enemy group with unbounded object creation.
- Shooter or charger behavior makes the game unwinnable with current player health and movement speed.
- Enemy health changes break Ion Blast or normal bullet tests in ways that require design decisions.
- State bridge reporting would require removing or changing existing `enemies` fields.
