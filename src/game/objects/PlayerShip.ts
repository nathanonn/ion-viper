import Phaser from 'phaser';
import { ASSET_KEYS, GAME_HEIGHT, GAME_WIDTH, PLAYER_SHIP } from '../configs/constants';

export interface PlayerMovementInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export class PlayerShip extends Phaser.Physics.Arcade.Sprite {
  private alive = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ASSET_KEYS.IMAGES.PLAYER_SHIP);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5);
    this.setDisplaySize(PLAYER_SHIP.WIDTH, PLAYER_SHIP.HEIGHT);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(PLAYER_SHIP.WIDTH, PLAYER_SHIP.HEIGHT);
    body.setCollideWorldBounds(false);
  }

  moveFromInput(input: PlayerMovementInput, delta: number): void {
    if (!this.alive) {
      return;
    }

    let directionX = 0;
    let directionY = 0;

    if (input.left) {
      directionX -= 1;
    }
    if (input.right) {
      directionX += 1;
    }
    if (input.up) {
      directionY -= 1;
    }
    if (input.down) {
      directionY += 1;
    }

    if (directionX !== 0 || directionY !== 0) {
      const length = Math.hypot(directionX, directionY);
      const distance = PLAYER_SHIP.SPEED * (delta / 1000);
      this.x += (directionX / length) * distance;
      this.y += (directionY / length) * distance;
    }

    const halfWidth = PLAYER_SHIP.WIDTH / 2;
    const halfHeight = PLAYER_SHIP.HEIGHT / 2;
    this.x = Phaser.Math.Clamp(this.x, halfWidth, GAME_WIDTH - halfWidth);
    this.y = Phaser.Math.Clamp(this.y, halfHeight, GAME_HEIGHT - halfHeight);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.reset(this.x, this.y);
  }

  getPosition(): { x: number; y: number } {
    return {
      x: this.x,
      y: this.y,
    };
  }

  setAlive(isAlive: boolean): void {
    this.alive = isAlive;
    this.setActive(isAlive);
    this.setVisible(isAlive);
    this.setAlpha(1);
  }

  isAlive(): boolean {
    return this.alive;
  }

  setDamageFlash(isDimmed: boolean): void {
    if (!this.alive) {
      return;
    }

    this.setAlpha(isDimmed ? 0.35 : 1);
  }
}
