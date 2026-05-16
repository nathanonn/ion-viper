# GOAL.md - Scoring and Health

## 1. Objective

Add scoring for enemy kills, player health, damage on enemy contact, invulnerability frames, and game-over transition when the player runs out of health.

By the end of this goal, the game should support:

- Score rewards for destroying enemies.
- Player damage and temporary invulnerability.
- GameOverScene when player health reaches zero.

## 2. Genre & Physics Config

- **Genre**: shoot-em-up (Raiden-type vertical shooter)
- **Physics system**: Arcade
- **Gravity**: `{ x: 0, y: 0 }`
- **World bounds**: 800 x 600, player clamped to bounds

No changes to physics config in this goal.

## 3. Scope

### In scope

- Add score value to enemies.
- Increase score when enemies are destroyed.
- Add player health.
- Add player-enemy collision damage.
- Add invulnerability frames and visible flashing.
- Transition to GameOverScene on death.

### Out of scope

- HUD rendering.
- Wave progression.
- Bosses, power-ups, armor, shields, or bombs.
- Final audio and art.

### Do not touch

- Wave system implementation.
- Polish-specific particles, shake, sound, or generated assets.

## 4. Depends On

- `goals/00-foundation/` - scaffold and scene flow.
- `goals/01-player-ship/` - player object and movement.
- `goals/02-player-weapons/` - bullet firing.
- `goals/03-enemies/` - enemy spawning and bullet collision.

## 5. Allowed Files

/goal may create or modify:

- `src/game/scenes/GameScene.ts`
- `src/game/scenes/GameOverScene.ts`
- `src/game/objects/PlayerShip.ts`
- `src/game/objects/Enemy.ts`
- `src/game/systems/EnemySpawner.ts`
- `src/game/systems/CombatSystem.ts`
- `src/game/configs/constants.ts` (add new constants only)
- `src/state-bridge.ts` (add new fields only - do not remove existing ones)
- `tests/game/scoring-health.spec.ts`
- `goals/04-scoring-health/PROGRESS.md`

/goal must not edit:

- Goal folders belonging to other goals.
- `package.json`.
- `index.html`.
- `vite.config.ts`.
- `AGENTS.md`.

## 6. Scene Architecture

### GameScene (modify)

- **`init()`**: Reset score, health, invulnerability timer, and game-over state.
- **`preload()`**: Not used.
- **`create()`**: Register player-enemy overlap, initialize score and health registry fields.
- **`update(dt)`**: Update invulnerability timer, flash player during invulnerability, and stop gameplay on game over.

### GameOverScene (verify or adjust)

- **`init()`**: Receive final score from GameScene.
- **`preload()`**: Not used.
- **`create()`**: Display final score and bind restart.
- **`update(dt)`**: Not used.

## 7. Game Systems

### CombatSystem

- **Purpose**: Centralize score awards, player damage, invulnerability, and death transition.
- **Pattern**: Scene-owned gameplay service.
- **Key methods**: `awardEnemyKill()`, `damagePlayer()`, `updateInvulnerability()`, `isInvulnerable()`.
- **Owns**: Score, health, invulnerability timer, and game-over trigger.

## 8. State Bridge Additions

New fields added by this goal:

- `playerHealth: number` - current player health.
- `score: number` - score from enemy kills, already present in base state and now actively updated.
- `gameOver: boolean` - true after player health reaches zero, already present in base state and now actively updated.

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
}
```

## 9. Acceptance Criteria

- [ ] AC-04.1 - Score increases by an enemy's score value when an enemy is destroyed.
- [ ] AC-04.2 - Player-enemy overlap reduces playerHealth by 1.
- [ ] AC-04.3 - During invulnerability, player sprite flashes and repeated damage is ignored.
- [ ] AC-04.4 - When playerHealth reaches 0, `gameOver` becomes true and GameOverScene is shown.
- [ ] AC-04.5 - State bridge reports `score`, `playerHealth`, and `gameOver`.

## 10. Asset Requirements

| Asset | Type | Size / Format | Source |
|-------|------|---------------|--------|
| damage flash | visual effect | alpha or tint tween | Hand-authored placeholder |

Placeholder OK - final art ships in Goal 07 Polish.

## 11. Definition of Done

The goal is complete only when:

- [ ] Every acceptance criterion (AC-04.*) is implemented.
- [ ] Every verification command in `goals/04-scoring-health/VERIFY.md` passes or has a documented external blocker.
- [ ] All previous goals' tests still pass.
- [ ] New game systems have corresponding Playwright tests.
- [ ] State bridge fields are updated and report correct values.
- [ ] `goals/04-scoring-health/PROGRESS.md` contains final evidence.
- [ ] /goal has performed a completion audit mapping each AC to evidence.

## 12. Completion Audit Checklist

Before marking the goal complete, /goal must update `goals/04-scoring-health/PROGRESS.md` with this table:

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-04.1 | | |
| AC-04.2 | | |
| AC-04.3 | | |
| AC-04.4 | | |
| AC-04.5 | | |

## 13. Stop Conditions

/goal must stop and ask for human review if:

- Damage tuning or starting health is ambiguous and cannot be inferred from constants.
- Game-over behavior requires a different flow than GameOverScene.
- Testing death requires brittle pixel or timing assumptions rather than state bridge hooks.
- Prior goal tests fail for unrelated reasons.
- A new dependency is needed.
