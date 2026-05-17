import Phaser from 'phaser';
import { ASSET_KEYS, ENEMY_PROJECTILE, GAME_HEIGHT } from '../configs/constants';

export class EnemyProjectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
    super(scene, x, y, ASSET_KEYS.IMAGES.PLAYER_BULLET);

    this.setOrigin(0.5);
    this.setDisplaySize(ENEMY_PROJECTILE.WIDTH, ENEMY_PROJECTILE.HEIGHT);
    this.setTint(0xff4466);
  }

  fire(x: number, y: number, velocityY: number = ENEMY_PROJECTILE.SPEED): void {
    this.setActive(true);
    this.setVisible(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);
    body.setSize(ENEMY_PROJECTILE.WIDTH, ENEMY_PROJECTILE.HEIGHT);
    body.reset(x, y);
    body.setVelocity(0, velocityY);
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

    if (this.active && this.y - ENEMY_PROJECTILE.HEIGHT / 2 > GAME_HEIGHT) {
      this.recycle();
    }
  }
}
