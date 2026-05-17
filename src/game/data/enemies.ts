export type EnemyType = 'basic' | 'shooter' | 'charger';

export type EnemyBehaviorConfig =
  | {
      kind: 'drift';
    }
  | {
      kind: 'shooter';
      fireIntervalMs: number;
      firstShotDelayMs: number;
    }
  | {
      kind: 'charger';
      chargeDelayMs: number;
      chargeSpeed: number;
    };

export interface EnemyTypeConfig {
  type: EnemyType;
  health: number;
  speed: number;
  scoreValue: number;
  tint: number;
  behavior: EnemyBehaviorConfig;
}

export const ENEMY_TYPE_CONFIGS: Record<EnemyType, EnemyTypeConfig> = {
  basic: {
    type: 'basic',
    health: 1,
    speed: 120,
    scoreValue: 100,
    tint: 0xffffff,
    behavior: { kind: 'drift' },
  },
  shooter: {
    type: 'shooter',
    health: 2,
    speed: 85,
    scoreValue: 200,
    tint: 0x55aaff,
    behavior: {
      kind: 'shooter',
      fireIntervalMs: 850,
      firstShotDelayMs: 450,
    },
  },
  charger: {
    type: 'charger',
    health: 2,
    speed: 60,
    scoreValue: 250,
    tint: 0xffaa33,
    behavior: {
      kind: 'charger',
      chargeDelayMs: 700,
      chargeSpeed: 280,
    },
  },
};

export function getEnemyTypeConfig(type: EnemyType): EnemyTypeConfig {
  return ENEMY_TYPE_CONFIGS[type];
}
