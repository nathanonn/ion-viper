import Phaser from 'phaser';
import {
  ASSET_KEYS,
  GAME_HEIGHT,
  GAME_WIDTH,
  PLAYER_COMBAT,
  PLAYER_WEAPON,
  PLAYER_SHIP,
  POLISH,
  SCENE_KEYS,
} from '../configs/constants';
import { WAVE_CONFIGS } from '../data/waves';
import { Boss } from '../objects/Boss';
import { Enemy } from '../objects/Enemy';
import { EnemyProjectile } from '../objects/EnemyProjectile';
import { PlayerBullet } from '../objects/PlayerBullet';
import { PlayerShip, type PlayerMovementInput } from '../objects/PlayerShip';
import { BossSystem } from '../systems/BossSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { DifficultySystem } from '../systems/DifficultySystem';
import { EnemyProjectileSystem } from '../systems/EnemyProjectileSystem';
import { EnemySpawner } from '../systems/EnemySpawner';
import { FeedbackSystem } from '../systems/FeedbackSystem';
import { PlayerWeapon } from '../systems/PlayerWeapon';
import { PowerUpSystem } from '../systems/PowerUpSystem';
import { WaveRandomizer } from '../systems/WaveRandomizer';
import { WaveSystem } from '../systems/WaveSystem';

interface GameSceneData {
  difficultyLoop?: number;
}

