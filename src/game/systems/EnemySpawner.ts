import Phaser from 'phaser';
import { ENEMY_SPAWNER } from '../configs/constants';
import { getEnemyTypeConfig, type EnemyType } from '../data/enemies';
import { Enemy } from '../objects/Enemy';
import type { WaveRandomizer } from './WaveRandomizer';

export interface EnemySpawnOptions {
  type?: EnemyType;
  speed?: number;
  scoreValue?: number;
  onCleared?: () => void;
  getPlayerPosition?: () => { x: number; y: number };
}

export interface EnemySpawnerState {
  activeCount: number;
  totalDestroyed: number;
  totalSpawned: number;
  totalRecycled: number;
  lastSpawnX: number;
  previousSpawnX: number;
  samplePosition: { x: number; y: number };
}

export interface EnemyTypeState {
  activeBasic: number;
  activeShooter: number;
  activeCharger: number;
  lastSpawnedType: string;
}

export class EnemySpawner {
  private readonly enemies: Phaser.Physics.Arcade.Group;
  private elapsedSinceSpawn = 0;
  private totalDestroyed = 0;
  private totalSpawned = 0;
  private totalRecycled = 0;
  private lastSpawnX = 0;
  private previousSpawnX = 0;
  private lastSpawnedType: string = 'none';
  private readonly clearCallbacks = new Map<Enemy, () => void>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly waveRandomizer?: WaveRandomizer
  ) {
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

  spawnEnemy(options: EnemySpawnOptions = {}): Enemy | null {
    const enemy = this.enemies.get() as Enemy | null;

    if (!enemy) {
      return null;
    }

    const x = this.getNextSpawnX();
    const type = options.type ?? 'basic';
    const baseConfig = getEnemyTypeConfig(type);
    const config = {
      ...baseConfig,
      speed: options.speed ?? baseConfig.speed,
      scoreValue: options.scoreValue ?? baseConfig.scoreValue,
    };
    this.previousSpawnX = this.lastSpawnX;
    this.lastSpawnX = x;
    this.waveRandomizer?.recordSpawn(x);
    this.lastSpawnedType = type;
    this.totalSpawned += 1;

    if (options.onCleared) {
      this.clearCallbacks.set(enemy, options.onCleared);
    } else {
      this.clearCallbacks.delete(enemy);
    }

    enemy.spawn(config, {
      x,
      y: ENEMY_SPAWNER.SPAWN_Y,
      getPlayerPosition: options.getPlayerPosition,
      onOffscreenRecycle: () => {
        this.totalRecycled += 1;
        this.notifyCleared(enemy);
      },
    });

    return enemy;
  }

  destroyEnemy(enemy: Enemy): boolean {
    if (!enemy.active) {
      return false;
    }

    enemy.recycle();
    this.totalDestroyed += 1;
    this.notifyCleared(enemy);
    return true;
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

  getTypeState(): EnemyTypeState {
    const state: EnemyTypeState = {
      activeBasic: 0,
      activeShooter: 0,
      activeCharger: 0,
      lastSpawnedType: this.lastSpawnedType,
    };

    for (const child of this.enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active) {
        continue;
      }

      switch (enemy.getType()) {
        case 'basic':
          state.activeBasic += 1;
          break;
        case 'shooter':
          state.activeShooter += 1;
          break;
        case 'charger':
          state.activeCharger += 1;
          break;
      }
    }

    return state;
  }

  private getNextSpawnX(): number {
    if (this.waveRandomizer) {
      return this.waveRandomizer.nextSpawnX();
    }

    const positions = ENEMY_SPAWNER.SPAWN_X_POSITIONS;
    return positions[this.totalSpawned % positions.length];
  }

  private notifyCleared(enemy: Enemy): void {
    const callback = this.clearCallbacks.get(enemy);
    this.clearCallbacks.delete(enemy);
    callback?.();
  }
}
