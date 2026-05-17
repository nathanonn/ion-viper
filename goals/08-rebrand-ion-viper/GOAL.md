# GOAL.md - Rebrand to Ion Viper

## 1. Objective

Rename the game-facing identity from Raiden Shooter to Ion Viper while preserving the gameplay description as a Raiden-style vertical shooter. This is a metadata and presentation pass only: the existing gameplay loop must behave the same after the rename.

By the end of this goal, the game should support:

- Ion Viper as the visible game title.
- Package and browser metadata that no longer use Raiden Shooter as the game name.
- A state bridge identity field that tests can verify.
- Existing boot, menu, and gameplay behavior with no regression.

## 2. Genre & Physics Config

- **Genre**: shoot-em-up (Raiden-style vertical shooter)
- **Physics system**: Arcade
- **Gravity**: `{ x: 0, y: 0 }`
- **World bounds**: 800x600, player clamped to bounds

No changes to physics config in this goal.

## 3. Scope

### In scope

- Change displayed title text from `Raiden Shooter` to `Ion Viper`.
- Add or update descriptive metadata that includes `Raiden-style vertical shooter`.
- Update browser title and package metadata to Ion Viper / ion-viper.
- Add `gameIdentity` to the state bridge.
- Update tests that assert the old title.

### Out of scope

- Renaming the repository directory `/home/pi/Dev/raiden-shooter`.
- Changing gameplay mechanics, balance, controls, art, or audio.
- Adding the Ion Blast power-up.
- Adding boss fights, enemy types, or New Game Plus.

### Do not touch

- Existing goal folders `00` through `07`.
- Existing gameplay systems except where they read title or description constants.
- Vite, TypeScript, or Playwright config.

## 4. Depends On

All previous goals must be complete:

- `goals/07-polish/` - this goal rebrands the polished playable slice without changing gameplay.

## 5. Allowed Files

/goal may create or modify:

- `index.html`
- `package.json`
- `package-lock.json`
- `src/game/configs/constants.ts`
- `src/game/scenes/MenuScene.ts`
- `src/state-bridge.ts` (add new fields only - do not remove existing ones)
- `tests/game/boot.spec.ts`
- `tests/game/rebrand.spec.ts` (new)
- `goals/08-rebrand-ion-viper/PROGRESS.md`

/goal must not edit:

- Goal folders belonging to other goals.
- `src/game/systems/*.ts`
- `src/game/objects/*.ts`
- `vite.config.ts`
- `tsconfig.json`
- `AGENTS.md`

## 6. Scene Architecture

### MenuScene (modify)

- **`init()`**: Not used.
- **`preload()`**: Not used - assets loaded in BootScene.
- **`create()`**: Render `GAME_TITLE` as `Ion Viper`; optionally render a small description/subtitle using `GAME_DESCRIPTION` if it fits cleanly.
- **`update(dt)`**: Not used.

## 7. Game Systems

Not applicable. This goal updates identity constants, metadata, and state bridge reporting only.

## 8. State Bridge Additions

New fields added by this goal:

- `gameIdentity: { title: string; description: string }` - current game title and gameplay description.

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
}
```

## 9. Acceptance Criteria

- [ ] AC-08.1 - `GAME_TITLE`, MenuScene title text, browser title, and package metadata use `Ion Viper`.
- [ ] AC-08.2 - Game description metadata includes the exact phrase `Raiden-style vertical shooter`.
- [ ] AC-08.3 - State bridge reports `gameIdentity.title === 'Ion Viper'` and a non-empty description.
- [ ] AC-08.4 - Existing boot/menu/gameplay tests are updated for the new title and still pass.
- [ ] AC-08.5 - The repository directory is not renamed as part of this goal.

## 10. Asset Requirements

No new assets. Existing pixel art assets remain valid for Ion Viper.

| Asset | Type | Size / Format | Source |
|-------|------|---------------|--------|
| (none) | - | - | Existing assets only |

## 11. Definition of Done

The goal is complete only when:

- [ ] Every acceptance criterion (AC-08.*) is implemented.
- [ ] Every verification command in `goals/08-rebrand-ion-viper/VERIFY.md` passes or has a documented external blocker.
- [ ] All previous goals' tests still pass (run full test suite).
- [ ] State bridge fields are updated and report correct values.
- [ ] `goals/08-rebrand-ion-viper/PROGRESS.md` contains final evidence.
- [ ] /goal has performed a completion audit mapping each AC to evidence.

## 12. Completion Audit Checklist

Before marking the goal complete, /goal must update `goals/08-rebrand-ion-viper/PROGRESS.md` with this table:

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-08.1 | | |
| AC-08.2 | | |
| AC-08.3 | | |
| AC-08.4 | | |
| AC-08.5 | | |

## 13. Stop Conditions

/goal must stop and ask for human review if:

- The rebrand requires renaming the repository directory or moving project files.
- Updating package metadata would require dependency changes.
- Existing tests reveal unrelated gameplay regressions.
- State bridge additions would require removing or renaming existing fields.
