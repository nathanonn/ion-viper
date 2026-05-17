# Goals Plan - Ion Viper

## Game Metadata

- **Name**: Ion Viper
- **Slug**: raiden-shooter
- **Package name target**: ion-viper
- **Genre**: shoot-em-up (Raiden-style vertical shooter)
- **Description**: Ion Viper is a Raiden-style vertical shooter with arcade movement, pooled projectiles, enemy waves, power-ups, boss combat, and New Game Plus difficulty loops.
- **Resolution**: 800 x 600
- **Physics**: Arcade - zero gravity, player clamped to screen bounds
- **Art Style**: pixel art
- **Audio**: yes, existing audio from the polish goal plus optional additions in future polish passes

## Goal Sequence

Execute goals in order. Each goal depends on all previous goals being complete.

| #   | Folder                              | Name                   | Description                                                                                                      | Depends On |
| --- | ----------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------- |
| 00  | `goals/00-foundation/`              | Foundation             | Verify scaffold boots, customize constants, confirm state bridge and menu-to-game transition.                    | None       |
| 01  | `goals/01-player-ship/`             | Player Ship            | Add a player ship at the bottom-center of the screen with WASD and arrow-key movement clamped to bounds.         | 00         |
| 02  | `goals/02-player-weapons/`          | Player Weapons         | Add a single upward-firing weapon with pooled bullets and fire-rate limiting.                                    | 01         |
| 03  | `goals/03-enemies/`                 | Enemies                | Spawn enemies from the top, move them downward, and destroy them with player bullets.                            | 02         |
| 04  | `goals/04-scoring-health/`          | Scoring and Health     | Add score rewards, player health, collision damage, invulnerability frames, and game over.                       | 03         |
| 05  | `goals/05-hud/`                     | HUD                    | Add a parallel HUD scene for score, health, and wave information without blocking gameplay input.                | 04         |
| 06  | `goals/06-wave-system/`             | Wave System            | Replace endless enemy spawns with configured waves, difficulty escalation, and a win condition.                  | 05         |
| 07  | `goals/07-polish/`                  | Polish                 | Replace placeholders with pixel art, add particles, screen shake, parallax background, sound effects, and music. | 06         |
| 08  | `goals/08-rebrand-ion-viper/`       | Rebrand to Ion Viper   | Rename the game and metadata to Ion Viper while retaining "Raiden-style vertical shooter" as descriptive copy.   | 07         |
| 09  | `goals/09-ion-blast-power-up/`      | Ion Blast Power-Up     | Add a timed Ion Blast pickup that temporarily upgrades the player into a multi-projectile firing pattern.        | 08         |
| 10  | `goals/10-enemy-archetypes/`        | Enemy Archetypes       | Implement at least three enemy types: basic drifter, shooter, and charger, each with unique behavior.            | 09         |
| 11  | `goals/11-randomized-wave-system/`  | Randomized Waves       | Randomize balanced wave starting positions, timing, and spacing while preserving fair reaction windows.          | 10         |
| 12  | `goals/12-boss-fight/`              | Boss Fight             | Spawn a multi-phase boss after all waves, show a boss health bar, and transition to a victory screen on defeat.  | 11         |
| 13  | `goals/13-new-game-plus/`           | New Game Plus          | Let players restart after victory with higher enemy speed and health for repeated challenge loops.               | 12         |
| 14  | `goals/14-qc-checkpoint/`           | QC Checkpoint          | Validate the full Ion Viper loop, including rebrand, power-up, enemy variety, boss, victory, and restart loops.  | 13         |

## State Bridge Growth

Fields accumulate in `window.__GAME_STATE__`. Never remove existing fields.

| Goal | New Fields | Cumulative |
| ---- | ---------- | ---------- |
| 00 | `scene`, `ready` | scene, ready, score, gameOver |
| 01 | `playerPosition: { x, y }`, `playerAlive` | scene, ready, score, gameOver, playerPosition, playerAlive |
| 02 | `playerBullets: { activeCount }` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets |
| 03 | `enemies: { activeCount, totalDestroyed }` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies |
| 04 | `playerHealth` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies, playerHealth |
| 05 | `hudVisible` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies, playerHealth, hudVisible |
| 06 | `currentWave`, `waveCount`, `gameWon` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies, playerHealth, hudVisible, currentWave, waveCount, gameWon |
| 07 | no new fields | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies, playerHealth, hudVisible, currentWave, waveCount, gameWon |
| 08 | `gameIdentity: { title, description }` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies, playerHealth, hudVisible, currentWave, waveCount, gameWon, gameIdentity |
| 09 | `ionBlast: { active, remainingMs, collectedCount, projectileCount }` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies, playerHealth, hudVisible, currentWave, waveCount, gameWon, gameIdentity, ionBlast |
| 10 | `enemyProjectiles: { activeCount }`, `enemyTypes: { activeBasic, activeShooter, activeCharger, lastSpawnedType }` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies, playerHealth, hudVisible, currentWave, waveCount, gameWon, gameIdentity, ionBlast, enemyProjectiles, enemyTypes |
| 11 | `waveRandomization: { enabled, spawnCount, uniqueSpawnLanes, minimumRecentSpacing, lastSpawnX, previousSpawnX }` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies, playerHealth, hudVisible, currentWave, waveCount, gameWon, gameIdentity, ionBlast, enemyProjectiles, enemyTypes, waveRandomization |
| 12 | `boss: { active, health, maxHealth, phase, defeated }`, `victoryVisible` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies, playerHealth, hudVisible, currentWave, waveCount, gameWon, gameIdentity, ionBlast, enemyProjectiles, enemyTypes, waveRandomization, boss, victoryVisible |
| 13 | `difficulty: { loop, enemySpeedMultiplier, enemyHealthMultiplier, bossHealthMultiplier }` | scene, ready, score, gameOver, playerPosition, playerAlive, playerBullets, enemies, playerHealth, hudVisible, currentWave, waveCount, gameWon, gameIdentity, ionBlast, enemyProjectiles, enemyTypes, waveRandomization, boss, victoryVisible, difficulty |
| 14 | no new fields | all fields through Goal 13 |

