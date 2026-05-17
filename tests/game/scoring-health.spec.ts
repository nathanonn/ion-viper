import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { getGameState, pressKey, waitForGameReady, waitForScene } from './helpers';

const ARTIFACT_DIR = 'goals/04-scoring-health/test-artifacts';

interface EnemiesState {
  activeCount: number;
  totalDestroyed: number;
}

async function startGame(page: Page): Promise<void> {
  await page.goto('/');
  await waitForGameReady(page);
  await waitForScene(page, 'MenuScene');
  await pressKey(page, 'Space', 100);
  await waitForScene(page, 'GameScene');
}

async function spawnEnemyInBulletPath(page: Page): Promise<number> {
  return page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    const player = scene.player;
    const enemy = scene.enemySpawner.spawnEnemy();

    if (!enemy) {
      throw new Error('Unable to spawn enemy for score test');
    }

    const body = enemy.body;
    body.enable = true;
    body.reset(player.x, player.y - 120);
    body.setVelocity(0, 0);

    return enemy.getScoreValue();
  });
}

async function spawnEnemyOnPlayer(page: Page): Promise<void> {
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    const player = scene.player;
    const enemy = scene.enemySpawner.spawnEnemy();

    if (!enemy) {
      throw new Error('Unable to spawn enemy for contact test');
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

async function recycleActiveEnemies(page: Page): Promise<void> {
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    const enemies = scene.enemySpawner.getGroup().getChildren();

    enemies.forEach((enemy: any) => {
      if (enemy.active) {
        enemy.recycle();
      }
    });
  });
}

test.describe('Scoring and Health', () => {
  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test('M-001: enemy kills increase score by enemy score value', async ({ page }) => {
    await startGame(page);

    const before = await getGameState(page);
    const beforeEnemies = before.enemies as EnemiesState;
    const scoreValue = await spawnEnemyInBulletPath(page);

    await pressKey(page, 'Space', 100);
    await page.waitForFunction(
      (initialDestroyed) =>
        ((window as any).__GAME_STATE__?.enemies?.totalDestroyed ?? 0) > initialDestroyed,
      beforeEnemies.totalDestroyed,
      { timeout: 3000 }
    );

    const after = await getGameState(page);
    const afterEnemies = after.enemies as EnemiesState;
    expect(afterEnemies.totalDestroyed).toBeGreaterThan(beforeEnemies.totalDestroyed);
    expect(after.score).toBe(before.score + scoreValue);
  });

  test('M-002 and S-001: enemy contact damages player and shows damage feedback', async ({
    page,
  }) => {
    await startGame(page);

    const before = await getGameState(page);
    await spawnEnemyOnPlayer(page);
    await waitForHealthBelow(page, before.playerHealth as number);
    await recycleActiveEnemies(page);
    await page.waitForTimeout(20);
    await page.screenshot({ path: `${ARTIFACT_DIR}/damage-flash.png` });

    const after = await getGameState(page);
    expect(after.playerHealth).toBe((before.playerHealth as number) - 1);
  });

  test('M-003: invulnerability prevents repeated damage during the damage window', async ({
    page,
  }) => {
    await startGame(page);

    const before = await getGameState(page);
    await spawnEnemyOnPlayer(page);
    await waitForHealthBelow(page, before.playerHealth as number);
    const damaged = await getGameState(page);

    await page.waitForTimeout(400);
    const stillInvulnerable = await getGameState(page);

    expect(stillInvulnerable.playerHealth).toBe(damaged.playerHealth);
  });

  test('M-004 and S-002: zero health reaches GameOverScene with gameOver true', async ({
    page,
  }) => {
    await startGame(page);

    const before = await getGameState(page);
    await spawnEnemyOnPlayer(page);
    await waitForHealthBelow(page, before.playerHealth as number);
    await waitForHealthBelow(page, (before.playerHealth as number) - 1);
    await waitForHealthBelow(page, (before.playerHealth as number) - 2);
    await waitForScene(page, 'GameOverScene', 4000);
    await page.screenshot({ path: `${ARTIFACT_DIR}/game-over.png` });

    const after = await getGameState(page);
    expect(after.playerHealth).toBe(0);
    expect(after.gameOver).toBe(true);
    expect(after.scene).toBe('GameOverScene');
  });

  test('M-005: state bridge reports score, playerHealth, and gameOver', async ({ page }) => {
    await startGame(page);

    const state = await getGameState(page);

    expect(typeof state.score).toBe('number');
    expect(typeof state.playerHealth).toBe('number');
    expect(typeof state.gameOver).toBe('boolean');
    expect(state.playerHealth).toBeGreaterThan(0);
    expect(state.gameOver).toBe(false);
  });
});
