import Phaser from 'phaser';
import { ASSET_KEYS, ENEMY, GAME_HEIGHT, GAME_WIDTH } from '../configs/constants';
import type { EnemyBehaviorConfig, EnemyType, EnemyTypeConfig } from '../data/enemies';

interface EnemySpawnOptions {
  x: number;
  y: number;
  onOffscreenRecycle?: () => void;
  getPlayerPosition?: () => { x: number; y: number };
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private offscreenRecycleCallback?: () => void;
  private getPlayerPosition?: () => { x: number; y: number };
  private enemyType: EnemyType = 'basic';
  private health = 1;
  private maxHealth = 1;
  private scoreValue: number = ENEMY.SCORE_VALUE;
  private speed: number = ENEMY.SPEED;
  private behavior: EnemyBehaviorConfig = { kind: 'drift' };
  private attackElapsedMs = 0;
  private chargeElapsedMs = 0;
  private hasCharged = false;

  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
    super(scene, x, y, ASSET_KEYS.IMAGES.ENEMY_DRONE);

    this.setOrigin(0.5);
    this.setDisplaySize(ENEMY.WIDTH, ENEMY.HEIGHT);
  }

  spawn(config: EnemyTypeConfig, options: EnemySpawnOptions): void {
    this.enemyType = config.type;
    this.health = config.health;
    this.maxHealth = config.health;
    this.scoreValue = config.scoreValue;
    this.speed = config.speed;
    this.behavior = config.behavior;
    this.attackElapsedMs =
      config.behavior.kind === 'shooter' ? -config.behavior.firstShotDelayMs : 0;
    this.chargeElapsedMs = 0;
    this.hasCharged = false;
    this.offscreenRecycleCallback = options.onOffscreenRecycle;
    this.getPlayerPosition = options.getPlayerPosition;
    this.setActive(true);
    this.setVisible(true);
    this.setAlpha(1);
    this.setTint(config.tint);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);
    body.setSize(ENEMY.WIDTH, ENEMY.HEIGHT);
    body.reset(options.x, options.y);
    body.setVelocity(0, config.speed);
  }

  recycle(): void {
    const body = this.body as Phaser.Physics.Arcade.Body | null;

    if (body) {
      body.stop();
      body.enable = false;
    }

    this.offscreenRecycleCallback = undefined;
    this.getPlayerPosition = undefined;
    this.setAlpha(1);
    this.setActive(false);
    this.setVisible(false);
  }

  damage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  isDestroyed(): boolean {
    return this.health <= 0;
  }

  getType(): EnemyType {
    return this.enemyType;
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getScoreValue(): number {
    return this.scoreValue;
  }

  consumeShotReady(delta: number): boolean {
    if (!this.active || this.behavior.kind !== 'shooter') {
      return false;
    }

    this.attackElapsedMs += delta;
    if (this.attackElapsedMs < this.behavior.fireIntervalMs) {
      return false;
    }

    this.attackElapsedMs = 0;
    return true;
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (!this.active) {
      return;
    }

    this.updateMovement(delta);

    if (
      this.y - ENEMY.HEIGHT / 2 > GAME_HEIGHT ||
      this.x + ENEMY.WIDTH / 2 < -ENEMY.WIDTH ||
      this.x - ENEMY.WIDTH / 2 > GAME_WIDTH + ENEMY.WIDTH
    ) {
      this.offscreenRecycleCallback?.();
      this.recycle();
    }
  }

  private updateMovement(delta: number): void {
    if (this.behavior.kind !== 'charger' || this.hasCharged) {
      return;
    }

    this.chargeElapsedMs += delta;
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.chargeElapsedMs < this.behavior.chargeDelayMs) {
      body.setVelocity(0, this.speed * 0.35);
      this.setAlpha(this.chargeElapsedMs % 180 < 90 ? 0.62 : 1);
      return;
    }

    const target = this.getPlayerPosition?.() ?? { x: this.x, y: GAME_HEIGHT };
    const dx = target.x - this.x;
    const dy = Math.max(60, target.y - this.y);
    const length = Math.max(1, Math.hypot(dx, dy));

    body.setVelocity(
      (dx / length) * this.behavior.chargeSpeed,
      (dy / length) * this.behavior.chargeSpeed
    );
    this.setAlpha(1);
    this.hasCharged = true;
  }
}