## Key Acceptance Criteria Per Goal

### Goal 00 - Foundation

- AC-00.1: Game canvas renders at 800 x 600 without console errors.
- AC-00.2: MenuScene displays the original title text.
- AC-00.3: Pressing SPACE transitions from MenuScene to GameScene.
- AC-00.4: State bridge reports `{ scene: 'MenuScene', ready: true }` on boot.
- AC-00.5: `constants.ts` contains dimensions, colors, and placeholder extension points.

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

### Goal 08 - Rebrand to Ion Viper

- AC-08.1: MenuScene, browser title, package metadata, and game constants use `Ion Viper`.
- AC-08.2: The game description retains the phrase `Raiden-style vertical shooter`.
- AC-08.3: State bridge reports `gameIdentity.title === 'Ion Viper'`.
- AC-08.4: Existing boot, menu, and gameplay tests are updated without weakening behavior.
- AC-08.5: The repository directory is not renamed unless explicitly requested by the human.

### Goal 09 - Ion Blast Power-Up

- AC-09.1: Ion Blast pickups can spawn during gameplay and are pooled or otherwise recycled safely.
- AC-09.2: Collecting Ion Blast activates a timed multi-projectile firing mode.
- AC-09.3: Ion Blast expires automatically after its configured duration and returns to normal fire.
- AC-09.4: Existing bullet pooling remains bounded and no recurring objects are created in `update()`.
- AC-09.5: State bridge reports Ion Blast activity, remaining time, pickup count, and projectile count.

### Goal 10 - Enemy Archetypes

- AC-10.1: At least three enemy types exist: basic drifter, shooter, and charger.
- AC-10.2: Shooter enemies fire enemy projectiles from a bounded pool.
- AC-10.3: Charger enemies telegraph or delay briefly before accelerating toward the player.
- AC-10.4: Each enemy type has health, score, movement, and attack tuning in data/config.
- AC-10.5: State bridge reports active enemy type counts and enemy projectile activity.

### Goal 11 - Randomized Waves

- AC-11.1: Enemy wave spawn x-positions are randomized between runs instead of fixed cycling.
- AC-11.2: Randomization enforces fair spacing so consecutive spawns do not stack unfairly.
- AC-11.3: Wave timing and spacing are tuned for readable challenge after enemy archetypes are active.
- AC-11.4: Randomized waves still complete reliably and advance through all configured waves.
- AC-11.5: State bridge reports randomization metrics useful for Playwright assertions.

### Goal 12 - Boss Fight

- AC-12.1: A boss spawns only after all regular waves are cleared.
- AC-12.2: The boss has visible health, max health, and multiple attack phases.
- AC-12.3: Boss attacks are dodgeable and use pooled projectiles or existing attack systems.
- AC-12.4: Defeating the boss sets `gameWon` and transitions to a victory screen.
- AC-12.5: State bridge reports boss state and victory screen visibility.

### Goal 13 - New Game Plus

- AC-13.1: Victory screen offers a restart into the next difficulty loop.
- AC-13.2: Difficulty loop count increments after each boss clear.
- AC-13.3: Enemy speed and health increase in later loops.
- AC-13.4: Boss health or phase pressure increases in later loops.
- AC-13.5: Restart resets transient state while preserving the intended difficulty loop.

### Goal 14 - QC Checkpoint

- AC-14.1: Full win path works: boot -> menu -> play -> waves -> boss -> victory -> New Game Plus restart.
- AC-14.2: Full loss path works: boot -> menu -> play -> lose -> game over -> restart.
- AC-14.3: State bridge reports all fields correctly across scene transitions and restarts.
- AC-14.4: No console errors occur during a full play session.
- AC-14.5: Difficulty progression is playable and not blocked by unfair randomization.
- AC-14.6: All previous tests still pass.

## Out of Scope (entire project)

- Multiplayer or networking.
- Mobile-specific touch controls.
- Save/load game state to disk.
- Online leaderboards.
- Deployment or hosting.
- Procedural level generation beyond balanced wave spawn randomization.
- Additional enemy types beyond the initial three archetypes until a future extension.
- Additional power-up types beyond Ion Blast until a future extension.
- Additional bosses beyond the first boss until a future extension.

## How to Execute

For each goal in sequence:

```text
/goal Complete goals/08-rebrand-ion-viper/GOAL.md. Use goals/08-rebrand-ion-viper/VERIFY.md as the verification contract. Update goals/08-rebrand-ion-viper/PROGRESS.md continuously. Treat uncertainty as incomplete.
```

After each goal completes:

1. Run `npx tsc --noEmit` to confirm no type errors.
2. Run `npm test` to confirm all tests pass.
3. Review the diff before committing.
4. Move to the next goal.
