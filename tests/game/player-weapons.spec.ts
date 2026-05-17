import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { getGameState, pressKey, waitForGameReady, waitForScene } from './helpers';

const ARTIFACT_DIR = 'goals/02-player-weapons/test-artifacts';
const FIRE_INTERVAL_MS = 150;
const MAX_BULLETS = 8;

interface PlayerBulletsState {
  activeCount: number;
}

async function startGame(page: Page): Promise<void> {
  await page.goto('/');
  await waitForGameReady(page);
  await waitForScene(page, 'MenuScene');
  await pressKey(page, 'Space', 100);
  await waitForScene(page, 'GameScene');
  await page.waitForTimeout(FIRE_INTERVAL_MS);
}

async function getPlayerBullets(page: Page): Promise<PlayerBulletsState> {
  const state = await getGameState(page);
  return state.playerBullets as PlayerBulletsState;
}

test.describe('Player Weapons', () => {
  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test('M-001 and S-001: SPACE fires a player bullet', async ({ page }) => {
    await startGame(page);

    const before = await getPlayerBullets(page);
    await pressKey(page, 'Space', 100);
    const after = await getPlayerBullets(page);

    expect(after.activeCount).toBeGreaterThan(before.activeCount);
    await page.screenshot({ path: `${ARTIFACT_DIR}/bullets.png` });
  });

  test('M-002: bullets use a capped pool', async ({ page }) => {
    await startGame(page);

    await pressKey(page, 'Space', 3000);
    const bullets = await getPlayerBullets(page);

    expect(bullets.activeCount).toBeLessThanOrEqual(MAX_BULLETS);
  });

  test('M-003 and S-002: fire rate limits sustained shots', async ({ page }) => {
    await startGame(page);

    await pressKey(page, 'Space', FIRE_INTERVAL_MS * 2 - 30);
    const bullets = await getPlayerBullets(page);

    expect(bullets.activeCount).toBeGreaterThan(0);
    expect(bullets.activeCount).toBeLessThanOrEqual(2);
    await page.screenshot({ path: `${ARTIFACT_DIR}/burst.png` });
  });

  test('M-004: bullets recycle after leaving the top edge', async ({ page }) => {
    await startGame(page);

    await pressKey(page, 'Space', 100);
    const fired = await getPlayerBullets(page);
    expect(fired.activeCount).toBeGreaterThan(0);

    await page.waitForTimeout(2000);
    const recycled = await getPlayerBullets(page);

    expect(recycled.activeCount).toBeLessThan(fired.activeCount);
    expect(recycled.activeCount).toBe(0);
  });

  test('M-005: state bridge reports player bullet active count', async ({ page }) => {
    await startGame(page);

    const bullets = await getPlayerBullets(page);

    expect(typeof bullets.activeCount).toBe('number');
    expect(bullets.activeCount).toBeGreaterThanOrEqual(0);
  });
});
