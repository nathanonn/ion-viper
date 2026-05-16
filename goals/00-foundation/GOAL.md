# GOAL.md - Foundation

## 1. Objective

Verify the Phaser 3 scaffold boots correctly for Raiden Shooter, confirm the menu-to-game flow, and make sure the state bridge is ready for later Playwright-driven verification.

By the end of this goal, the game should support:

- A boot sequence that reaches MenuScene without console errors.
- A visible `Raiden Shooter` title screen at 800 x 600.
- A SPACE key transition from MenuScene to GameScene.

## 2. Genre & Physics Config

- **Genre**: shoot-em-up (Raiden-type vertical shooter)
- **Physics system**: Arcade
- **Gravity**: `{ x: 0, y: 0 }`
- **World bounds**: 800 x 600, no wrapping, later goals clamp player to bounds

No changes to physics config in this goal unless the scaffold fails to boot.

## 3. Scope

### In scope

- Verify the Vite, Phaser, TypeScript, and Playwright scaffold.
- Confirm MenuScene renders the game title.
- Confirm state bridge exposes base fields.
- Adjust constants if the scaffold values are not game-specific.

### Out of scope

- Player movement.
- Bullets, enemies, scoring, health, HUD, wave logic, or polish.
- Final art or audio assets.

### Do not touch

- Future goal folders.
- Gameplay systems that are not needed for boot verification.

## 4. Depends On

None - this is the first goal.

## 5. Allowed Files

/goal may create or modify:

- `src/game/configs/constants.ts`
- `src/game/scenes/BootScene.ts`
- `src/game/scenes/MenuScene.ts`
- `src/game/scenes/GameScene.ts`
- `src/state-bridge.ts` (add base fields only - do not remove existing ones)
- `tests/game/boot.spec.ts`
- `tests/game/helpers.ts`
- `goals/00-foundation/PROGRESS.md`

/goal must not edit:

- Goal folders belonging to other goals.
- `package.json` unless the test command cannot run.
- `vite.config.ts` unless the dev server cannot start on port 8080.
- `AGENTS.md`.

## 6. Scene Architecture

### BootScene (verify or adjust)

- **`init()`**: Not used.
- **`preload()`**: Keep empty until real assets are introduced.
- **`create()`**: Initialize registry defaults and start MenuScene.
- **`update(dt)`**: Not used.

### MenuScene (verify or adjust)

- **`init()`**: Not used.
- **`preload()`**: Not used - assets are not required.
- **`create()`**: Render title and SPACE instruction, then bind SPACE to start GameScene.
- **`update(dt)`**: Not used.

### GameScene (verify only)

- **`init()`**: Not used.
- **`preload()`**: Not used.
- **`create()`**: Reset score and gameOver registry fields.
- **`update(dt)`**: Empty until Goal 01.

## 7. Game Systems

Not applicable. This goal verifies the scaffold and scene flow only.

## 8. State Bridge Additions

New fields established by this goal:

- `scene: string` - current active scene key.
- `ready: boolean` - true once at least one scene is active.

Cumulative state bridge after this goal:

```typescript
interface GameState {
  scene: string;
  ready: boolean;
  score: number;
  gameOver: boolean;
}
```

## 9. Acceptance Criteria

- [ ] AC-00.1 - Game canvas renders at 800 x 600 without console errors.
- [ ] AC-00.2 - MenuScene displays the title `Raiden Shooter`.
- [ ] AC-00.3 - Pressing SPACE transitions from MenuScene to GameScene.
- [ ] AC-00.4 - State bridge reports `{ scene: 'MenuScene', ready: true }` on boot.
- [ ] AC-00.5 - `constants.ts` contains game-specific values for dimensions, colors, and future extension points.

## 10. Asset Requirements

| Asset | Type | Size / Format | Source |
|-------|------|---------------|--------|
| None | Not applicable | Not applicable | Not applicable |

Placeholder OK - final art ships in Goal 07 Polish.

## 11. Definition of Done

The goal is complete only when:

- [ ] Every acceptance criterion (AC-00.*) is implemented.
- [ ] Every verification command in `goals/00-foundation/VERIFY.md` passes or has a documented external blocker.
- [ ] New or existing Playwright boot tests pass.
- [ ] State bridge fields report correct values.
- [ ] `goals/00-foundation/PROGRESS.md` contains final evidence.
- [ ] /goal has performed a completion audit mapping each AC to evidence.

## 12. Completion Audit Checklist

Before marking the goal complete, /goal must update `goals/00-foundation/PROGRESS.md` with this table:

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-00.1 | | |
| AC-00.2 | | |
| AC-00.3 | | |
| AC-00.4 | | |
| AC-00.5 | | |

## 13. Stop Conditions

/goal must stop and ask for human review if:

- The dev server cannot bind to localhost:8080.
- Phaser fails to create a canvas because of environment or browser issues.
- Boot verification requires changing project structure outside the Allowed Files list.
- A new npm dependency is needed.
- Existing scaffold files are missing or unexpectedly replaced.
