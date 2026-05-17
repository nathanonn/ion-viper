import { ENEMY_SPAWNER, WAVE_RANDOMIZATION } from '../configs/constants';
import type { EnemyType } from '../data/enemies';

export interface WaveRandomizationState {
  enabled: boolean;
  spawnCount: number;
  uniqueSpawnLanes: number;
  minimumRecentSpacing: number;
  lastSpawnX: number;
  previousSpawnX: number;
}

interface WaveRandomizerOptions {
  enabled?: boolean;
  spawnLanes?: readonly number[];
  minimumLaneSpacing?: number;
  recentHistorySize?: number;
  firstSpawnX?: number;
  delayJitterRatio?: number;
  minDelayMs?: number;
  random?: () => number;
}

export class WaveRandomizer {
  private readonly enabled: boolean;
  private readonly spawnLanes: readonly number[];
  private readonly minimumLaneSpacing: number;
  private readonly recentHistorySize: number;
  private readonly firstSpawnX: number;
  private readonly delayJitterRatio: number;
  private readonly minDelayMs: number;
  private readonly random: () => number;
  private readonly recentSpawns: number[] = [];
  private readonly usedLanes = new Set<number>();
  private readonly laneUseCounts = new Map<number, number>();
  private spawnCount = 0;
  private lastSpawnX = 0;
  private previousSpawnX = 0;

  constructor(options: WaveRandomizerOptions = {}) {
    this.enabled = options.enabled ?? WAVE_RANDOMIZATION.ENABLED;
    this.spawnLanes = options.spawnLanes ?? ENEMY_SPAWNER.SPAWN_X_POSITIONS;
    this.minimumLaneSpacing =
      options.minimumLaneSpacing ?? WAVE_RANDOMIZATION.MIN_LANE_SPACING;
    this.recentHistorySize =
      options.recentHistorySize ?? WAVE_RANDOMIZATION.RECENT_HISTORY_SIZE;
    this.firstSpawnX = options.firstSpawnX ?? WAVE_RANDOMIZATION.FIRST_SPAWN_X;
    this.delayJitterRatio =
      options.delayJitterRatio ?? WAVE_RANDOMIZATION.DELAY_JITTER_RATIO;
    this.minDelayMs = options.minDelayMs ?? WAVE_RANDOMIZATION.MIN_DELAY_MS;
    this.random = options.random ?? Math.random;
  }

  nextSpawnX(): number {
    if (!this.enabled) {
      return this.spawnLanes[this.spawnCount % this.spawnLanes.length] ?? this.firstSpawnX;
    }

    if (this.spawnCount === 0 && this.spawnLanes.includes(this.firstSpawnX)) {
      return this.firstSpawnX;
    }

    const fairCandidates = this.getFairCandidates();
    const leastUsedCount = Math.min(
      ...fairCandidates.map((lane) => this.laneUseCounts.get(lane) ?? 0)
    );
    const balancedCandidates = fairCandidates.filter(
      (lane) => (this.laneUseCounts.get(lane) ?? 0) === leastUsedCount
    );

    return this.pickRandom(balancedCandidates);
  }

  nextDelay(baseDelay: number, enemyType: EnemyType = 'basic'): number {
    const multiplier = WAVE_RANDOMIZATION.ARCHETYPE_DELAY_MULTIPLIERS[enemyType];
    const jitterRange = baseDelay * this.delayJitterRatio;
    const jitter = this.enabled ? (this.random() * 2 - 1) * jitterRange : 0;

    return Math.max(this.minDelayMs, Math.round(baseDelay * multiplier + jitter));
  }

  recordSpawn(x: number): void {
    this.previousSpawnX = this.lastSpawnX;
    this.lastSpawnX = x;
    this.spawnCount += 1;
    this.usedLanes.add(x);
    this.laneUseCounts.set(x, (this.laneUseCounts.get(x) ?? 0) + 1);
    this.recentSpawns.push(x);

    while (this.recentSpawns.length > this.recentHistorySize) {
      this.recentSpawns.shift();
    }
  }

  getState(): WaveRandomizationState {
    return {
      enabled: this.enabled,
      spawnCount: this.spawnCount,
      uniqueSpawnLanes: this.usedLanes.size,
      minimumRecentSpacing: this.getMinimumRecentSpacing(),
      lastSpawnX: this.lastSpawnX,
      previousSpawnX: this.previousSpawnX,
    };
  }

  private getFairCandidates(): readonly number[] {
    const lastSpawn = this.recentSpawns.at(-1);
    if (lastSpawn === undefined) {
      return this.spawnLanes;
    }

    const spacedCandidates = this.spawnLanes.filter(
      (lane) => Math.abs(lane - lastSpawn) >= this.minimumLaneSpacing
    );
    if (spacedCandidates.length > 0) {
      return spacedCandidates;
    }

    const nonRepeatCandidates = this.spawnLanes.filter((lane) => lane !== lastSpawn);
    return nonRepeatCandidates.length > 0 ? nonRepeatCandidates : this.spawnLanes;
  }

  private getMinimumRecentSpacing(): number {
    if (this.recentSpawns.length < 2) {
      return 0;
    }

    let minimumSpacing = Number.POSITIVE_INFINITY;
    for (let index = 1; index < this.recentSpawns.length; index += 1) {
      const previous = this.recentSpawns[index - 1]!;
      const current = this.recentSpawns[index]!;
      minimumSpacing = Math.min(minimumSpacing, Math.abs(current - previous));
    }

    return Number.isFinite(minimumSpacing) ? minimumSpacing : 0;
  }

  private pickRandom(candidates: readonly number[]): number {
    const index = Math.floor(this.random() * candidates.length);
    return candidates[index] ?? this.firstSpawnX;
  }
}
