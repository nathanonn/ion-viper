import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { getGameState, pressKey, waitForGameReady, waitForScene } from './helpers';

const ARTIFACT_DIR = 'goals/08-rebrand-ion-viper/test-artifacts';
const GAME_TITLE = 'Ion Viper';
const GAME_DESCRIPTION_PHRASE = 'Raiden-style vertical shooter';

interface GameIdentity {
  title: string;
  description: string;
}

function getIdentity(state: Record<string, unknown>): GameIdentity {
  return state.gameIdentity as GameIdentity;
}

async function openMenu(page: Page): Promise<void> {
  await page.goto('/');
  await waitForGameReady(page);
  await waitForScene(page, 'MenuScene');
}

test.describe('Ion Viper rebrand', () => {
  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test('M-001 browser and menu identity use Ion Viper', async ({ page }) => {
    await openMenu(page);

    const state = await getGameState(page);
    const identity = getIdentity(state);

    expect(await page.title()).toBe(GAME_TITLE);
    expect(state.scene).toBe('MenuScene');
    expect(identity.title).toBe(GAME_TITLE);
    await page.screenshot({ path: `${ARTIFACT_DIR}/menu-title.png` });
  });

  test('M-002 identity description preserves the gameplay style', async ({ page }) => {
    await openMenu(page);

    const state = await getGameState(page);
    const identity = getIdentity(state);

    expect(identity.description).toContain(GAME_DESCRIPTION_PHRASE);
    expect(identity.description.length).toBeGreaterThan(0);
  });

  test('M-003 start flow still works after the rebrand', async ({ page }) => {
    await openMenu(page);

    await pressKey(page, 'Space', 100);
    await waitForScene(page, 'GameScene');

    const state = await getGameState(page);
    const identity = getIdentity(state);

    expect(state.scene).toBe('GameScene');
    expect(identity.title).toBe(GAME_TITLE);
    await page.screenshot({ path: `${ARTIFACT_DIR}/game-start.png` });
  });
});
