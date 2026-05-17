import type { EnemyType } from './enemies';

export type EnemyWaveType = EnemyType;

export interface WaveConfig {
  type: EnemyWaveType;
  typeSequence?: EnemyWaveType[];
  enemyCount: number;
  spawnDelayMs: number;
  enemySpeed: number;
  scoreValue: number;
}

export const WAVE_CONFIGS: WaveConfig[] = [
  {
    type: 'basic',
    typeSequence: ['basic', 'shooter', 'basic', 'charger', 'basic', 'shooter'],
    enemyCount: 6,
    spawnDelayMs: 650,
    enemySpeed: 120,
    scoreValue: 100,
  },
  {
    type: 'shooter',
    typeSequence: ['shooter', 'basic', 'charger', 'shooter', 'basic', 'charger', 'shooter'],
    enemyCount: 7,
    spawnDelayMs: 600,
    enemySpeed: 150,
    scoreValue: 150,
  },
  {
    type: 'charger',
    typeSequence: ['charger', 'basic', 'shooter', 'charger', 'basic', 'charger', 'shooter', 'charger'],
    enemyCount: 8,
    spawnDelayMs: 540,
    enemySpeed: 180,
    scoreValue: 200,
  },
];
