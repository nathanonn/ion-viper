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
    typeSequence: ['basic', 'shooter', 'charger', 'basic', 'shooter', 'charger'],
    enemyCount: 6,
    spawnDelayMs: 500,
    enemySpeed: 120,
    scoreValue: 100,
  },
  {
    type: 'shooter',
    typeSequence: ['shooter', 'basic', 'shooter', 'charger', 'shooter', 'basic'],
    enemyCount: 5,
    spawnDelayMs: 400,
    enemySpeed: 150,
    scoreValue: 150,
  },
  {
    type: 'charger',
    typeSequence: ['charger', 'basic', 'charger', 'shooter', 'charger', 'basic'],
    enemyCount: 6,
    spawnDelayMs: 300,
    enemySpeed: 180,
    scoreValue: 200,
  },
];
