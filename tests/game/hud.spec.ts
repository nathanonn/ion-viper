import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { getGameState, pressKey, waitForGameReady, waitForScene } from './helpers';

const ARTIFACT_DIR = 'goals/05-hud/test-artifacts';
const FIRE_INTERVAL_MS = 150;

interface PlayerBulletsState {
  activeCount: number;
}

interface PlayerPosition {
  x: number;
  y: number;
}

interface EnemiesState {
  totalDestroyed: number;
}

async function startGame(page: Page): Promise<void> {
  await page.goto('/');
  await waitForGameReady(page);
  await waitForScene(page, 'MenuScene');
  await pressKey(page, 'Space', 100);
  await waitForScene(page, 'GameScene');
  await waitForHudVisible(page);
  await page.waitForTimeout(FIRE_INTERVAL_MS);
}

async function waitForHudVisible(page: Page): Promise<void> {
  await page.waitForFunction(
    () => (window as any).__GAME_STATE__?.hudVisible === true,
    undefined,
    { timeout: 3000 }
  );
}

async function spawnEnemyInBulletPath(page: Page): Promise<void> {
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    const player = scene.player;
    const enemy = scene.enemySpawner.spawnEnemy();

    if (!enemy) {
      throw new Error('Unable to spawn enemy for HUD score test');
    }

    const body = enemy.body;
    body.enable = true;
    body.reset(player.x, player.y - 120);
    body.setVelocity(0, 0);
  });
}

async function spawnEnemyOnPlayer(page: Page): Promise<void> {
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    const player = scene.player;
    const enemy = scene.enemySpawner.spawnEnemy();

    if (!enemy) {
      throw new Error('Unable to spawn enemy for HUD health test');
    }

    const body = enemy.body;
    body.enable = true;
    body.reset(player.x, player.y);
    body.setVelocity(0, 0);
  });
}

async function waitForHealthBelow(page: Page, health: number): Promise<void> {
  await page.waitForFunction(
    (previousHealth) => ((window as any).__GAME_STATE__?.playerHealth ?? 0) < previousHealth,
    health,
    { timeout: 2000 }
  );
}

test.describe('HUD', () => {
  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test('M-001: HUDScene runs in parallel with GameScene', async ({ page }) => {
    await startGame(page);

    const state = await getGameState(page);

    expect(state.scene).toBe('GameScene');
    expect(state.hudVisible).toBe(true);
  });

  test('M-002 and S-002: score updates while HUD remains visible', async ({ page }) => {
    await startGame(page);

    const before = await getGameState(page);
    const beforeEnemies = before.enemies as EnemiesState;
    await spawnEnemyInBulletPath(page);
    await pressKey(page, 'Space', 100);
    await page.waitForFunction(
      (destroyedBefore) =>
        ((window as any).__GAME_STATE__?.enemies?.totalDestroyed ?? 0) > destroyedBefore,
      beforeEnemies.totalDestroyed,
      { timeout: 3000 }
    );
    await page.screenshot({ path: `${ARTIFACT_DIR}/hud-action.png` });

    const after = await getGameState(page);
    expect(after.score).toBeGreaterThan(before.score);
    expect(after.hudVisible).toBe(true);
  });

  test('M-003: health updates while HUD remains visible', async ({ page }) => {
    await startGame(page);

    const before = await getGameState(page);
    await spawnEnemyOnPlayer(page);
    await waitForHealthBelow(page, before.playerHealth as number);

    const after = await getGameState(page);
    expect(after.playerHealth).toBeLessThan(before.playerHealth as number);
    expect(after.hudVisible).toBe(true);
  });

  test('M-004 and S-001: wave placeholder is present in the HUD screenshot', async ({
    page,
  }) => {
    await startGame(page);
    await page.screenshot({ path: `${ARTIFACT_DIR}/hud.png` });

    const state = await getGameState(page);
    expect(state.hudVisible).toBe(true);
  });

  test('M-005: HUD does not block movement or shooting', async ({ page }) => {
    await startGame(page);

    const before = await getGameState(page);
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowRight');
    await pressKey(page, 'Space', 100);

    const after = await getGameState(page);
    const beforePosition = before.playerPosition as PlayerPosition;
    const afterPosition = after.playerPosition as PlayerPosition;
    const beforeBullets = before.playerBullets as PlayerBulletsState;
    const afterBullets = after.playerBullets as PlayerBulletsState;

    expect(afterPosition.x).toBeGreaterThan(beforePosition.x);
    expect(afterBullets.activeCount).toBeGreaterThan(beforeBullets.activeCount);
    expect(after.hudVisible).toBe(true);
  });
});
