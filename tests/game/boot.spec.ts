import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import {
  getGameState,
  pressKey,
  trackPageDiagnostics,
  waitForGameReady,
  waitForScene,
} from './helpers';

const ARTIFACT_DIR = 'goals/00-foundation/test-artifacts';

async function openMenu(page: Page): Promise<void> {
  await page.goto('/');
  await waitForGameReady(page);
  await waitForScene(page, 'MenuScene');
}

test.describe('Game Boot', () => {
  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test('game canvas boots at foundation resolution without console errors', async ({ page }) => {
    const diagnostics = trackPageDiagnostics(page);
    await openMenu(page);

    await expect(page.locator('canvas')).toHaveCount(1);
    const canvasSize = await page.locator('canvas').evaluate((canvas) => ({
      width: (canvas as HTMLCanvasElement).width,
      height: (canvas as HTMLCanvasElement).height,
    }));

    const state = await getGameState(page);
    expect(state.scene).toBe('MenuScene');
    expect(state.ready).toBe(true);
    expect(canvasSize).toEqual({ width: 800, height: 600 });
    expect(diagnostics.pageErrors).toEqual([]);
    expect(diagnostics.consoleErrors).toEqual([]);
  });

  test('menu title screen remains on MenuScene and produces visual evidence', async ({ page }) => {
    await openMenu(page);

    const state = await getGameState(page);
    expect(state.scene).toBe('MenuScene');
    await page.screenshot({ path: `${ARTIFACT_DIR}/menu.png` });
  });

  test('state bridge reports base fields on boot', async ({ page }) => {
    await openMenu(page);

    const state = await getGameState(page);
    expect(state).toMatchObject({
      scene: 'MenuScene',
      ready: true,
      score: 0,
      gameOver: false,
    });
  });

  test('space key starts game', async ({ page }) => {
    await openMenu(page);

    await pressKey(page, 'Space', 100);
    await waitForScene(page, 'GameScene');

    const state = await getGameState(page);
    expect(state.scene).toBe('GameScene');
    await page.screenshot({ path: `${ARTIFACT_DIR}/game-scene.png` });
  });
});