export class GameScene extends Phaser.Scene {
  private player!: PlayerShip;
  private playerWeapon!: PlayerWeapon;
  private enemySpawner!: EnemySpawner;
  private enemyProjectileSystem!: EnemyProjectileSystem;
  private combatSystem!: CombatSystem;
  private waveSystem!: WaveSystem;
  private bossSystem!: BossSystem;
  private difficultySystem!: DifficultySystem;
  private waveRandomizer!: WaveRandomizer;
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
  private fireInputArmed = false;

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  init(data: GameSceneData = {}): void {
    this.difficultySystem = DifficultySystem.fromLoop(data.difficultyLoop);
    this.registry.set('score', 0);
    this.registry.set('playerHealth', PLAYER_COMBAT.STARTING_HEALTH);
    this.registry.set('gameOver', false);
    this.registry.set('gameWon', false);
    this.registry.set('victoryVisible', false);
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
    this.registry.set('enemyProjectiles', { activeCount: 0 });
    this.registry.set('enemyTypes', {
      activeBasic: 0,
      activeShooter: 0,
      activeCharger: 0,
      lastSpawnedType: 'none',
    });
    this.registry.set('waveRandomization', {
      enabled: true,
      spawnCount: 0,
      uniqueSpawnLanes: 0,
      minimumRecentSpacing: 0,
      lastSpawnX: 0,
      previousSpawnX: 0,
    });
    this.registry.set('boss', {
      active: false,
      health: 0,
      maxHealth: 0,
      phase: 1,
      defeated: false,
    });
    this.publishDifficultyState();
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
    this.powerUpSystem = new PowerUpSystem(this, this.player);
    this.powerUpSystem.start();
    this.playerWeapon = new PlayerWeapon(this, this.player, () =>
      this.powerUpSystem.getProjectileCount()
    );
    this.waveRandomizer = new WaveRandomizer();
    this.enemySpawner = new EnemySpawner(this, this.waveRandomizer, this.difficultySystem);
    this.enemyProjectileSystem = new EnemyProjectileSystem(this, this.enemySpawner.getGroup());
    this.bossSystem = new BossSystem(
      this,
      this.enemyProjectileSystem,
      () => this.handleBossDefeated(),
      this.difficultySystem
    );
    this.waveSystem = new WaveSystem(
      WAVE_CONFIGS,
      ({ type }) => {
        const enemy = this.enemySpawner.spawnEnemy({
          type,
          getPlayerPosition: () => this.player.getPosition(),
          onCleared: () => {
            this.waveSystem.onEnemyCleared();
            if (this.enemySpawner.getActiveCount() === 0) {
              this.enemyProjectileSystem.recycleAll();
            }
            this.publishWaveState();
            this.publishEnemyState();
            this.publishRandomizationState();
            this.startBossIfRegularWavesComplete();
          },
        });

        return enemy !== null;
      },
      this.waveRandomizer
    );
    this.waveSystem.start();
    this.combatSystem = new CombatSystem(this, this.player, (score) => {
      this.scene.start(SCENE_KEYS.GAME_OVER, {
        score,
        difficultyLoop: this.difficultySystem.getLoop(),
      });
    });
    this.physics.add.overlap(
      this.playerWeapon.getGroup(),
      this.enemySpawner.getGroup(),
      this.handleBulletEnemyOverlap,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.bossSystem.getBoss(),
      this.playerWeapon.getGroup(),
      this.handleBulletBossOverlap,
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
      this.enemyProjectileSystem.getGroup(),
      this.handlePlayerEnemyProjectileOverlap,
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
    this.fireInputArmed = false;
    this.spaceKey.once('up', this.armFireInput, this);
    this.time.delayedCall(180, this.armFireInput, [], this);
    this.spaceKey.on('down', this.handleSpaceDown, this);
    this.wasdKeys = this.input.keyboard!.addKeys('W,A,S,D') as {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    };

    this.publishPlayerState();
    this.publishIonBlastState();
    this.publishWaveState();
    this.publishBossState();
    this.publishRandomizationState();
    this.publishDifficultyState();
    this.scene.launch(SCENE_KEYS.HUD);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.spaceKey.off('up', this.armFireInput, this);
      this.spaceKey.off('down', this.handleSpaceDown, this);
      this.feedbackSystem.stopMusic();
    });
  }

  update(_time: number, delta: number): void {
    this.starParallax.tilePositionY -= POLISH.STAR_SCROLL_SPEED * (delta / 1000);
    this.combatSystem.updateInvulnerability(delta);

    if (this.combatSystem.isGameOver()) {
      this.publishPlayerState();
      this.publishEnemyState();
      this.publishDifficultyState();
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
    const isFiring = this.isFireInputActive();
    const didFire = this.playerWeapon.update(_time, isFiring);
    if (didFire) {
      this.feedbackSystem.playerFired();
    }
    this.waveSystem.update(delta);
    this.startBossIfRegularWavesComplete();
    this.bossSystem.update(delta);
    this.enemyProjectileSystem.update(delta);
    this.publishPlayerState();
    this.publishEnemyState();
    this.publishIonBlastState();
    this.publishWaveState();
    this.publishBossState();
    this.publishRandomizationState();
    this.publishDifficultyState();
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
    this.registry.set('enemyTypes', this.enemySpawner.getTypeState());
    this.registry.set('enemyProjectiles', this.enemyProjectileSystem.getState());
  }

  private publishWaveState(): void {
    const waveState = this.waveSystem.getState();
    this.registry.set('currentWave', waveState.currentWave);
    this.registry.set('waveCount', waveState.waveCount);
    this.registry.set('gameWon', waveState.gameWon);
  }

  private publishBossState(): void {
    this.registry.set('boss', this.bossSystem.getState());
  }

  private publishRandomizationState(): void {
    this.registry.set('waveRandomization', this.waveRandomizer.getState());
  }

  private publishIonBlastState(): void {
    this.registry.set('ionBlast', this.powerUpSystem.getState());
  }

  private publishDifficultyState(): void {
    this.registry.set('difficulty', this.difficultySystem.getState());
  }

  private handleSpaceDown(): void {
    if (!this.fireInputArmed || this.combatSystem.isGameOver()) {
      return;
    }

    const didFire = this.playerWeapon.tryFire(
      this.time.now,
      PLAYER_WEAPON.FIRE_INTERVAL_MS * 2
    );
    if (didFire) {
      this.feedbackSystem.playerFired();
      this.publishPlayerState();
    }
  }

  private armFireInput(): void {
    this.fireInputArmed = true;
  }

  private isFireInputActive(): boolean {
    return this.fireInputArmed && this.spaceKey.isDown;
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
    enemy.damage(1);
    if (enemy.isDestroyed()) {
      const didDestroy = this.enemySpawner.destroyEnemy(enemy);
      if (!didDestroy) {
        return;
      }
      this.feedbackSystem.enemyDestroyed(impactX, impactY);
      this.combatSystem.awardEnemyKill(enemy);
    }
    this.publishPlayerState();
    this.publishEnemyState();
    this.publishWaveState();
  }

  private handleBulletBossOverlap(
    bossObject:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile,
    bulletObject:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile
  ): void {
    const boss = bossObject as Boss;
    const bullet = bulletObject as PlayerBullet;
    const impactX = boss.x;
    const impactY = boss.y;

    bullet.recycle();
    const didDamage = this.bossSystem.damageBoss(1);
    if (didDamage && this.bossSystem.isDefeated()) {
      this.feedbackSystem.enemyDestroyed(impactX, impactY);
    }

    this.publishPlayerState();
    this.publishBossState();
    this.publishWaveState();
  }

  private startBossIfRegularWavesComplete(): void {
    if (
      this.waveSystem.areRegularWavesComplete() &&
      !this.bossSystem.isActive() &&
      !this.bossSystem.isDefeated()
    ) {
      this.bossSystem.startBoss();
      this.publishBossState();
      this.publishWaveState();
    }
  }

  private handleBossDefeated(): void {
    this.waveSystem.markGameWon();
    this.registry.set('gameWon', true);
    this.publishBossState();
    this.publishWaveState();
    this.feedbackSystem.stopMusic();
    this.scene.start(SCENE_KEYS.VICTORY, {
      score: this.registry.get('score') ?? 0,
      difficultyLoop: this.difficultySystem.getLoop(),
    });
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

  private handlePlayerEnemyProjectileOverlap(
    _playerObject:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile,
    projectileObject:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile
  ): void {
    const projectile = projectileObject as EnemyProjectile;
    projectile.recycle();

    const didDamage = this.combatSystem.damagePlayer();
    if (didDamage) {
      this.feedbackSystem.playerDamaged(this.player.x, this.player.y);
    }
    this.publishPlayerState();
    this.publishEnemyState();
  }
}
