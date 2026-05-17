import Phaser from 'phaser';
import { PLAYER_BULLET, PLAYER_SHIP, PLAYER_WEAPON } from '../configs/constants';
import { PlayerBullet } from '../objects/PlayerBullet';
import type { PlayerShip } from '../objects/PlayerShip';

export class PlayerWeapon {
  private readonly bullets: Phaser.Physics.Arcade.Group;
  private nextFireAt = 0;

  constructor(private readonly scene: Phaser.Scene, private readonly player: PlayerShip) {
    PlayerBullet.createPlaceholderTexture(scene);

    this.bullets = scene.physics.add.group({
      classType: PlayerBullet,
      maxSize: PLAYER_WEAPON.MAX_BULLETS,
      runChildUpdate: true,
    });
  }

  tryFire(time: number): boolean {
    if (time < this.nextFireAt || !this.player.isAlive()) {
      return false;
    }

    const bullet = this.bullets.get() as PlayerBullet | null;

    if (!bullet) {
      return false;
    }

    const position = this.player.getPosition();
    bullet.fire(position.x, position.y - PLAYER_SHIP.HEIGHT / 2 - PLAYER_BULLET.HEIGHT / 2);
    this.nextFireAt = time + PLAYER_WEAPON.FIRE_INTERVAL_MS;
    return true;
  }

  update(time: number, isFiring: boolean): void {
    if (isFiring) {
      this.tryFire(time);
    }
  }

  getActiveCount(): number {
    return this.bullets.countActive(true);
  }
}
