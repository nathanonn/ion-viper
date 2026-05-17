import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { WAVE_CONFIGS } from '../../src/game/data/waves';
import { getGameState, pressKey, waitForGameReady, waitForScene } from './helpers';

const ARTIFACT_DIR = 'goals/06-wave-system/test-artifacts';

interface EnemiesState {
  activeCount: number;
  totalDestroyed: number;
  totalSpawned: number;
  totalRecycled: number;
}

interface WaveState {
  currentWave: number;
  waveCount: number;
  gameWon: boolean;
  gameOver: boolean;
  enemies: EnemiesState;
}

async function startGame(page: Page): Promise<void> {
  await page.goto('/');
  await waitForGameReady(page);
  await waitForScene(page, 'MenuScene');
  await pressKey(page, 'Space', 100);
  await waitForScene(page, 'GameScene');
}

async function getWaveState(page: Page): Promise<WaveState> {
  const state = await getGameState(page);
  return {
    currentWave: state.currentWave as number,
    waveCount: state.waveCount as number,
    gameWon: state.gameWon as boolean,
    gameOver: state.gameOver,
    enemies: state.enemies as EnemiesState,
  };
}

async function waitForTotalSpawned(page: Page, totalSpawned: number): Promise<void> {
  await page.waitForFunction(
    (expectedTotal) =>
      ((window as any).__GAME_STATE__?.enemies?.totalSpawned ?? 0) >= expectedTotal,
    totalSpawned,
    { timeout: 6000 }
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
  await waitForTotalSpawned(page, expectedSpawned);
  await clearActiveEnemies(page);
}

test.describe('Wave system', () => {
  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test('M-001: waves spawn from config', async ({ page }) => {
    await startGame(page);

    const initial = await getWaveState(page);
    await waitForTotalSpawned(page, 1);
    const spawned = await getWaveState(page);

    expect(initial.currentWave).toBe(1);
    expect(initial.waveCount).toBe(WAVE_CONFIGS.length);
    expect(spawned.enemies.totalSpawned).toBeGreaterThanOrEqual(1);
    expect(spawned.enemies.activeCount).toBeGreaterThan(0);
  });

  test('M-002 and S-001: clearing a wave advances to the next wave', async ({ page }) => {
    await startGame(page);

    await clearWave(page, 0);
    await page.waitForFunction(
      () => ((window as any).__GAME_STATE__?.currentWave ?? 0) === 2,
      undefined,
      { timeout: 2000 }
    );
    const advanced = await getWaveState(page);

    expect(advanced.currentWave).toBe(2);
    expect(advanced.gameWon).toBe(false);
    await page.screenshot({ path: `${ARTIFACT_DIR}/wave-hud.png` });
  });

  test('M-003: later waves are harder', () => {
    expect(WAVE_CONFIGS.length).toBeGreaterThanOrEqual(2);

    const firstWave = WAVE_CONFIGS[0];
    const laterWave = WAVE_CONFIGS[WAVE_CONFIGS.length - 1];
    const isHarder =
      laterWave.enemyCount > firstWave.enemyCount ||
      laterWave.enemySpeed > firstWave.enemySpeed ||
      laterWave.spawnDelayMs < firstWave.spawnDelayMs;

    expect(isHarder).toBe(true);
  });

  test('M-004 and S-002: final wave clear sets gameWon and stops spawning', async ({ page }) => {
    await startGame(page);

    for (let waveIndex = 0; waveIndex < WAVE_CONFIGS.length; waveIndex += 1) {
      await clearWave(page, waveIndex);
    }

    await page.waitForFunction(
      () => (window as any).__GAME_STATE__?.gameWon === true,
      undefined,
      { timeout: 2000 }
    );
    const won = await getWaveState(page);
    await page.waitForTimeout(WAVE_CONFIGS[WAVE_CONFIGS.length - 1].spawnDelayMs + 200);
    const afterWait = await getWaveState(page);

    expect(won.gameWon).toBe(true);
    expect(won.currentWave).toBe(WAVE_CONFIGS.length);
    expect(won.waveCount).toBe(WAVE_CONFIGS.length);
    expect(won.gameOver).toBe(false);
    expect(won.enemies.activeCount).toBe(0);
    expect(afterWait.enemies.totalSpawned).toBe(won.enemies.totalSpawned);
    await page.screenshot({ path: `${ARTIFACT_DIR}/win-state.png` });
  });

  test('M-005: state bridge reports wave fields', async ({ page }) => {
    await startGame(page);

    const state = await getWaveState(page);

    expect(typeof state.currentWave).toBe('number');
    expect(typeof state.waveCount).toBe('number');
    expect(typeof state.gameWon).toBe('boolean');
    expect(state.currentWave).toBe(1);
    expect(state.waveCount).toBe(WAVE_CONFIGS.length);
    expect(state.gameWon).toBe(false);
  });
});
