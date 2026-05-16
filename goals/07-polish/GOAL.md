# GOAL.md - Polish

## 1. Objective

Replace gameplay placeholders with coherent pixel art assets and add visual and audio feedback so the vertical shooter feels like a complete playable arcade slice.

By the end of this goal, the game should support:

- Pixel art player, bullets, enemies, and background assets.
- Particles, screen shake, and parallax motion for feedback.
- Sound effects and background music.

## 2. Genre & Physics Config

- **Genre**: shoot-em-up (Raiden-type vertical shooter)
- **Physics system**: Arcade
- **Gravity**: `{ x: 0, y: 0 }`
- **World bounds**: 800 x 600, gameplay bounds unchanged

No changes to physics config in this goal.

## 3. Scope

### In scope

- Generate or create final pixel art assets.
- Load and apply final player, enemy, bullet, background, and UI assets.
- Add particle effects for enemy destruction and player damage.
- Add camera shake on player damage.
- Add parallax or scrolling background.
- Add sound effects for firing, hits, enemy destruction, and player damage.
- Add background music during GameScene.

### Out of scope

- New mechanics.
- Power-ups.
- Boss fights.
- Online leaderboards.
- Deployment.
- Major UI redesign.

### Do not touch

- Core gameplay rules except where needed to attach visual or audio feedback.
- Existing state bridge field names or types.

## 4. Depends On

- `goals/00-foundation/` - scaffold.
- `goals/01-player-ship/` - player movement.
- `goals/02-player-weapons/` - player firing.
- `goals/03-enemies/` - enemy spawning and destruction.
- `goals/04-scoring-health/` - score, health, and game over.
- `goals/05-hud/` - HUD display.
- `goals/06-wave-system/` - wave progression and win state.

## 5. Allowed Files

/goal may create or modify:

- `public/assets/images/*`
- `public/assets/audio/*`
- `public/assets/data/*`
- `src/game/scenes/BootScene.ts`
- `src/game/scenes/MenuScene.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/scenes/HUDScene.ts`
- `src/game/scenes/GameOverScene.ts`
- `src/game/objects/PlayerShip.ts`
- `src/game/objects/PlayerBullet.ts`
- `src/game/objects/Enemy.ts`
- `src/game/systems/*`
- `src/game/configs/constants.ts` (add asset keys and polish tuning only)
- `tests/game/polish.spec.ts`
- `goals/07-polish/PROGRESS.md`

/goal must not edit:

- Goal folders belonging to other goals.
- `package.json` unless an asset-processing dependency is genuinely required and documented.
- `vite.config.ts`.
- `AGENTS.md`.
- Existing state bridge fields in a breaking way.

## 6. Scene Architecture

### BootScene (modify)

- **`init()`**: Not used.
- **`preload()`**: Load final image and audio assets with progress-safe asset keys.
- **`create()`**: Preserve registry defaults and transition to MenuScene.
- **`update(dt)`**: Not used.

### MenuScene (modify)

- **`init()`**: Not used.
- **`preload()`**: Not used.
- **`create()`**: Apply pixel art title presentation and background without turning the menu into a separate feature.
- **`update(dt)`**: Not used unless background animation requires it.

### GameScene (modify)

- **`init()`**: Reset polish state such as music handles or emitters if needed.
- **`preload()`**: Not used - assets should load in BootScene.
- **`create()`**: Apply final sprites, start music, create particles, and set up parallax background.
- **`update(dt)`**: Scroll background and keep existing gameplay updates intact.

### HUDScene (modify)

- **`init()`**: Not used.
- **`preload()`**: Not used.
- **`create()`**: Apply readable pixel-style HUD styling.
- **`update(dt)`**: Continue reading existing score, health, and wave values.

### GameOverScene (modify)

- **`init()`**: Preserve final score.
- **`preload()`**: Not used.
- **`create()`**: Stop or fade music and render polished game-over presentation.
- **`update(dt)`**: Not used unless background animation requires it.

## 7. Game Systems

