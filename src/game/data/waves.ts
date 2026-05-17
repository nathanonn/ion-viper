export type EnemyWaveType = 'basic';

export interface WaveConfig {
  type: EnemyWaveType;
  enemyCount: number;
  spawnDelayMs: number;
  enemySpeed: number;
  scoreValue: number;
}

export const WAVE_CONFIGS: WaveConfig[] = [
  {
    type: 'basic',
    enemyCount: 4,
    spawnDelayMs: 500,
    enemySpeed: 120,
    scoreValue: 100,
  },
  {
    type: 'basic',
    enemyCount: 5,
    spawnDelayMs: 400,
    enemySpeed: 150,
    scoreValue: 150,
  },
  {
    type: 'basic',
    enemyCount: 6,
    spawnDelayMs: 300,
    enemySpeed: 180,
    scoreValue: 200,
  },
];
