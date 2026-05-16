# raiden-shooter

## Stack

- **Engine**: Phaser 3.80+
- **Language**: TypeScript (strict)
- **Bundler**: Vite
- **Testing**: Playwright (browser-based, assertions via state bridge)
- **Genre**: shoot-em-up - Arcade Physics with zero gravity for vertical shooter movement
- **Resolution**: 800 x 600
- **Art style**: pixel art

## Commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` (localhost:8080) |
| Build | `npm run build` |
| Type check | `npx tsc --noEmit` |
| Test | `npm test` (Playwright) |

Always run type check and tests after completing a goal. Fix any failures before moving on.

## Project Structure

```text
src/
  main.ts              - Game entry point
  state-bridge.ts      - Exposes game state to window.__GAME_STATE__
  game/
    main.ts            - Phaser game config
    configs/           - Shared constants
    scenes/            - One file per scene
    objects/           - Game object classes (pooled entities, player, etc.)
    systems/           - Managers such as weapons, waves, and scoring
public/
  assets/
    images/            - Sprite sheets and individual sprites
    audio/             - Sound effects and music
    data/              - Wave definitions and tuning data
tests/
  playwright.config.ts - Playwright config with localhost:8080 web server
  game/
    helpers.ts         - Test utilities
    *.spec.ts          - Goal verification tests
goals/                 - Goal definitions (GOAL.md, VERIFY.md, PROGRESS.md)
```

## Goal Workflow

Complete one goal at a time in numerical order. For each goal:

1. Read the goal's `GOAL.md` for requirements.
2. Implement the feature.
3. Run `npx tsc --noEmit` and fix all type errors.
4. Run `npm test` and fix failures, including prior goals.
5. Update the goal's `PROGRESS.md` continuously.
6. Perform the completion audit before moving to the next goal.

Never skip ahead. Never break tests from previous goals.

## Phaser Domain Knowledge

### Scene Lifecycle

Every scene follows this sequence:

1. **`init(data?)`** - Called each time the scene starts or restarts. Reset all mutable state here. Receives optional data from `scene.start('Key', data)`.
2. **`preload()`** - Load assets. Only runs once per scene and uses the Phaser cache after the first load.
3. **`create()`** - Instantiate game objects, set up physics colliders, configure input handlers.
4. **`update(time, delta)`** - Game loop. Use `delta` in milliseconds for frame-rate independent movement.

### Critical State Initialization

Reset mutable state in `init()` or at the start of `create()`, never in a constructor. Scenes persist across restarts, so constructor-time state can leak between runs.

```typescript
// Wrong: score persists across scene restarts.
class GameScene extends Phaser.Scene {
  private score = 0;
}

// Correct: score resets whenever the scene starts.
class GameScene extends Phaser.Scene {
  private score!: number;

  init() {
    this.score = 0;
  }
}
```

### Object Pooling

For entities that spawn repeatedly, such as bullets, enemies, pickups, and particles, use a physics group as a pool:

```typescript
this.bullets = this.physics.add.group({
  classType: Bullet,
  maxSize: 30,
  runChildUpdate: true,
});

const bullet = this.bullets.get(x, y) as Bullet | null;
if (bullet) {
  bullet.fire(x, y);
}

bullet.setActive(false).setVisible(false);
bullet.body?.stop();
```

Never create recurring game objects in `update()`. Pool in `create()`, activate when needed, and deactivate when done.

### Cross-Scene Data

Use the scene registry for score, health, wave number, and other data that persists across scenes:

```typescript
this.registry.set('score', this.score);
const score = this.registry.get('score') as number;
```

### Delta Time

Movement must be frame-rate independent:

```typescript
update(_time: number, delta: number) {
  this.player.x += this.speed * (delta / 1000);
}
```

### Colliders

Set up colliders and overlaps in `create()`, not `update()`:

```typescript
this.physics.add.overlap(this.playerBullets, this.enemies, this.handleBulletEnemy, undefined, this);
```

## State Bridge Rules

All automated verification goes through `window.__GAME_STATE__`. Do not use screenshot pixel comparison for assertions.

1. **Fields accumulate across goals** - never remove existing fields.
2. **New fields** require updates in `src/state-bridge.ts` and corresponding Playwright tests.
3. **Keep fields flat and serializable** - booleans, numbers, strings, and simple object literals only.

### Test Pattern

```typescript
import { expect, test } from '@playwright/test';
import { getGameState, pressKey, waitForScene } from './helpers';

test('player moves right', async ({ page }) => {
  await page.goto('/');
  await waitForScene(page, 'GameScene');

  const before = await getGameState(page);
  await pressKey(page, 'ArrowRight', 500);
  const after = await getGameState(page);

  expect((after.playerPosition as { x: number }).x).toBeGreaterThan(
    (before.playerPosition as { x: number }).x
  );
});
```

## $imagegen Pipeline

Final art is generated only in Goal 07 Polish. Goals 00 through 06 use colored placeholder rectangles and simple generated shapes.

### Generation Rules

1. Use a solid magenta (`#FF00FF`) background for sprites that need transparency, then remove it with chromakey processing.
2. Generate at 2x target resolution and downscale for cleaner pixel art.
3. Use this project style prefix for all assets: `pixel art vertical arcade shooter, crisp 16-bit inspired sprites, readable silhouettes`.
4. Save generated images under `public/assets/images/`.

### Sprite Sheets

For animated sprites:

- Generate each frame as an individual image with identical dimensions.
- Combine frames into a horizontal sprite sheet.
- Keep frame dimensions documented where assets are loaded.

## Common Pitfalls

| # | Pitfall | Why it breaks | Fix |
|---|---------|---------------|-----|
| 1 | Creating objects in `update()` | Memory leak and frame drops | Pool objects in `create()` |
| 2 | Not using `delta` | Speed varies by refresh rate | Multiply movement by `delta / 1000` |
| 3 | State init in constructor | State survives restarts | Reset in `init()` or scene start |
| 4 | Using `destroy()` on pooled objects | Pool shrinks over time | Use inactive/invisible recycling |
| 5 | Missing `preserveDrawingBuffer` | Screenshots can be blank | Keep it enabled in render config |
| 6 | Removing state bridge fields | Prior tests break | Only add fields |
