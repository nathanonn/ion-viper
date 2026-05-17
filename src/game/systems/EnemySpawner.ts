import Phaser from 'phaser';
import { ENEMY, ENEMY_SPAWNER } from '../configs/constants';
import { Enemy } from '../objects/Enemy';

export interface EnemySpawnerState {
  activeCount: number;
  totalDestroyed: number;
  totalSpawned: number;
  totalRecycled: number;
  lastSpawnX: number;
  previousSpawnX: number;
  samplePosition: { x: number; y: number };
}

export class EnemySpawner {
  private readonly enemies: Phaser.Physics.Arcade.Group;
  private elapsedSinceSpawn = 0;
  private totalDestroyed = 0;
  private totalSpawned = 0;
  private totalRecycled = 0;
  private lastSpawnX = 0;
  private previousSpawnX = 0;

  constructor(private readonly scene: Phaser.Scene) {
    Enemy.createPlaceholderTexture(scene);

    this.enemies = scene.physics.add.group({
      classType: Enemy,
      maxSize: ENEMY_SPAWNER.MAX_ENEMIES,
      runChildUpdate: true,
    });
  }

  update(delta: number): void {
    this.elapsedSinceSpawn += delta;

    while (this.elapsedSinceSpawn >= ENEMY_SPAWNER.SPAWN_INTERVAL_MS) {
      this.elapsedSinceSpawn -= ENEMY_SPAWNER.SPAWN_INTERVAL_MS;
      this.spawnEnemy();
    }
  }

  spawnEnemy(): Enemy | null {
    const enemy = this.enemies.get() as Enemy | null;

    if (!enemy) {
      return null;
    }

    const x = this.getNextSpawnX();
    this.previousSpawnX = this.lastSpawnX;
    this.lastSpawnX = x;
    this.totalSpawned += 1;
    enemy.spawn(x, ENEMY_SPAWNER.SPAWN_Y, ENEMY.SPEED, () => {
      this.totalRecycled += 1;
    });

    return enemy;
  }

  destroyEnemy(enemy: Enemy): void {
    if (!enemy.active) {
      return;
    }

    enemy.recycle();
    this.totalDestroyed += 1;
  }

  getGroup(): Phaser.Physics.Arcade.Group {
    return this.enemies;
  }

  getActiveCount(): number {
    return this.enemies.countActive(true);
  }

  getTotalDestroyed(): number {
    return this.totalDestroyed;
  }

  getState(): EnemySpawnerState {
    const sampleEnemy = this.enemies.getFirstAlive(false) as Enemy | null;

    return {
      activeCount: this.getActiveCount(),
      totalDestroyed: this.getTotalDestroyed(),
      totalSpawned: this.totalSpawned,
      totalRecycled: this.totalRecycled,
      lastSpawnX: this.lastSpawnX,
      previousSpawnX: this.previousSpawnX,
      samplePosition: sampleEnemy
        ? { x: sampleEnemy.x, y: sampleEnemy.y }
        : { x: 0, y: 0 },
    };
  }

  private getNextSpawnX(): number {
    const positions = ENEMY_SPAWNER.SPAWN_X_POSITIONS;
    return positions[this.totalSpawned % positions.length];
  }
}
