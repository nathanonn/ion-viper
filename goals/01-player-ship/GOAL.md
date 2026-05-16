# GOAL.md - Player Ship

## 1. Objective

Add the playable ship to GameScene, positioned near the bottom of the screen and controlled with WASD and arrow keys while staying inside the 800 x 600 playfield.

By the end of this goal, the game should support:

- A visible player ship placeholder at bottom-center.
- Horizontal and vertical movement with keyboard controls.
- State bridge reporting for player position and alive state.

## 2. Genre & Physics Config

- **Genre**: shoot-em-up (Raiden-type vertical shooter)
- **Physics system**: Arcade
- **Gravity**: `{ x: 0, y: 0 }`
- **World bounds**: 800 x 600, player clamped to bounds

No changes to physics config in this goal.

## 3. Scope

### In scope

- Create a player ship object or scene-managed sprite.
- Implement WASD and arrow-key movement.
- Clamp the player to the visible game bounds.
- Add player state bridge fields.

### Out of scope

- Shooting.
- Enemies.
- Health and damage.
- Final art assets.

### Do not touch

- HUD, wave, polish, or future goal folders.
- Enemy or bullet systems.

## 4. Depends On

- `goals/00-foundation/` - scaffold, boot tests, and state bridge must exist.

## 5. Allowed Files

/goal may create or modify:

- `src/game/scenes/GameScene.ts`
- `src/game/objects/PlayerShip.ts`
- `src/game/configs/constants.ts` (add new constants only)
- `src/state-bridge.ts` (add new fields only - do not remove existing ones)
- `tests/game/player-ship.spec.ts`
- `goals/01-player-ship/PROGRESS.md`

/goal must not edit:

- Goal folders belonging to other goals.
- `package.json`.
- `index.html`.
- `vite.config.ts`.
- `AGENTS.md`.

## 6. Scene Architecture

### GameScene (modify)

- **`init()`**: Reset player-alive state if it is stored on the scene.
- **`preload()`**: Not used - placeholder graphics can be generated in code.
- **`create()`**: Create the player ship at bottom-center, configure keyboard input, and register initial state.
- **`update(dt)`**: Read input, move the player with delta time, clamp to bounds, and update state bridge source values.

## 7. Game Systems

### PlayerShip

- **Purpose**: Encapsulate player placeholder sprite, movement speed, and bounds clamping.
- **Pattern**: Phaser Arcade sprite or container with an Arcade body.
- **Key methods**: `createPlaceholderTexture()`, `moveFromInput()`, `getPosition()`, `setAlive()`.
- **Owns**: Player sprite, movement tuning, and alive flag.

## 8. State Bridge Additions

New fields added by this goal:

- `playerPosition: { x: number; y: number }` - current player center position.
- `playerAlive: boolean` - whether the player is active and controllable.

Cumulative state bridge after this goal:

```typescript
interface GameState {
  scene: string;
  ready: boolean;
  score: number;
  gameOver: boolean;
  playerPosition: { x: number; y: number };
  playerAlive: boolean;
}
```

## 9. Acceptance Criteria

- [ ] AC-01.1 - Player sprite appears at bottom-center of the screen on GameScene start.
- [ ] AC-01.2 - Player x-position changes when A/D or LEFT/RIGHT keys are held.
- [ ] AC-01.3 - Player y-position changes when W/S or UP/DOWN keys are held.
- [ ] AC-01.4 - Player position is clamped to world bounds and cannot exit the screen.
- [ ] AC-01.5 - State bridge reports `playerPosition: { x, y }` and `playerAlive`.

## 10. Asset Requirements

| Asset | Type | Size / Format | Source |
|-------|------|---------------|--------|
| player placeholder | sprite | 32 x 32 generated texture | Placeholder rectangle or triangle |

Placeholder OK - final art ships in Goal 07 Polish.

## 11. Definition of Done

The goal is complete only when:

- [ ] Every acceptance criterion (AC-01.*) is implemented.
- [ ] Every verification command in `goals/01-player-ship/VERIFY.md` passes or has a documented external blocker.
- [ ] All previous goals' tests still pass.
- [ ] New game systems have corresponding Playwright tests.
- [ ] State bridge fields are updated and report correct values.
- [ ] `goals/01-player-ship/PROGRESS.md` contains final evidence.
- [ ] /goal has performed a completion audit mapping each AC to evidence.

## 12. Completion Audit Checklist

Before marking the goal complete, /goal must update `goals/01-player-ship/PROGRESS.md` with this table:

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-01.1 | | |
| AC-01.2 | | |
| AC-01.3 | | |
| AC-01.4 | | |
| AC-01.5 | | |

## 13. Stop Conditions

/goal must stop and ask for human review if:

- Player movement needs a control scheme beyond keyboard.
- Movement cannot be verified via the state bridge.
- Physics config must change outside this goal's scope.
- Tests from previous goals fail for unrelated reasons.
- A new npm dependency is needed.
