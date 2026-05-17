import type { EnemyType } from '../data/enemies';
import type { WaveConfig } from '../data/waves';
import type { WaveRandomizer } from './WaveRandomizer';

export interface WaveSystemState {
  currentWave: number;
  waveCount: number;
  gameWon: boolean;
}

export interface WaveSpawnRequest {
  wave: WaveConfig;
  spawnIndex: number;
  type: EnemyType;
}

type SpawnWaveEnemy = (request: WaveSpawnRequest) => boolean;

export class WaveSystem {
  private currentWaveIndex = 0;
  private spawnedInWave = 0;
  private clearedInWave = 0;
  private elapsedSinceSpawn = 0;
  private currentSpawnDelayMs = 0;
  private started = false;
  private gameWon = false;

  constructor(
    private readonly waves: WaveConfig[],
    private readonly spawnEnemy: SpawnWaveEnemy,
    private readonly waveRandomizer?: WaveRandomizer
  ) {}

  start(): void {
    this.currentWaveIndex = 0;
    this.spawnedInWave = 0;
    this.clearedInWave = 0;
    this.elapsedSinceSpawn = 0;
    this.currentSpawnDelayMs = this.getNextSpawnDelay();
    this.started = true;
    this.gameWon = this.waves.length === 0;
  }

  update(delta: number): void {
    if (!this.started || this.gameWon) {
      return;
    }

    const wave = this.getCurrentWaveConfig();
    if (!wave) {
      this.gameWon = true;
      return;
    }

    this.elapsedSinceSpawn += delta;

    while (
      this.spawnedInWave < wave.enemyCount &&
      this.elapsedSinceSpawn >= this.currentSpawnDelayMs
    ) {
      const spawnDelay = this.currentSpawnDelayMs;
      const didSpawn = this.spawnEnemy({
        wave,
        spawnIndex: this.spawnedInWave,
        type: this.getSpawnType(wave, this.spawnedInWave),
      });
      if (!didSpawn) {
        return;
      }

      this.elapsedSinceSpawn -= spawnDelay;
      this.spawnedInWave += 1;
      this.currentSpawnDelayMs = this.getNextSpawnDelay();
    }

    this.advanceIfWaveClear();
  }

  onEnemyDestroyed(): void {
    this.onEnemyCleared();
  }

  onEnemyCleared(): void {
    if (!this.started || this.gameWon || this.clearedInWave >= this.spawnedInWave) {
      return;
    }

    this.clearedInWave += 1;
    this.advanceIfWaveClear();
  }

  isWaveClear(): boolean {
    const wave = this.getCurrentWaveConfig();
    if (!wave) {
      return true;
    }

    return this.spawnedInWave >= wave.enemyCount && this.clearedInWave >= wave.enemyCount;
  }

  getCurrentWave(): number {
    if (this.waves.length === 0) {
      return 0;
    }

    return Math.min(this.currentWaveIndex + 1, this.waves.length);
  }

  getWaveCount(): number {
    return this.waves.length;
  }

  isGameWon(): boolean {
    return this.gameWon;
  }

  getState(): WaveSystemState {
    return {
      currentWave: this.getCurrentWave(),
      waveCount: this.getWaveCount(),
      gameWon: this.isGameWon(),
    };
  }

  private getCurrentWaveConfig(): WaveConfig | undefined {
    return this.waves[this.currentWaveIndex];
  }

  private getSpawnType(wave: WaveConfig, spawnIndex: number): EnemyType {
    return wave.typeSequence?.[spawnIndex % wave.typeSequence.length] ?? wave.type;
  }

  private getNextSpawnDelay(): number {
    const wave = this.getCurrentWaveConfig();
    if (!wave) {
      return 0;
    }

    const type = this.getSpawnType(wave, this.spawnedInWave);
    return this.waveRandomizer?.nextDelay(wave.spawnDelayMs, type) ?? wave.spawnDelayMs;
  }

  private advanceIfWaveClear(): void {
    if (!this.isWaveClear()) {
      return;
    }

    if (this.currentWaveIndex >= this.waves.length - 1) {
      this.gameWon = true;
      return;
    }

    this.currentWaveIndex += 1;
    this.spawnedInWave = 0;
    this.clearedInWave = 0;
    this.elapsedSinceSpawn = 0;
    this.currentSpawnDelayMs = this.getNextSpawnDelay();
  }
}