### ArtAssetPipeline

- **Purpose**: Track generated asset keys, sizes, and transparency processing.
- **Pattern**: Static asset manifest or constants.
- **Key methods**: Not required if constants are enough.
- **Owns**: Asset key names and source notes.

### FeedbackSystem

- **Purpose**: Trigger particles, camera shake, and sounds from gameplay events.
- **Pattern**: Scene-owned service or focused helper functions.
- **Key methods**: `enemyDestroyed()`, `playerDamaged()`, `playerFired()`.
- **Owns**: Particle emitters, sound keys, and shake tuning.

## 8. State Bridge Additions

No new state bridge fields in this goal. Existing fields are sufficient.

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
  currentWave: number;
  waveCount: number;
  gameWon: boolean;
}
```

## 9. Acceptance Criteria

- [ ] AC-07.1 - Placeholder rectangles are replaced with generated pixel art assets.
- [ ] AC-07.2 - Particle effects trigger on enemy destruction and player damage.
- [ ] AC-07.3 - Camera shake and parallax background add feedback without disrupting play.
- [ ] AC-07.4 - Sound effects play for firing, hits, enemy explosions, and player damage.
- [ ] AC-07.5 - Background music plays during GameScene and stops or fades on game over.
- [ ] AC-07.6 - All previous gameplay and tests still pass.

## 10. Asset Requirements

| Asset | Type | Size / Format | Source |
|-------|------|---------------|--------|
| player ship | sprite | 32 x 32 PNG, alpha | `$imagegen`, magenta chromakey, 2x source |
| enemy drone | sprite | 28 x 28 PNG, alpha | `$imagegen`, magenta chromakey, 2x source |
| player bullet | sprite | 4 x 12 PNG, alpha | Hand-authored or `$imagegen` |
| explosion particle | sprite | 8 x 8 PNG, alpha | Hand-authored or `$imagegen` |
| scrolling space background | image | 800 x 600 or tileable PNG | `$imagegen` or hand-authored |
| fire sound | audio | WAV or OGG, under 1s | Generated or sourced locally |
| hit/explosion sound | audio | WAV or OGG, under 2s | Generated or sourced locally |
| player damage sound | audio | WAV or OGG, under 2s | Generated or sourced locally |
| gameplay music | audio | OGG or MP3 loop | Generated or sourced locally |

Use these `$imagegen` rules for sprites:

- Use solid magenta `#FF00FF` background for transparent sprites.
- Generate at 2x target resolution and downscale.
- Remove magenta with chromakey processing and save PNG with alpha.
- Keep style consistent: pixel art vertical arcade shooter, crisp 16-bit inspired sprites, readable silhouettes.

## 11. Definition of Done

The goal is complete only when:

- [ ] Every acceptance criterion (AC-07.*) is implemented.
- [ ] Every verification command in `goals/07-polish/VERIFY.md` passes or has a documented external blocker.
- [ ] All previous goals' tests still pass.
- [ ] New polish checks have corresponding Playwright tests or documented manual evidence.
- [ ] Existing state bridge fields still report correct values.
- [ ] `goals/07-polish/PROGRESS.md` contains final evidence.
- [ ] /goal has performed a completion audit mapping each AC to evidence.

## 12. Completion Audit Checklist

Before marking the goal complete, /goal must update `goals/07-polish/PROGRESS.md` with this table:

| Requirement | Evidence | Status |
|-------------|----------|--------|
| AC-07.1 | | |
| AC-07.2 | | |
| AC-07.3 | | |
| AC-07.4 | | |
| AC-07.5 | | |
| AC-07.6 | | |

## 13. Stop Conditions

/goal must stop and ask for human review if:

- Generated assets cannot be made readable at 800 x 600.
- Audio playback is blocked by browser policy beyond normal user-start behavior.
- Polish changes require altering gameplay mechanics or state bridge contracts.
- A new asset-processing dependency is required and cannot be justified.
- Prior goal tests fail for unrelated reasons.
