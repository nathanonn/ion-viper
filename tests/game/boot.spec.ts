import { expect, test } from '@playwright/test';
import { getGameState, pressKey, waitForGameReady, waitForScene } from './helpers';

test.describe('Game Boot', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('game boots and reaches menu', async ({ page }) => {
    await waitForGameReady(page);
    await waitForScene(page, 'MenuScene');

    const state = await getGameState(page);
    expect(state.scene).toBe('MenuScene');
    expect(state.ready).toBe(true);
  });

  test('state bridge reports correct scene', async ({ page }) => {
    await waitForGameReady(page);
    await waitForScene(page, 'MenuScene');

    const state = await getGameState(page);
    expect(state.scene).toBe('MenuScene');
    expect(state.score).toBe(0);
    expect(state.gameOver).toBe(false);
  });

  test('space key starts game', async ({ page }) => {
    await waitForGameReady(page);
    await waitForScene(page, 'MenuScene');

    await pressKey(page, 'Space', 100);
    await waitForScene(page, 'GameScene');

    const state = await getGameState(page);
    expect(state.scene).toBe('GameScene');
  });
});
