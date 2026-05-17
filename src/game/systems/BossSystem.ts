import type Phaser from 'phaser';
import { BOSS } from '../configs/constants';
import { Boss } from '../objects/Boss';
import type { DifficultySystem } from './DifficultySystem';
import type { EnemyProjectileSystem } from './EnemyProjectileSystem';

export interface BossState {
  active: boolean;
  health: number;
  maxHealth: number;
  phase: number;
  defeated: boolean;
}

export class BossSystem {
  private readonly boss: Boss;
  private active = false;
  private defeated = false;
  private phase: 1 | 2 | 3 = 1;
  private attackElapsedMs = 0;

  constructor(
    scene: Phaser.Scene,
    private readonly projectileSystem: EnemyProjectileSystem,
    private readonly onDefeated: () => void,
    private readonly difficultySystem?: DifficultySystem
  ) {
    this.boss = new Boss(scene);
    scene.add.existing(this.boss);
    scene.physics.add.existing(this.boss);
    this.boss.recycle();
  }

  startBoss(): void {
    if (this.active || this.defeated) {
      return;
    }

    this.active = true;
    this.defeated = false;
    this.phase = 1;
    this.attackElapsedMs = 0;
    this.boss.spawn();
    this.applyDifficultyHealth();
  }

  update(delta: number): void {
    if (!this.active || this.defeated) {
      return;
    }

    this.updatePhase();
    this.boss.updateMovement(delta);
    this.attackElapsedMs += delta;

    const phaseConfig = BOSS.PHASES[this.phase];
    if (this.attackElapsedMs >= phaseConfig.FIRE_INTERVAL_MS) {
      this.attackElapsedMs = 0;
      this.projectileSystem.fireBossPattern(this.boss.x, this.boss.y, this.phase);
    }
  }

  damageBoss(amount: number): boolean {
    if (!this.active || this.defeated) {
      return false;
    }

    this.boss.damage(amount);
    this.updatePhase();

    if (this.boss.isDefeated()) {
      this.active = false;
      this.defeated = true;
      this.boss.recycle();
      this.onDefeated();
    }

    return true;
  }

  getState(): BossState {
    if (!this.active && !this.defeated) {
      return {
        active: false,
        health: 0,
        maxHealth: 0,
        phase: 1,
        defeated: false,
      };
    }

    return {
      active: this.active,
      health: this.boss.getHealth(),
      maxHealth: this.boss.getMaxHealth(),
      phase: this.phase,
      defeated: this.defeated,
    };
  }

  getBoss(): Boss {
    return this.boss;
  }

  isActive(): boolean {
    return this.active;
  }

  isDefeated(): boolean {
    return this.defeated;
  }

  private updatePhase(): void {
    const healthRatio = this.boss.getHealth() / this.boss.getMaxHealth();
    let nextPhase: 1 | 2 | 3 = 1;

    if (healthRatio <= BOSS.PHASE_2_HEALTH_RATIO) {
      nextPhase = 3;
    } else if (healthRatio <= BOSS.PHASE_1_HEALTH_RATIO) {
      nextPhase = 2;
    }

    if (nextPhase !== this.phase) {
      this.phase = nextPhase;
      this.boss.setPhase(nextPhase);
      this.attackElapsedMs = BOSS.PHASES[nextPhase].FIRE_INTERVAL_MS;
    }
  }

  private applyDifficultyHealth(): void {
    const scaledMaxHealth = Math.ceil(
      BOSS.MAX_HEALTH * (this.difficultySystem?.getBossHealthMultiplier() ?? 1)
    );
    const bossHealth = this.boss as unknown as { health: number; maxHealth: number };

    bossHealth.health = scaledMaxHealth;
    bossHealth.maxHealth = scaledMaxHealth;
  }
}
