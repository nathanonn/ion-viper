import { Page } from '@playwright/test';

interface GameState {
  scene: string;
  ready: boolean;
  score: number;
  gameOver: boolean;
  [key: string]: unknown;
}

export async function getGameState(page: Page): Promise<GameState> {
  return (await page.evaluate(() => (window as any).__GAME_STATE__)) as GameState;
}

export async function waitForScene(
  page: Page,
  sceneKey: string,
  timeout: number = 10000
): Promise<void> {
  await page.waitForFunction(
    (key) => (window as any).__GAME_STATE__?.scene === key,
    sceneKey,
    { timeout }
  );
}

export async function pressKey(
  page: Page,
  key: string,
  duration: number = 100
): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(duration);
  await page.keyboard.up(key);
}

export async function waitForGameReady(page: Page, timeout: number = 15000): Promise<void> {
  await page.waitForFunction(
    () => (window as any).__GAME_STATE__?.ready === true,
    undefined,
    { timeout }
  );
}

export interface PageDiagnostics {
  pageErrors: string[];
  consoleErrors: string[];
}

export function trackPageDiagnostics(page: Page): PageDiagnostics {
  const diagnostics: PageDiagnostics = {
    pageErrors: [],
    consoleErrors: [],
  };

  page.on('pageerror', (error) => {
    diagnostics.pageErrors.push(error.message);
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      diagnostics.consoleErrors.push(message.text());
    }
  });

  return diagnostics;
}
