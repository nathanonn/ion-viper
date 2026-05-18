import Phaser from 'phaser';
import { ASSET_KEYS, PLAYER_BULLET, PLAYER_SHIP, PLAYER_WEAPON } from '../configs/constants';
import { PlayerBullet } from '../objects/PlayerBullet';
import type { PlayerShip } from '../objects/PlayerShip';

export class PlayerWeapon {
  private readonly bullets: Phaser.Physics.Arcade.Group;
  private nextFireAt = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: PlayerShip,
    private readonly getProjectileCount: () => number = () => 1
  ) {
    this.bullets = scene.physics.add.group({
      classType: PlayerBullet,
      maxSize: PLAYER_WEAPON.MAX_BULLETS,
      runChildUpdate: true,
    });
    this.prewarmBullets();
  }

  tryFire(time: number, fireIntervalMs: number = PLAYER_WEAPON.FIRE_INTERVAL_MS): boolean {
    if (time < this.nextFireAt || !this.player.isAlive()) {
      return false;
    }

    const position = this.player.getPosition();
    const projectileCount = this.getProjectileCount();
    const firedCount =
      projectileCount > 1
        ? this.fireIonBlastPattern(position.x, position.y)
        : this.fireBullet(position.x, position.y, 0, 0);

    if (firedCount === 0) {
      return false;
    }

    this.nextFireAt = time + fireIntervalMs;
    return true;
  }

  update(time: number, isFiring: boolean): boolean {
    if (isFiring) {
      return this.tryFire(time);
    }

    return false;
  }

  getActiveCount(): number {
    return this.bullets.countActive(true);
  }

  getGroup(): Phaser.Physics.Arcade.Group {
    return this.bullets;
  }

  private fireIonBlastPattern(playerX: number, playerY: number): number {
    const pattern = [
      { offsetX: -12, offsetY: 4, velocityX: -70 },
      { offsetX: 0, offsetY: 0, velocityX: 0 },
      { offsetX: 12, offsetY: 4, velocityX: 70 },
    ];

    let firedCount = 0;
    for (const shot of pattern) {
      firedCount += this.fireBullet(playerX, playerY, shot.offsetX, shot.velocityX, shot.offsetY);
    }

    return firedCount;
  }

  private fireBullet(
    playerX: number,
    playerY: number,
    offsetX: number,
    velocityX: number,
    offsetY: number = 0
  ): number {
    const bullet = this.bullets.getFirstDead(false) as PlayerBullet | null;

    if (!bullet) {
      return 0;
    }

    bullet.fire(
      playerX + offsetX,
      playerY - PLAYER_SHIP.HEIGHT / 2 - PLAYER_BULLET.HEIGHT / 2 + offsetY,
      velocityX
    );
    return 1;
  }

  private prewarmBullets(): void {
    for (let i = 0; i < PLAYER_WEAPON.MAX_BULLETS; i += 1) {
      const bullet = this.bullets.create(0, 0, ASSET_KEYS.IMAGES.PLAYER_BULLET) as
        | PlayerBullet
        | null;
      bullet?.recycle();
    }
  }
}
