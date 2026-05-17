import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import {
  getGameState,
  pressKey,
  trackPageDiagnostics,
  waitForGameReady,
  waitForScene,
} from './helpers';

const ARTIFACT_DIR = 'goals/09-ion-blast-power-up/test-artifacts';
const MAX_BULLETS = 8;

interface IonBlastState {
  active: boolean;
  remainingMs: number;
  collectedCount: number;
  projectileCount: number;
  pickupActive: boolean;
  pickupPosition: { x: number; y: number };
  poolActiveCount: number;
  totalSpawned: number;
  totalRecycled: number;
  maxPickups: number;
}

interface PlayerBulletsState {
  activeCount: number;
}

async function startGame(page: Page): Promise<void> {
  await page.goto('http://127.0.0.1:8080/');
  await waitForGameReady(page);
  await waitForScene(page, 'MenuScene');
  await pressKey(page, 'Space', 100);
  await waitForScene(page, 'GameScene');
}

async function getIonBlast(page: Page): Promise<IonBlastState> {
  const state = await getGameState(page);
  return state.ionBlast as IonBlastState;
}

async function getPlayerBullets(page: Page): Promise<PlayerBulletsState> {
  const state = await getGameState(page);
  return state.playerBullets as PlayerBulletsState;
}

async function waitForPickup(page: Page): Promise<IonBlastState> {
  await page.waitForFunction(
    () =>
      ((window as any).__GAME_STATE__?.ionBlast?.totalSpawned ?? 0) >= 1 &&
      (window as any).__GAME_STATE__?.ionBlast?.pickupActive === true,
    undefined,
    { timeout: 5000 }
  );

  return getIonBlast(page);
}

async function movePlayerToX(page: Page, targetX: number): Promise<void> {
  const state = await getGameState(page);
  const player = state.playerPosition as { x: number; y: number };
  const distance = Math.abs(player.x - targetX);

  if (distance <= 4) {
    return;
  }

  const key = player.x > targetX ? 'ArrowLeft' : 'ArrowRight';
  const shouldMoveLeft = key === 'ArrowLeft';
  await page.keyboard.down(key);

  try {
    await page.waitForFunction(
      ({ target, moveLeft }) => {
        const x = (window as any).__GAME_STATE__?.playerPosition?.x ?? 0;
        return moveLeft ? x <= target : x >= target;
      },
      { target: targetX, moveLeft: shouldMoveLeft },
      { timeout: 1500 }
    );
  } finally {
    await page.keyboard.up(key);
  }
}

async function collectIonBlast(page: Page): Promise<IonBlastState> {
  const pickup = await waitForPickup(page);
  const beforeCollected = pickup.collectedCount;
  await movePlayerToX(page, pickup.pickupPosition.x);

  await page.waitForFunction(
    (collectedBefore) =>
      ((window as any).__GAME_STATE__?.ionBlast?.collectedCount ?? 0) > collectedBefore &&
      (window as any).__GAME_STATE__?.ionBlast?.active === true,
    beforeCollected,
    { timeout: 5000 }
  );

  return getIonBlast(page);
}

test.describe('Ion Blast power-up', () => {
  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test('M-001 and S-001: Ion Blast pickup spawns without console errors', async ({ page }) => {
    const diagnostics = trackPageDiagnostics(page);
    await startGame(page);

    const ionBlast = await waitForPickup(page);

    expect(ionBlast.pickupActive).toBe(true);
    expect(ionBlast.totalSpawned).toBeGreaterThanOrEqual(1);
    expect(ionBlast.poolActiveCount).toBeGreaterThan(0);
    expect(ionBlast.poolActiveCount).toBeLessThanOrEqual(ionBlast.maxPickups);
    expect(diagnostics.pageErrors).toEqual([]);
    expect(diagnostics.consoleErrors).toEqual([]);
    await page.screenshot({ path: `${ARTIFACT_DIR}/ion-blast-pickup.png` });
  });

  test('M-002: collecting pickup activates Ion Blast and increments count', async ({ page }) => {
    await startGame(page);

    const activated = await collectIonBlast(page);

    expect(activated.active).toBe(true);
    expect(activated.remainingMs).toBeGreaterThan(0);
    expect(activated.collectedCount).toBe(1);
    expect(activated.totalRecycled).toBeGreaterThanOrEqual(1);
  });

  test('M-003 and S-002: active Ion Blast fires multiple projectiles', async ({ page }) => {
    await startGame(page);
    const activated = await collectIonBlast(page);
    const before = await getPlayerBullets(page);

    await pressKey(page, 'Space', 80);
    const after = await getPlayerBullets(page);
    const ionBlast = await getIonBlast(page);

    expect(activated.active).toBe(true);
    expect(ionBlast.projectileCount).toBeGreaterThan(1);
    expect(after.activeCount - before.activeCount).toBeGreaterThanOrEqual(2);
    await page.screenshot({ path: `${ARTIFACT_DIR}/ion-blast-multishot.png` });
  });

  test('M-004: Ion Blast expires and returns to single-shot firing', async ({ page }) => {
    await startGame(page);
    await collectIonBlast(page);

    await page.waitForFunction(
      () =>
        (window as any).__GAME_STATE__?.ionBlast?.active === false &&
        (window as any).__GAME_STATE__?.ionBlast?.remainingMs === 0,
      undefined,
      { timeout: 5000 }
    );

    await page.waitForFunction(
      () => ((window as any).__GAME_STATE__?.playerBullets?.activeCount ?? 0) === 0,
      undefined,
      { timeout: 3000 }
    );

    const before = await getPlayerBullets(page);
    await pressKey(page, 'Space', 80);
    const after = await getPlayerBullets(page);
    const ionBlast = await getIonBlast(page);

    expect(ionBlast.active).toBe(false);
    expect(ionBlast.projectileCount).toBe(1);
    expect(after.activeCount - before.activeCount).toBe(1);
  });

  test('M-005: bullet and pickup pools stay bounded during Ion Blast', async ({ page }) => {
    await startGame(page);
    await collectIonBlast(page);

    await pressKey(page, 'Space', 2000);
    const bullets = await getPlayerBullets(page);
    const ionBlast = await getIonBlast(page);

    expect(bullets.activeCount).toBeLessThanOrEqual(MAX_BULLETS);
    expect(ionBlast.poolActiveCount).toBeLessThanOrEqual(ionBlast.maxPickups);
  });
});
