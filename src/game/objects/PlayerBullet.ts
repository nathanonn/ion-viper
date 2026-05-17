import Phaser from 'phaser';
import { ASSET_KEYS, PLAYER_BULLET } from '../configs/constants';

export class PlayerBullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
    super(scene, x, y, ASSET_KEYS.IMAGES.PLAYER_BULLET);

    this.setOrigin(0.5);
    this.setDisplaySize(PLAYER_BULLET.WIDTH, PLAYER_BULLET.HEIGHT);
  }

  fire(x: number, y: number, velocityX: number = 0): void {
    this.setActive(true);
    this.setVisible(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);
    body.setSize(PLAYER_BULLET.WIDTH, PLAYER_BULLET.HEIGHT);
    body.reset(x, y);
    body.setVelocity(velocityX, -PLAYER_BULLET.SPEED);
  }

  recycle(): void {
    const body = this.body as Phaser.Physics.Arcade.Body | null;

    if (body) {
      body.stop();
      body.enable = false;
    }

    this.setActive(false);
    this.setVisible(false);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.active && this.y + PLAYER_BULLET.HEIGHT / 2 < 0) {
      this.recycle();
    }
  }
}
