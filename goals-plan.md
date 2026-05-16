# Goals Plan - Raiden Shooter

## Game Metadata

- **Name**: Raiden Shooter
- **Slug**: raiden-shooter
- **Genre**: shoot-em-up (Raiden-type vertical shooter)
- **Resolution**: 800 x 600
- **Physics**: Arcade - zero gravity, player clamped to screen bounds
- **Art Style**: pixel art
- **Audio**: yes, in the polish goal

## Goal Sequence

Execute goals in order. Each goal depends on all previous goals being complete.

| # | Folder | Name | Description | Depends On |
|---|--------|------|-------------|------------|
| 00 | `goals/00-foundation/` | Foundation | Verify scaffold boots, customize constants, confirm state bridge and menu-to-game transition. | None |
| 01 | `goals/01-player-ship/` | Player Ship | Add a player ship at the bottom-center of the screen with WASD and arrow-key movement clamped to bounds. | 00 |
| 02 | `goals/02-player-weapons/` | Player Weapons | Add a single upward-firing weapon with pooled bullets and fire-rate limiting. | 01 |
| 03 | `goals/03-enemies/` | Enemies | Spawn enemies from the top, move them downward, and destroy them with player bullets. | 02 |
| 04 | `goals/04-scoring-health/` | Scoring and Health | Add score rewards, player health, collision damage, invulnerability frames, and game over. | 03 |
| 05 | `goals/05-hud/` | HUD | Add a parallel HUD scene for score, health, and wave information without blocking gameplay input. | 04 |
| 06 | `goals/06-wave-system/` | Wave System | Replace endless enemy spawns with configured waves, difficulty escalation, and a win condition. | 05 |
| 07 | `goals/07-polish/` | Polish | Replace placeholders with pixel art, add particles, screen shake, parallax background, sound effects, and music. | 06 |

## State Bridge Growth

Fields accumulate in `window.__GAME_STATE__`. Never remove existing fields.

| Goal | New Fields | Cumulative |
|------|------------|------------|
| 00 | `scene`, `ready` | scene, ready, score, gameOver |
| 01 | `playerPosition: { x, y }`, `playerAlive` | scene, ready, score, gameOver, playerPosition, playerAlive |
| 02 | `playerBullets: { activeCount }` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets |
| 03 | `enemies: { activeCount, totalDestroyed }` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies |
| 04 | `playerHealth` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies, playerHealth |
| 05 | `hudVisible` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies, playerHealth, hudVisible |
| 06 | `currentWave`, `waveCount`, `gameWon` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies, playerHealth, hudVisible, currentWave, waveCount, gameWon |
| 07 | no new fields | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies, playerHealth, hudVisible, currentWave, waveCount, gameWon |

## Key Acceptance Criteria Per Goal

### Goal 00 - Foundation

- AC-00.1: Game canvas renders at 800 x 600 without console errors.
- AC-00.2: MenuScene displays the title `Raiden Shooter`.
- AC-00.3: Pressing SPACE transitions from MenuScene to GameScene.
- AC-00.4: State bridge reports `{ scene: 'MenuScene', ready: true }` on boot.
- AC-00.5: `constants.ts` contains Raiden Shooter dimensions, colors, and placeholder extension points.

### Goal 01 - Player Ship

- AC-01.1: Player sprite appears at bottom-center of the screen on GameScene start.
- AC-01.2: Player x-position changes when A/D or LEFT/RIGHT keys are held.
- AC-01.3: Player y-position changes when W/S or UP/DOWN keys are held.
- AC-01.4: Player position is clamped to the 800 x 600 world bounds.
- AC-01.5: State bridge reports `playerPosition: { x, y }` and `playerAlive`.

### Goal 02 - Player Weapons

- AC-02.1: Pressing SPACE spawns a bullet at the player's position moving upward.
- AC-02.2: Bullets are managed by a Phaser Group with a max-size pool.
- AC-02.3: Holding SPACE respects the configured fire-rate interval.
- AC-02.4: Bullets recycle when they leave the top of the screen.
- AC-02.5: State bridge reports `playerBullets: { activeCount }`.

### Goal 03 - Enemies

- AC-03.1: Enemies spawn at varied x-positions along the top edge at a configured interval.
- AC-03.2: Enemies move downward at their configured speed.
- AC-03.3: Bullet-enemy overlap destroys the enemy and recycles the bullet.
- AC-03.4: Enemies recycle when they exit the bottom of the screen.
- AC-03.5: State bridge reports `enemies: { activeCount, totalDestroyed }`.

### Goal 04 - Scoring and Health

- AC-04.1: Score increases by enemy score value when an enemy is destroyed.
- AC-04.2: Player-enemy overlap reduces player health by 1.
- AC-04.3: Invulnerability frames prevent repeated immediate damage and visibly flash the player.
- AC-04.4: When player health reaches 0, `gameOver` becomes true and GameOverScene is shown.
- AC-04.5: State bridge reports `score`, `playerHealth`, and `gameOver`.

### Goal 05 - HUD

- AC-05.1: HUDScene runs in parallel with GameScene.
- AC-05.2: Score text updates in real time as score changes.
- AC-05.3: Health display reflects current player health.
- AC-05.4: Wave number display is present and shows a placeholder before Goal 06.
- AC-05.5: HUD elements do not interfere with gameplay input.

### Goal 06 - Wave System

- AC-06.1: Enemies spawn from WaveConfig with type, count, speed, score value, and delay.
- AC-06.2: Wave advances when all enemies in the current wave are destroyed or cleared.
- AC-06.3: Later waves are harder through higher count, faster enemies, or tighter delays.
- AC-06.4: Clearing the final wave sets `gameWon` to true and stops enemy spawning.
- AC-06.5: State bridge reports `currentWave`, `waveCount`, and `gameWon`.

### Goal 07 - Polish

- AC-07.1: Placeholder rectangles are replaced with generated pixel art assets.
- AC-07.2: Particle effects trigger on enemy destruction and player damage.
- AC-07.3: Camera shake and parallax background add feedback without disrupting play.
- AC-07.4: Sound effects play for firing, hits, enemy explosions, and player damage.
- AC-07.5: Background music plays during GameScene and stops or fades on game over.
- AC-07.6: All previous gameplay and tests still pass.

## Out of Scope (entire project)

- Power-ups and weapon upgrades.
- Boss fights.
- Multiplayer or networking.
- Mobile-specific touch controls.
- Save/load game state to disk.
- Online leaderboards.
- Deployment or hosting.
- Procedural generation beyond fixed wave configuration.

## How to Execute

For each goal in sequence:

```text
/goal Complete goals/00-foundation/GOAL.md. Use VERIFY.md as the verification contract. Update PROGRESS.md continuously. Treat uncertainty as incomplete.
```

After each goal completes:

1. Run `npm test` to confirm all tests pass.
2. Run `npx tsc --noEmit` to confirm no type errors.
3. Review the diff before committing.
4. Move to the next goal.
