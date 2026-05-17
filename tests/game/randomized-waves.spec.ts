import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { WAVE_RANDOMIZATION } from '../../src/game/configs/constants';
import { WAVE_CONFIGS } from '../../src/game/data/waves';
import { getGameState, pressKey, waitForGameReady, waitForScene } from './helpers';

const ARTIFACT_DIR = 'goals/11-randomized-wave-system/test-artifacts';

interface WaveRandomizationState {
  enabled: boolean;
  spawnCount: number;
  uniqueSpawnLanes: number;
  minimumRecentSpacing: number;
  lastSpawnX: number;
  previousSpawnX: number;
}

interface EnemiesState {
  activeCount: number;
  totalSpawned: number;
}

interface EnemyTypesState {
  activeBasic: number;
  activeShooter: number;
  activeCharger: number;
  lastSpawnedType: string;
}

async function startGame(page: Page): Promise<void> {
  await page.goto('/');
  await waitForGameReady(page);
  await waitForScene(page, 'MenuScene');
  await pressKey(page, 'Space', 100);
  await waitForScene(page, 'GameScene');
}

async function getWaveRandomization(page: Page): Promise<WaveRandomizationState> {
  const state = await getGameState(page);
  return state.waveRandomization as WaveRandomizationState;
}

async function waitForRandomizedSpawns(page: Page, count: number): Promise<void> {
  await page.waitForFunction(
    (expectedCount) =>
      ((window as any).__GAME_STATE__?.waveRandomization?.spawnCount ?? 0) >= expectedCount,
    count,
    { timeout: 7000 }
  );
}

async function waitForTotalSpawned(page: Page, totalSpawned: number): Promise<void> {
  await page.waitForFunction(
    (expectedTotal) =>
      ((window as any).__GAME_STATE__?.enemies?.totalSpawned ?? 0) >= expectedTotal,
    totalSpawned,
    { timeout: 7000 }
  );
}

async function clearActiveEnemies(page: Page): Promise<void> {
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    const enemies = scene.enemySpawner.getGroup().getChildren();

    enemies.forEach((enemy: any) => {
      if (enemy.active) {
        scene.enemySpawner.destroyEnemy(enemy);
      }
    });
  });
}

async function clearWave(page: Page, waveIndex: number): Promise<void> {
  const expectedSpawned = WAVE_CONFIGS.slice(0, waveIndex + 1).reduce(
    (total, wave) => total + wave.enemyCount,
    0
  );

  const deadline = Date.now() + 9000;
  while (Date.now() < deadline) {
    const state = await getGameState(page);
    const enemies = state.enemies as EnemiesState;
    if (enemies.totalSpawned >= expectedSpawned) {
      break;
    }

    await clearActiveEnemies(page);
    await page.waitForTimeout(100);
  }

  await waitForTotalSpawned(page, expectedSpawned);
  await clearActiveEnemies(page);
}

test.describe('Randomized waves', () => {
  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test('M-001, M-002, and S-001: spawn lanes vary while preserving recent spacing', async ({
    page,
  }) => {
    await startGame(page);

    await waitForRandomizedSpawns(page, 5);
    const randomization = await getWaveRandomization(page);

    expect(randomization.enabled).toBe(true);
    expect(randomization.spawnCount).toBeGreaterThanOrEqual(5);
    expect(randomization.uniqueSpawnLanes).toBeGreaterThan(1);
    expect(randomization.lastSpawnX).not.toBe(0);
    expect(randomization.previousSpawnX).not.toBe(0);
    expect(randomization.lastSpawnX).not.toBe(randomization.previousSpawnX);
    expect(randomization.minimumRecentSpacing).toBeGreaterThanOrEqual(
      WAVE_RANDOMIZATION.MIN_LANE_SPACING
    );
    await page.screenshot({ path: `${ARTIFACT_DIR}/randomized-lanes.png` });
  });

  test('M-003 and S-002: first mixed wave remains readable', async ({ page }) => {
    await startGame(page);

    const initial = await getGameState(page);
    await waitForRandomizedSpawns(page, 3);
    const state = await getGameState(page);
    const enemies = state.enemies as EnemiesState;
    const enemyTypes = state.enemyTypes as EnemyTypesState;
    const randomization = state.waveRandomization as WaveRandomizationState;

    expect(WAVE_CONFIGS[0].spawnDelayMs).toBeGreaterThanOrEqual(600);
    expect(WAVE_RANDOMIZATION.ARCHETYPE_DELAY_MULTIPLIERS.shooter).toBeGreaterThan(1);
    expect(WAVE_RANDOMIZATION.ARCHETYPE_DELAY_MULTIPLIERS.charger).toBeGreaterThan(1);
    expect(enemies.activeCount).toBeLessThanOrEqual(3);
    expect(state.playerHealth).toBe(initial.playerHealth);
    expect(enemyTypes.activeBasic + enemyTypes.activeShooter).toBeGreaterThan(0);
    expect(randomization.minimumRecentSpacing).toBeGreaterThanOrEqual(
      WAVE_RANDOMIZATION.MIN_LANE_SPACING
    );

    await waitForRandomizedSpawns(page, 4);
    await page.screenshot({ path: `${ARTIFACT_DIR}/mixed-wave-readability.png` });
  });

  test('M-004: randomized waves advance and complete through the final wave', async ({
    page,
  }) => {
    await startGame(page);

    for (let waveIndex = 0; waveIndex < WAVE_CONFIGS.length; waveIndex += 1) {
      await clearWave(page, waveIndex);
    }

    await page.waitForFunction(
      () => (window as any).__GAME_STATE__?.gameWon === true,
      undefined,
      { timeout: 2000 }
    );
    const state = await getGameState(page);
    const enemies = state.enemies as EnemiesState;

    expect(state.currentWave).toBe(WAVE_CONFIGS.length);
    expect(state.waveCount).toBe(WAVE_CONFIGS.length);
    expect(state.gameWon).toBe(true);
    expect(state.gameOver).toBe(false);
    expect(enemies.activeCount).toBe(0);
  });

  test('M-005: state bridge reports all randomization fields', async ({ page }) => {
    await startGame(page);

    const beforeSpawn = await getWaveRandomization(page);
    await waitForRandomizedSpawns(page, 2);
    const afterSpawn = await getWaveRandomization(page);

    expect(typeof beforeSpawn.enabled).toBe('boolean');
    expect(typeof beforeSpawn.spawnCount).toBe('number');
    expect(typeof beforeSpawn.uniqueSpawnLanes).toBe('number');
    expect(typeof beforeSpawn.minimumRecentSpacing).toBe('number');
    expect(typeof beforeSpawn.lastSpawnX).toBe('number');
    expect(typeof beforeSpawn.previousSpawnX).toBe('number');
    expect(afterSpawn.enabled).toBe(true);
    expect(afterSpawn.spawnCount).toBeGreaterThan(beforeSpawn.spawnCount);
    expect(afterSpawn.uniqueSpawnLanes).toBeGreaterThanOrEqual(1);
  });
});
