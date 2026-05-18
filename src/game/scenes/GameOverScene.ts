import Phaser from 'phaser';
import { ASSET_KEYS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../configs/constants';

export class GameOverScene extends Phaser.Scene {
  private finalScore = 0;
  private difficultyLoop = 1;

  constructor() {
    super({ key: SCENE_KEYS.GAME_OVER });
  }

  init(data: { score?: number; difficultyLoop?: number }): void {
    this.finalScore = data.score ?? this.registry.get('score') ?? 0;
    this.difficultyLoop = data.difficultyLoop ?? this.registry.get('difficulty')?.loop ?? 1;
  }

  create(): void {
    this.scene.stop(SCENE_KEYS.HUD);
    this.registry.set('gameOver', true);
    this.registry.set('gameWon', false);
    this.registry.set('victoryVisible', false);
    this.registry.set('playerAlive', false);
    this.registry.set('playerBullets', { activeCount: 0 });
    this.registry.set('enemyProjectiles', { activeCount: 0 });
    this.registry.set('enemies', {
      activeCount: 0,
      totalDestroyed: this.registry.get('enemies')?.totalDestroyed ?? 0,
      totalSpawned: this.registry.get('enemies')?.totalSpawned ?? 0,
      totalRecycled: this.registry.get('enemies')?.totalRecycled ?? 0,
      lastSpawnX: this.registry.get('enemies')?.lastSpawnX ?? 0,
      previousSpawnX: this.registry.get('enemies')?.previousSpawnX ?? 0,
      samplePosition: { x: 0, y: 0 },
    });
    this.registry.set('enemyTypes', {
      activeBasic: 0,
      activeShooter: 0,
      activeCharger: 0,
      lastSpawnedType: this.registry.get('enemyTypes')?.lastSpawnedType ?? 'none',
    });
    this.registry.set('ionBlast', {
      active: false,
      remainingMs: 0,
      collectedCount: 0,
      projectileCount: 1,
      pickupActive: false,
      pickupPosition: { x: 0, y: 0 },
      poolActiveCount: 0,
      totalSpawned: this.registry.get('ionBlast')?.totalSpawned ?? 0,
      totalRecycled: this.registry.get('ionBlast')?.totalRecycled ?? 0,
      maxPickups: this.registry.get('ionBlast')?.maxPickups ?? 0,
    });
    this.registry.set('boss', {
      active: false,
      health: 0,
      maxHealth: 0,
      phase: 1,
      defeated: false,
    });
    this.sound.stopByKey(ASSET_KEYS.AUDIO.MUSIC);

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEYS.IMAGES.SPACE_BACKGROUND);
    this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, ASSET_KEYS.IMAGES.STAR_PARALLAX)
      .setOrigin(0)
      .setAlpha(0.45);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'GAME OVER', {
        fontSize: '48px',
        color: '#ff0000',
        fontFamily: 'monospace',
        stroke: '#220000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `Score: ${this.finalScore}`, {
        fontSize: '28px',
        color: '#ffffff',
        fontFamily: 'monospace',
        stroke: '#00111f',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 + 60,
        `Press SPACE to retry loop ${this.difficultyLoop}`,
        {
          fontSize: '20px',
          color: '#aaaaaa',
          fontFamily: 'monospace',
        }
      )
      .setOrigin(0.5);

    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.once('down', () => {
      this.scene.start(SCENE_KEYS.GAME, { difficultyLoop: this.difficultyLoop });
    });
  }
}
