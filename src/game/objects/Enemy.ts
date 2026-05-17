import Phaser from 'phaser';
import { ASSET_KEYS, ENEMY, GAME_HEIGHT } from '../configs/constants';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private offscreenRecycleCallback?: () => void;
  readonly scoreValue = ENEMY.SCORE_VALUE;

  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
    super(scene, x, y, ASSET_KEYS.IMAGES.ENEMY_DRONE);

    this.setOrigin(0.5);
    this.setDisplaySize(ENEMY.WIDTH, ENEMY.HEIGHT);
  }

  spawn(x: number, y: number, speed: number, onOffscreenRecycle?: () => void): void {
    this.offscreenRecycleCallback = onOffscreenRecycle;
    this.setActive(true);
    this.setVisible(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);
    body.setSize(ENEMY.WIDTH, ENEMY.HEIGHT);
    body.reset(x, y);
    body.setVelocity(0, speed);
  }

  recycle(): void {
    const body = this.body as Phaser.Physics.Arcade.Body | null;

    if (body) {
      body.stop();
      body.enable = false;
    }

    this.offscreenRecycleCallback = undefined;
    this.setActive(false);
    this.setVisible(false);
  }

  getScoreValue(): number {
    return this.scoreValue;
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.active && this.y - ENEMY.HEIGHT / 2 > GAME_HEIGHT) {
      this.offscreenRecycleCallback?.();
      this.recycle();
    }
  }
}
