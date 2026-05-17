import { DIFFICULTY } from '../configs/constants';

export interface DifficultyState {
  loop: number;
  enemySpeedMultiplier: number;
  enemyHealthMultiplier: number;
  bossHealthMultiplier: number;
}

export class DifficultySystem {
  private constructor(private readonly loop: number) {}

  static fromLoop(loop: number | undefined): DifficultySystem {
    const normalizedLoop =
      typeof loop === 'number' && Number.isFinite(loop)
        ? Math.max(DIFFICULTY.BASE_LOOP, Math.floor(loop))
        : DIFFICULTY.BASE_LOOP;

    return new DifficultySystem(normalizedLoop);
  }

  getLoop(): number {
    return this.loop;
  }

  getEnemySpeedMultiplier(): number {
    return this.getMultiplier(DIFFICULTY.ENEMY_SPEED_INCREASE_PER_LOOP);
  }

  getEnemyHealthMultiplier(): number {
    return this.getMultiplier(DIFFICULTY.ENEMY_HEALTH_INCREASE_PER_LOOP);
  }

  getBossHealthMultiplier(): number {
    return this.getMultiplier(DIFFICULTY.BOSS_HEALTH_INCREASE_PER_LOOP);
  }

  getState(): DifficultyState {
    return {
      loop: this.loop,
      enemySpeedMultiplier: this.getEnemySpeedMultiplier(),
      enemyHealthMultiplier: this.getEnemyHealthMultiplier(),
      bossHealthMultiplier: this.getBossHealthMultiplier(),
    };
  }

  private getMultiplier(increasePerLoop: number): number {
    const multiplier = 1 + (this.loop - DIFFICULTY.BASE_LOOP) * increasePerLoop;
    return Math.round(multiplier * 100) / 100;
  }
}
