# GOAL.md - Ion Blast Power-Up

## 1. Objective

Add Ion Blast, a timed power-up that temporarily increases player firepower by firing multiple projectiles at once. The feature must use bounded pools, expire cleanly, and report its state through the bridge for Playwright verification.

By the end of this goal, the game should support:

- Ion Blast pickups that appear during normal play.
- A temporary multi-shot firing mode after collection.
- Automatic return to the normal weapon after the timer expires.
- State bridge visibility for pickup collection and active weapon state.

## 2. Genre & Physics Config

- **Genre**: shoot-em-up (Raiden-style vertical shooter)
- **Physics system**: Arcade
- **Gravity**: `{ x: 0, y: 0 }`
- **World bounds**: 800x600, player clamped to bounds

No changes to physics config in this goal.

## 3. Scope

### In scope

- Add an Ion Blast pickup object or power-up system.
- Spawn Ion Blast pickups at controlled gameplay intervals or from enemy drops.
- Add a player overlap handler that activates Ion Blast.
- Extend PlayerWeapon so active Ion Blast fires multiple projectiles in one shot pattern.
- Add timer-based expiration and state bridge fields.

### Out of scope

- Additional power-up types.
- Permanent weapon upgrades.
- Boss fight mechanics.
- Enemy archetype changes beyond what is needed for pickup spawning.
- Final art; placeholder shape or tinted existing sprite is acceptable.

### Do not touch

- Goal folders belonging to other goals.
- Existing game identity fields from Goal 08 except reading them through the state bridge.
- Package metadata or project config.

## 4. Depends On

All previous goals must be complete:

- `goals/08-rebrand-ion-viper/` - Ion Blast builds on the renamed Ion Viper identity and cumulative state bridge.

## 5. Allowed Files

/goal may create or modify:

- `src/game/configs/constants.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/objects/IonBlastPickup.ts` (new)
- `src/game/objects/PlayerBullet.ts`
- `src/game/systems/PowerUpSystem.ts` (new)
- `src/game/systems/PlayerWeapon.ts`
- `src/state-bridge.ts` (add new fields only - do not remove existing ones)
- `tests/game/ion-blast.spec.ts` (new)
- `goals/09-ion-blast-power-up/PROGRESS.md`

/goal must not edit:

- Goal folders belonging to other goals.
- `package.json`
- `index.html`
- `vite.config.ts`
- `AGENTS.md`

## 6. Scene Architecture

### GameScene (modify)

- **`init()`**: Reset Ion Blast registry state to inactive with zero remaining duration and zero collected count.
- **`preload()`**: Not used - assets loaded in BootScene or generated as simple shapes at runtime.
- **`create()`**: Create the power-up pool, player overlap, and references needed by PlayerWeapon.
- **`update(dt)`**: Update power-up timers, spawn cadence, pickup recycling, and publish Ion Blast state.

## 7. Game Systems

### PowerUpSystem

- **Purpose**: Own Ion Blast pickup spawning, collection, timing, and registry reporting.
- **Pattern**: Object pool plus timed effect state.
- **Key methods**: `start()`, `update(delta)`, `handlePlayerOverlap()`, `activateIonBlast()`, `isIonBlastActive()`, `getState()`.
- **Owns**: Ion Blast pickup group, active timer, collected count.

### PlayerWeapon

- **Purpose**: Fire either normal single-shot or Ion Blast multi-shot pattern.
- **Pattern**: Existing bounded bullet pool.
- **Key methods**: Extend `tryFire()` or add a pattern helper that can spawn center, left, and right projectiles.
- **Owns**: Player bullet group and fire-rate timing.

## 8. State Bridge Additions

New fields added by this goal:

- `ionBlast: { active: boolean; remainingMs: number; collectedCount: number; projectileCount: number }` - current Ion Blast effect and shot pattern state.

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
}
```

## 9. Acceptance Criteria

- [ ] AC-09.1 - Ion Blast pickups spawn during gameplay and are recycled when collected or expired offscreen.
- [ ] AC-09.2 - Player overlap with an Ion Blast pickup activates Ion Blast and increments collected count.
- [ ] AC-09.3 - While Ion Blast is active, pressing or holding SPACE fires multiple projectiles per shot.
- [ ] AC-09.4 - Ion Blast automatically expires after the configured duration and returns to single-shot firing.
- [ ] AC-09.5 - Bullet and pickup pools remain bounded; no recurring game objects are created in `update()`.
- [ ] AC-09.6 - State bridge reports `ionBlast.active`, `remainingMs`, `collectedCount`, and `projectileCount`.

## 10. Asset Requirements

Placeholder OK - final art can ship in a later polish pass.

| Asset | Type | Size / Format | Source |
|-------|------|---------------|--------|
| Ion Blast pickup | sprite or runtime shape | 20x20 visible pickup | Placeholder shape or tinted generated texture |
| Ion Blast bullet pattern | existing bullet sprite | existing bullet dimensions | Existing `player-bullet` asset |

## 11. Definition of Done

The goal is complete only when:

- [ ] Every acceptance criterion (AC-09.*) is implemented.
- [ ] Every verification command in `goals/09-ion-blast-power-up/VERIFY.md` passes or has a documented external blocker.
- [ ] All previous goals' tests still pass (run full test suite).
- [ ] New game systems have corresponding Playwright tests.
- [ ] State bridge fields are updated and report correct values.
- [ ] `goals/09-ion-blast-power-up/PROGRESS.md` contains final evidence.
- [ ] /goal has performed a completion audit mapping each AC to evidence.

## 12. Completion Audit Checklist

Before marking the goal complete, /goal must update `goals/09-ion-blast-power-up/PROGRESS.md` with this table:

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-09.1 | | |
| AC-09.2 | | |
| AC-09.3 | | |
| AC-09.4 | | |
| AC-09.5 | | |
| AC-09.6 | | |

## 13. Stop Conditions

/goal must stop and ask for human review if:

- Pickup spawn rules cannot be verified without adding a test-only cheat path.
- Multi-shot behavior would require replacing the existing bullet pool instead of extending it.
- The active projectile count requires increasing pool size so much that performance or balance changes are unclear.
- The state bridge would need breaking changes to existing `playerBullets` fields.
