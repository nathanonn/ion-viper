import Phaser from 'phaser';
import { ASSET_KEYS, BOSS, GAME_WIDTH } from '../configs/constants';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  private health: number = BOSS.MAX_HEALTH;
  private maxHealth: number = BOSS.MAX_HEALTH;
  private phase: 1 | 2 | 3 = 1;
  private movementElapsedMs = 0;

  constructor(scene: Phaser.Scene, x: number = BOSS.START_X, y: number = BOSS.START_Y) {
    super(scene, x, y, ASSET_KEYS.IMAGES.ENEMY_DRONE);

    this.setOrigin(0.5);
    this.setDisplaySize(BOSS.WIDTH, BOSS.HEIGHT);
    this.setDepth(5);
  }

  spawn(): void {
    this.health = BOSS.MAX_HEALTH;
    this.maxHealth = BOSS.MAX_HEALTH;
    this.phase = 1;
    this.movementElapsedMs = 0;
    this.setActive(true);
    this.setVisible(true);
    this.setAlpha(1);
    this.setPhase(1);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(BOSS.WIDTH, BOSS.HEIGHT);
    body.reset(BOSS.START_X, BOSS.START_Y);
    body.setVelocity(0, 0);
  }

  damage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  setPhase(phase: 1 | 2 | 3): void {
    this.phase = phase;
    this.setTint(BOSS.PHASES[phase].TINT);
  }

  updateMovement(delta: number): void {
    if (!this.active) {
      return;
    }

    this.movementElapsedMs += delta;
    const phaseConfig = BOSS.PHASES[this.phase];
    const centerX = BOSS.START_X;
    const targetX =
      centerX + Math.sin(this.movementElapsedMs * phaseConfig.MOVE_SPEED) * BOSS.MOVE_RANGE_X;
    const clampedX = Phaser.Math.Clamp(targetX, BOSS.WIDTH / 2, GAME_WIDTH - BOSS.WIDTH / 2);
    const body = this.body as Phaser.Physics.Arcade.Body;

    body.reset(clampedX, BOSS.START_Y);
    body.setVelocity(0, 0);
  }

  recycle(): void {
    const body = this.body as Phaser.Physics.Arcade.Body | null;

    if (body) {
      body.stop();
      body.enable = false;
    }

    this.setActive(false);
    this.setVisible(false);
    this.clearTint();
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getPhase(): number {
    return this.phase;
  }

  isDefeated(): boolean {
    return this.health <= 0;
  }
}
