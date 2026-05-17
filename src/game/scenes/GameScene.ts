import Phaser from 'phaser';
import {
  ASSET_KEYS,
  GAME_HEIGHT,
  GAME_WIDTH,
  PLAYER_COMBAT,
  PLAYER_SHIP,
  POLISH,
  SCENE_KEYS,
} from '../configs/constants';
import { WAVE_CONFIGS } from '../data/waves';
import { Enemy } from '../objects/Enemy';
import { PlayerBullet } from '../objects/PlayerBullet';
import { PlayerShip, type PlayerMovementInput } from '../objects/PlayerShip';
import { CombatSystem } from '../systems/CombatSystem';
import { EnemySpawner } from '../systems/EnemySpawner';
import { FeedbackSystem } from '../systems/FeedbackSystem';
import { PlayerWeapon } from '../systems/PlayerWeapon';
import { PowerUpSystem } from '../systems/PowerUpSystem';
import { WaveSystem } from '../systems/WaveSystem';

export class GameScene extends Phaser.Scene {
  private player!: PlayerShip;
  private playerWeapon!: PlayerWeapon;
  private enemySpawner!: EnemySpawner;
  private combatSystem!: CombatSystem;
  private waveSystem!: WaveSystem;
  private feedbackSystem!: FeedbackSystem;
  private powerUpSystem!: PowerUpSystem;
  private background!: Phaser.GameObjects.Image;
  private starParallax!: Phaser.GameObjects.TileSprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  init(): void {
    this.registry.set('score', 0);
    this.registry.set('playerHealth', PLAYER_COMBAT.STARTING_HEALTH);
    this.registry.set('gameOver', false);
    this.registry.set('gameWon', false);
    this.registry.set('currentWave', 1);
    this.registry.set('waveCount', WAVE_CONFIGS.length);
    this.registry.set('playerAlive', true);
    this.registry.set('playerPosition', {
      x: PLAYER_SHIP.START_X,
      y: PLAYER_SHIP.START_Y,
    });
    this.registry.set('playerBullets', { activeCount: 0 });
    this.registry.set('ionBlast', {
      active: false,
      remainingMs: 0,
      collectedCount: 0,
      projectileCount: 1,
      pickupActive: false,
      pickupPosition: { x: 0, y: 0 },
      poolActiveCount: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      maxPickups: 0,
    });
    this.registry.set('enemies', {
      activeCount: 0,
      totalDestroyed: 0,
      totalSpawned: 0,
      totalRecycled: 0,
      lastSpawnX: 0,
      previousSpawnX: 0,
      samplePosition: { x: 0, y: 0 },
    });
  }

  create(): void {
    this.background = this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEYS.IMAGES.SPACE_BACKGROUND)
      .setDepth(-20);
    this.starParallax = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, ASSET_KEYS.IMAGES.STAR_PARALLAX)
      .setOrigin(0)
      .setDepth(-10)
      .setAlpha(0.72);

    this.feedbackSystem = new FeedbackSystem(this);
    this.feedbackSystem.create();
    this.feedbackSystem.startMusic();

    this.player = new PlayerShip(this, PLAYER_SHIP.START_X, PLAYER_SHIP.START_Y);
    this.powerUpSystem = new PowerUpSystem(this);
    this.powerUpSystem.start();
    this.playerWeapon = new PlayerWeapon(this, this.player, () =>
      this.powerUpSystem.getProjectileCount()
    );
    this.enemySpawner = new EnemySpawner(this);
    this.waveSystem = new WaveSystem(WAVE_CONFIGS, (wave) => {
      const enemy = this.enemySpawner.spawnEnemy({
        speed: wave.enemySpeed,
        scoreValue: wave.scoreValue,
        onCleared: () => {
          this.waveSystem.onEnemyCleared();
          this.publishWaveState();
          this.publishEnemyState();
        },
      });

      return enemy !== null;
    });
    this.waveSystem.start();
    this.combatSystem = new CombatSystem(this, this.player, (score) => {
      this.scene.start(SCENE_KEYS.GAME_OVER, { score });
    });
    this.physics.add.overlap(
      this.playerWeapon.getGroup(),
      this.enemySpawner.getGroup(),
      this.handleBulletEnemyOverlap,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.enemySpawner.getGroup(),
      this.handlePlayerEnemyOverlap,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.powerUpSystem.getGroup(),
      this.powerUpSystem.handlePlayerOverlap,
      undefined,
      this.powerUpSystem
    );
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.reset();
    this.wasdKeys = this.input.keyboard!.addKeys('W,A,S,D') as {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    };

    this.publishPlayerState();
    this.publishIonBlastState();
    this.publishWaveState();
    this.scene.launch(SCENE_KEYS.HUD);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.feedbackSystem.stopMusic();
    });
  }

  update(_time: number, delta: number): void {
    this.starParallax.tilePositionY -= POLISH.STAR_SCROLL_SPEED * (delta / 1000);
    this.combatSystem.updateInvulnerability(delta);

    if (this.combatSystem.isGameOver()) {
      this.publishPlayerState();
      this.publishEnemyState();
      return;
    }

    const input: PlayerMovementInput = {
      left: this.cursors.left.isDown || this.wasdKeys.A.isDown,
      right: this.cursors.right.isDown || this.wasdKeys.D.isDown,
      up: this.cursors.up.isDown || this.wasdKeys.W.isDown,
      down: this.cursors.down.isDown || this.wasdKeys.S.isDown,
    };

    this.player.moveFromInput(input, delta);
    this.powerUpSystem.update(delta);
    const didFire = this.playerWeapon.update(_time, this.spaceKey.isDown);
    if (didFire) {
      this.feedbackSystem.playerFired();
    }
    this.waveSystem.update(delta);
    this.publishPlayerState();
    this.publishEnemyState();
    this.publishIonBlastState();
    this.publishWaveState();
  }

  private publishPlayerState(): void {
    this.registry.set('playerPosition', this.player.getPosition());
    this.registry.set('playerAlive', this.player.isAlive());
    this.registry.set('playerBullets', {
      activeCount: this.playerWeapon.getActiveCount(),
    });
  }

  private publishEnemyState(): void {
    this.registry.set('enemies', this.enemySpawner.getState());
  }

  private publishWaveState(): void {
    const waveState = this.waveSystem.getState();
    this.registry.set('currentWave', waveState.currentWave);
    this.registry.set('waveCount', waveState.waveCount);
    this.registry.set('gameWon', waveState.gameWon);
  }

  private publishIonBlastState(): void {
    this.registry.set('ionBlast', this.powerUpSystem.getState());
  }

  private handleBulletEnemyOverlap(
    bulletObject:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile,
    enemyObject:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile
  ): void {
    const bullet = bulletObject as PlayerBullet;
    const enemy = enemyObject as Enemy;

    bullet.recycle();
    const impactX = enemy.x;
    const impactY = enemy.y;
    const didDestroy = this.enemySpawner.destroyEnemy(enemy);
    if (didDestroy) {
      this.feedbackSystem.enemyDestroyed(impactX, impactY);
      this.combatSystem.awardEnemyKill(enemy);
    }
    this.publishPlayerState();
    this.publishEnemyState();
    this.publishWaveState();
  }

  private handlePlayerEnemyOverlap(
    _playerObject:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile,
    _enemyObject:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile
  ): void {
    const didDamage = this.combatSystem.damagePlayer();
    if (didDamage) {
      this.feedbackSystem.playerDamaged(this.player.x, this.player.y);
    }
    this.publishPlayerState();
  }
}
