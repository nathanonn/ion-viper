import Phaser from 'phaser';
import { COLORS, ENEMY, GAME_HEIGHT } from '../configs/constants';

const ENEMY_PLACEHOLDER_TEXTURE = 'enemy-placeholder';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private offscreenRecycleCallback?: () => void;

  constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
    Enemy.createPlaceholderTexture(scene);
    super(scene, x, y, ENEMY_PLACEHOLDER_TEXTURE);

    this.setOrigin(0.5);
    this.setDisplaySize(ENEMY.WIDTH, ENEMY.HEIGHT);
  }

  static createPlaceholderTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(ENEMY_PLACEHOLDER_TEXTURE)) {
      return;
    }

    const graphics = scene.add.graphics();
    graphics.fillStyle(COLORS.ENEMY, 1);
    graphics.fillTriangle(
      ENEMY.WIDTH / 2,
      0,
      ENEMY.WIDTH - 1,
      ENEMY.HEIGHT / 2,
      ENEMY.WIDTH / 2,
      ENEMY.HEIGHT - 1
    );
    graphics.fillTriangle(ENEMY.WIDTH / 2, 0, 0, ENEMY.HEIGHT / 2, ENEMY.WIDTH / 2, ENEMY.HEIGHT - 1);
    graphics.fillStyle(COLORS.ACCENT, 1);
    graphics.fillRect(ENEMY.WIDTH / 2 - 3, ENEMY.HEIGHT / 2 - 3, 6, 6);
    graphics.generateTexture(ENEMY_PLACEHOLDER_TEXTURE, ENEMY.WIDTH, ENEMY.HEIGHT);
    graphics.destroy();
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

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.active && this.y - ENEMY.HEIGHT / 2 > GAME_HEIGHT) {
      this.offscreenRecycleCallback?.();
      this.recycle();
    }
  }
}
