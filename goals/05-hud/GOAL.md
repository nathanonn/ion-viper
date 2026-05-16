# GOAL.md - HUD

## 1. Objective

Add a parallel HUD scene that displays score, player health, and wave information while GameScene continues to handle gameplay input.

By the end of this goal, the game should support:

- A HUDScene launched alongside GameScene.
- Real-time score and health display.
- A wave label ready for Goal 06.

## 2. Genre & Physics Config

- **Genre**: shoot-em-up (Raiden-type vertical shooter)
- **Physics system**: Arcade
- **Gravity**: `{ x: 0, y: 0 }`
- **World bounds**: 800 x 600, HUD overlays the same canvas

No changes to physics config in this goal.

## 3. Scope

### In scope

- Create HUDScene.
- Register HUDScene in the Phaser scene list.
- Launch HUDScene when GameScene starts.
- Display score, health, and wave placeholder text.
- Expose whether HUD is visible through the state bridge.

### Out of scope

- Actual wave progression.
- Final HUD art.
- Menus beyond the existing title and game-over screens.
- Pause screen.

### Do not touch

- Enemy wave system logic.
- Polish assets and audio.

## 4. Depends On

- `goals/00-foundation/` - scene flow.
- `goals/01-player-ship/` - gameplay scene.
- `goals/02-player-weapons/` - shooting.
- `goals/03-enemies/` - enemies.
- `goals/04-scoring-health/` - score and health values.

## 5. Allowed Files

/goal may create or modify:

- `src/game/main.ts`
- `src/game/configs/constants.ts` (add new scene key or HUD constants only)
- `src/game/scenes/GameScene.ts`
- `src/game/scenes/HUDScene.ts`
- `src/game/scenes/GameOverScene.ts` (stop HUD on game over only)
- `src/state-bridge.ts` (add new fields only - do not remove existing ones)
- `tests/game/hud.spec.ts`
- `goals/05-hud/PROGRESS.md`

/goal must not edit:

- Goal folders belonging to other goals.
- `package.json`.
- `index.html`.
- `vite.config.ts`.
- `AGENTS.md`.

## 6. Scene Architecture

### GameScene (modify)

- **`init()`**: Not used for HUD.
- **`preload()`**: Not used.
- **`create()`**: Launch HUDScene after gameplay state is initialized.
- **`update(dt)`**: Continue gameplay updates without HUD input handling.

### HUDScene (create)

- **`init()`**: Reset local text references.
- **`preload()`**: Not used.
- **`create()`**: Create score, health, and wave text in fixed screen positions.
- **`update(dt)`**: Read registry or state values and update text every frame.

### GameOverScene (modify)

- **`init()`**: Not used for HUD.
- **`preload()`**: Not used.
- **`create()`**: Stop or hide HUDScene before showing game over text.
- **`update(dt)`**: Not used.

## 7. Game Systems

Not applicable. This goal adds a scene that reads existing game state.

## 8. State Bridge Additions

New fields added by this goal:

- `hudVisible: boolean` - true while HUDScene is running or visible.

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
  hudVisible: boolean;
}
```

## 9. Acceptance Criteria

- [ ] AC-05.1 - HUDScene runs in parallel with GameScene.
- [ ] AC-05.2 - Score text updates in real time as score changes.
- [ ] AC-05.3 - Health display reflects current playerHealth.
- [ ] AC-05.4 - Wave number display is present and shows a placeholder before Goal 06.
- [ ] AC-05.5 - HUD elements do not interfere with gameplay input.

## 10. Asset Requirements

| Asset | Type | Size / Format | Source |
|-------|------|---------------|--------|
| HUD text | text | Phaser bitmap or text object | Hand-authored placeholder |

Placeholder OK - final art ships in Goal 07 Polish.

## 11. Definition of Done

The goal is complete only when:

- [ ] Every acceptance criterion (AC-05.*) is implemented.
- [ ] Every verification command in `goals/05-hud/VERIFY.md` passes or has a documented external blocker.
- [ ] All previous goals' tests still pass.
- [ ] New scene behavior has corresponding Playwright tests.
- [ ] State bridge fields are updated and report correct values.
- [ ] `goals/05-hud/PROGRESS.md` contains final evidence.
- [ ] /goal has performed a completion audit mapping each AC to evidence.

## 12. Completion Audit Checklist

Before marking the goal complete, /goal must update `goals/05-hud/PROGRESS.md` with this table:

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-05.1 | | |
| AC-05.2 | | |
| AC-05.3 | | |
| AC-05.4 | | |
| AC-05.5 | | |

## 13. Stop Conditions

/goal must stop and ask for human review if:

- HUDScene cannot run in parallel without changing the gameplay scene model.
- HUD display needs a full menu or pause system.
- HUD tests require brittle pixel assertions instead of state bridge checks.
- Prior goal tests fail for unrelated reasons.
- A new dependency is needed.
