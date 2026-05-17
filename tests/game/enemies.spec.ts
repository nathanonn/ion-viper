import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { getGameState, pressKey, waitForGameReady, waitForScene } from './helpers';

const ARTIFACT_DIR = 'goals/03-enemies/test-artifacts';

interface EnemiesState {
  activeCount: number;
  totalDestroyed: number;
  totalSpawned: number;
  totalRecycled: number;
  lastSpawnX: number;
  previousSpawnX: number;
  samplePosition: { x: number; y: number };
}

interface PlayerBulletsState {
  activeCount: number;
}

async function startGame(page: Page): Promise<void> {
  await page.goto('/');
  await waitForGameReady(page);
  await waitForScene(page, 'MenuScene');
  await pressKey(page, 'Space', 100);
  await waitForScene(page, 'GameScene');
}

async function getEnemies(page: Page): Promise<EnemiesState> {
  const state = await getGameState(page);
  return state.enemies as EnemiesState;
}

async function getPlayerBullets(page: Page): Promise<PlayerBulletsState> {
  const state = await getGameState(page);
  return state.playerBullets as PlayerBulletsState;
}

async function waitForEnemySpawn(page: Page, count: number = 1): Promise<EnemiesState> {
  await page.waitForFunction(
    (expectedCount) =>
      ((window as any).__GAME_STATE__?.enemies?.totalSpawned ?? 0) >= expectedCount,
    count,
    { timeout: 5000 }
  );

  return getEnemies(page);
}

test.describe('Enemies', () => {
  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test('M-001 and S-001: enemies spawn from the top at varied x positions', async ({ page }) => {
    await startGame(page);

    const before = await getEnemies(page);
    await waitForEnemySpawn(page, 1);
    const firstSpawn = await getEnemies(page);
    await waitForEnemySpawn(page, 2);
    const secondSpawn = await getEnemies(page);

    expect(firstSpawn.activeCount).toBeGreaterThan(before.activeCount);
    expect(secondSpawn.totalSpawned).toBeGreaterThanOrEqual(2);
    expect(secondSpawn.lastSpawnX).not.toBe(secondSpawn.previousSpawnX);
    expect(firstSpawn.samplePosition.y).toBeLessThanOrEqual(20);
    await page.screenshot({ path: `${ARTIFACT_DIR}/enemies.png` });
  });

  test('M-002: enemies move downward', async ({ page }) => {
    await startGame(page);
    const spawned = await waitForEnemySpawn(page, 1);

    await page.waitForTimeout(500);
    const moved = await getEnemies(page);

    expect(spawned.activeCount).toBeGreaterThan(0);
    expect(moved.samplePosition.y).toBeGreaterThan(spawned.samplePosition.y);
  });

  test('M-003 and S-002: bullets destroy enemies and recycle the bullet', async ({ page }) => {
    await startGame(page);
    await waitForEnemySpawn(page, 1);
    await page.waitForFunction(
      () => ((window as any).__GAME_STATE__?.enemies?.samplePosition?.y ?? 0) > 120,
      undefined,
      { timeout: 3000 }
    );

    const beforeEnemies = await getEnemies(page);
    const beforeBullets = await getPlayerBullets(page);
    await pressKey(page, 'Space', 100);
    await page.waitForFunction(
      (destroyedBefore) =>
        ((window as any).__GAME_STATE__?.enemies?.totalDestroyed ?? 0) > destroyedBefore,
      beforeEnemies.totalDestroyed,
      { timeout: 4000 }
    );
    const afterEnemies = await getEnemies(page);
    const afterBullets = await getPlayerBullets(page);

    expect(afterEnemies.totalDestroyed).toBeGreaterThan(beforeEnemies.totalDestroyed);
    expect(afterBullets.activeCount).toBeLessThanOrEqual(beforeBullets.activeCount);
    await page.screenshot({ path: `${ARTIFACT_DIR}/bullet-enemy-hit.png` });
  });

  test('M-004: offscreen enemies recycle', async ({ page }) => {
    await startGame(page);
    await waitForEnemySpawn(page, 1);

    await page.waitForTimeout(6500);
    const recycled = await getEnemies(page);

    expect(recycled.totalRecycled).toBeGreaterThan(0);
    expect(recycled.activeCount).toBeLessThan(recycled.totalSpawned);
  });

  test('M-005: state bridge reports enemy counts', async ({ page }) => {
    await startGame(page);

    const enemies = await getEnemies(page);

    expect(typeof enemies.activeCount).toBe('number');
    expect(typeof enemies.totalDestroyed).toBe('number');
    expect(enemies.activeCount).toBeGreaterThanOrEqual(0);
    expect(enemies.totalDestroyed).toBeGreaterThanOrEqual(0);
  });
});
