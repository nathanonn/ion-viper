import Phaser from 'phaser';
import { PLAYER_SHIP, SCENE_KEYS } from '../configs/constants';
import { Enemy } from '../objects/Enemy';
import { PlayerBullet } from '../objects/PlayerBullet';
import { PlayerShip, type PlayerMovementInput } from '../objects/PlayerShip';
import { EnemySpawner } from '../systems/EnemySpawner';
import { PlayerWeapon } from '../systems/PlayerWeapon';

export class GameScene extends Phaser.Scene {
  private player!: PlayerShip;
  private playerWeapon!: PlayerWeapon;
  private enemySpawner!: EnemySpawner;
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
    this.registry.set('playerAlive', true);
    this.registry.set('playerPosition', {
      x: PLAYER_SHIP.START_X,
      y: PLAYER_SHIP.START_Y,
    });
    this.registry.set('playerBullets', { activeCount: 0 });
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
    this.registry.set('score', 0);
    this.registry.set('gameOver', false);

    this.player = new PlayerShip(this, PLAYER_SHIP.START_X, PLAYER_SHIP.START_Y);
    this.playerWeapon = new PlayerWeapon(this, this.player);
    this.enemySpawner = new EnemySpawner(this);
    this.physics.add.overlap(
      this.playerWeapon.getGroup(),
      this.enemySpawner.getGroup(),
      this.handleBulletEnemyOverlap,
      undefined,
      this
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
  }

  update(_time: number, delta: number): void {
    const input: PlayerMovementInput = {
      left: this.cursors.left.isDown || this.wasdKeys.A.isDown,
      right: this.cursors.right.isDown || this.wasdKeys.D.isDown,
      up: this.cursors.up.isDown || this.wasdKeys.W.isDown,
      down: this.cursors.down.isDown || this.wasdKeys.S.isDown,
    };

    this.player.moveFromInput(input, delta);
    this.playerWeapon.update(_time, this.spaceKey.isDown);
    this.enemySpawner.update(delta);
    this.publishPlayerState();
    this.publishEnemyState();
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
    this.enemySpawner.destroyEnemy(enemy);
    this.publishPlayerState();
    this.publishEnemyState();
  }
}
