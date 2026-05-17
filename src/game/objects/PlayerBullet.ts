import Phaser from 'phaser';
import { COLORS, PLAYER_BULLET } from '../configs/constants';

const PLAYER_BULLET_TEXTURE = 'player-bullet-placeholder';

export class PlayerBullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
    PlayerBullet.createPlaceholderTexture(scene);
    super(scene, x, y, PLAYER_BULLET_TEXTURE);

    this.setOrigin(0.5);
    this.setDisplaySize(PLAYER_BULLET.WIDTH, PLAYER_BULLET.HEIGHT);
  }

  static createPlaceholderTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(PLAYER_BULLET_TEXTURE)) {
      return;
    }

    const graphics = scene.add.graphics();
    graphics.fillStyle(COLORS.BULLET, 1);
    graphics.fillRect(0, 0, PLAYER_BULLET.WIDTH, PLAYER_BULLET.HEIGHT);
    graphics.generateTexture(PLAYER_BULLET_TEXTURE, PLAYER_BULLET.WIDTH, PLAYER_BULLET.HEIGHT);
    graphics.destroy();
  }

  fire(x: number, y: number): void {
    this.setActive(true);
    this.setVisible(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);
    body.setSize(PLAYER_BULLET.WIDTH, PLAYER_BULLET.HEIGHT);
    body.reset(x, y);
    body.setVelocity(0, -PLAYER_BULLET.SPEED);
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
