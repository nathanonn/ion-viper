# GOAL.md - Player Weapons

## 1. Objective

Add a single upward-firing weapon for the player ship using pooled bullets and a configurable fire-rate limit so the core shooting loop works without introducing enemies yet.

By the end of this goal, the game should support:

- SPACE key firing from the player position.
- Bullets traveling upward and recycling offscreen.
- State bridge reporting for active player bullets.

## 2. Genre & Physics Config

- **Genre**: shoot-em-up (Raiden-type vertical shooter)
- **Physics system**: Arcade
- **Gravity**: `{ x: 0, y: 0 }`
- **World bounds**: 800 x 600, bullets recycle when leaving the top edge

No changes to physics config in this goal.

## 3. Scope

### In scope

- Create pooled player bullets.
- Fire bullets from the player ship with SPACE.
- Enforce a fire-rate cooldown.
- Recycle bullets when they leave the top of the screen.
- Expose bullet active count via the state bridge.

### Out of scope

- Multiple weapon types.
- Power-ups.
- Enemy collisions.
- Sounds, particles, and final bullet art.

### Do not touch

- Enemy systems.
- Health, scoring, wave, HUD, or polish systems.

## 4. Depends On

- `goals/00-foundation/` - scaffold and boot verification.
- `goals/01-player-ship/` - player position and input exist.

## 5. Allowed Files

/goal may create or modify:

- `src/game/scenes/GameScene.ts`
- `src/game/objects/PlayerBullet.ts`
- `src/game/systems/PlayerWeapon.ts`
- `src/game/configs/constants.ts` (add new constants only)
- `src/state-bridge.ts` (add new fields only - do not remove existing ones)
- `tests/game/player-weapons.spec.ts`
- `goals/02-player-weapons/PROGRESS.md`

/goal must not edit:

- Goal folders belonging to other goals.
- `package.json`.
- `index.html`.
- `vite.config.ts`.
- `AGENTS.md`.

## 6. Scene Architecture

### GameScene (modify)

- **`init()`**: Reset weapon cooldown state if stored on the scene.
- **`preload()`**: Not used - placeholder bullet texture can be generated in code.
- **`create()`**: Create the bullet pool, bind SPACE input, and initialize weapon state.
- **`update(dt)`**: Fire while SPACE is held, move active bullets upward, recycle offscreen bullets, and publish active count.

## 7. Game Systems

### PlayerWeapon

- **Purpose**: Own player firing cadence and bullet spawning.
- **Pattern**: Object pool through a Phaser Physics Group.
- **Key methods**: `tryFire()`, `update()`, `getActiveCount()`.
- **Owns**: Bullet group, fire cooldown, bullet speed, and max bullet count.

### PlayerBullet

- **Purpose**: Represent one pooled upward projectile.
- **Pattern**: Arcade physics sprite with activate/deactivate lifecycle.
- **Key methods**: `fire(x, y)`, `recycle()`, `preUpdate()`.
- **Owns**: Bullet velocity and offscreen recycling.

## 8. State Bridge Additions

New fields added by this goal:

- `playerBullets: { activeCount: number }` - number of active player bullets.

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
}
```

## 9. Acceptance Criteria

- [ ] AC-02.1 - Pressing SPACE spawns a bullet at the player's position moving upward.
- [ ] AC-02.2 - Bullets are managed by a Phaser Group with a max-size pool.
- [ ] AC-02.3 - Holding SPACE respects the configured fire-rate interval.
- [ ] AC-02.4 - Bullets are killed or recycled when they exit the top of the screen.
- [ ] AC-02.5 - State bridge reports `playerBullets: { activeCount }`.

## 10. Asset Requirements

| Asset | Type | Size / Format | Source |
|-------|------|---------------|--------|
| player bullet placeholder | sprite | 4 x 12 generated texture | Placeholder rectangle |

Placeholder OK - final art ships in Goal 07 Polish.

## 11. Definition of Done

The goal is complete only when:

- [ ] Every acceptance criterion (AC-02.*) is implemented.
- [ ] Every verification command in `goals/02-player-weapons/VERIFY.md` passes or has a documented external blocker.
- [ ] All previous goals' tests still pass.
- [ ] New game systems have corresponding Playwright tests.
- [ ] State bridge fields are updated and report correct values.
- [ ] `goals/02-player-weapons/PROGRESS.md` contains final evidence.
- [ ] /goal has performed a completion audit mapping each AC to evidence.

## 12. Completion Audit Checklist

Before marking the goal complete, /goal must update `goals/02-player-weapons/PROGRESS.md` with this table:

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-02.1 | | |
| AC-02.2 | | |
| AC-02.3 | | |
| AC-02.4 | | |
| AC-02.5 | | |

## 13. Stop Conditions

/goal must stop and ask for human review if:

- Bullet firing requires a weapon choice beyond the single-weapon MVP.
- Bullet behavior cannot be exposed through primitive state bridge fields.
- A new dependency is needed for pooling or collision.
- Previous goal tests fail for unrelated reasons.
- Implementing this goal requires enemy collision logic.
