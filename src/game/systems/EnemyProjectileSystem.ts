import Phaser from 'phaser';
import { ASSET_KEYS, BOSS, ENEMY, ENEMY_PROJECTILE } from '../configs/constants';
import { Enemy } from '../objects/Enemy';
import { EnemyProjectile } from '../objects/EnemyProjectile';

export interface EnemyProjectileState {
  activeCount: number;
}

export class EnemyProjectileSystem {
  private readonly projectiles: Phaser.Physics.Arcade.Group;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly enemies: Phaser.Physics.Arcade.Group
  ) {
    this.projectiles = scene.physics.add.group({
      classType: EnemyProjectile,
      maxSize: ENEMY_PROJECTILE.MAX_PROJECTILES,
      runChildUpdate: true,
    });
    this.prewarmProjectiles();
  }

  update(delta: number): void {
    for (const child of this.enemies.getChildren()) {
      const enemy = child as Enemy;
      if (enemy.active && enemy.getType() === 'shooter' && enemy.consumeShotReady(delta)) {
        this.fireFromEnemy(enemy);
      }
    }
  }

  fireFromEnemy(enemy: Enemy): boolean {
    const projectile = this.projectiles.getFirstDead(false) as EnemyProjectile | null;
    if (!projectile) {
      return false;
    }

    projectile.fire(enemy.x, enemy.y + ENEMY.HEIGHT / 2 + ENEMY_PROJECTILE.HEIGHT / 2);
    return true;
  }

  fireBossPattern(x: number, y: number, phase: 1 | 2 | 3): number {
    let firedCount = 0;
    const phaseConfig = BOSS.PHASES[phase];

    for (const offsetX of phaseConfig.PROJECTILE_OFFSETS) {
      const projectile = this.projectiles.getFirstDead(false) as EnemyProjectile | null;
      if (!projectile) {
        return firedCount;
      }

      projectile.fire(x + offsetX, y + BOSS.HEIGHT / 2 + ENEMY_PROJECTILE.HEIGHT / 2);
      firedCount += 1;
    }

    return firedCount;
  }

  getState(): EnemyProjectileState {
    return {
      activeCount: this.projectiles.countActive(true),
    };
  }

  getGroup(): Phaser.Physics.Arcade.Group {
    return this.projectiles;
  }

  recycleAll(): void {
    for (const child of this.projectiles.getChildren()) {
      const projectile = child as EnemyProjectile;
      if (projectile.active) {
        projectile.recycle();
      }
    }
  }

  private prewarmProjectiles(): void {
    for (let i = 0; i < ENEMY_PROJECTILE.MAX_PROJECTILES; i += 1) {
      const projectile = this.projectiles.create(0, 0, ASSET_KEYS.IMAGES.PLAYER_BULLET) as
        | EnemyProjectile
        | null;
      projectile?.recycle();
    }
  }
}
