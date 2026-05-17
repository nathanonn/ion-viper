import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { ENEMY_PROJECTILE } from '../../src/game/configs/constants';
import { ENEMY_TYPE_CONFIGS, type EnemyType } from '../../src/game/data/enemies';
import { getGameState, pressKey, waitForGameReady, waitForScene } from './helpers';

const ARTIFACT_DIR = 'goals/10-enemy-archetypes/test-artifacts';

interface EnemyTypesState {
  activeBasic: number;
  activeShooter: number;
  activeCharger: number;
  lastSpawnedType: string;
}

interface EnemyProjectileState {
  activeCount: number;
}

interface EnemiesState {
  activeCount: number;
  totalDestroyed: number;
  samplePosition: { x: number; y: number };
}

async function startGame(page: Page): Promise<void> {
  await page.goto('/');
  await waitForGameReady(page);
  await waitForScene(page, 'MenuScene');
  await pressKey(page, 'Space', 100);
  await waitForScene(page, 'GameScene');
}

async function getEnemyTypes(page: Page): Promise<EnemyTypesState> {
  const state = await getGameState(page);
  return state.enemyTypes as EnemyTypesState;
}

async function getEnemyProjectiles(page: Page): Promise<EnemyProjectileState> {
  const state = await getGameState(page);
  return state.enemyProjectiles as EnemyProjectileState;
}

async function getEnemies(page: Page): Promise<EnemiesState> {
  const state = await getGameState(page);
  return state.enemies as EnemiesState;
}

async function stopWavesAndRecycleEnemies(page: Page): Promise<void> {
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    scene.waveSystem.started = false;
    scene.enemySpawner.getGroup().getChildren().forEach((enemy: any) => {
      if (enemy.active) {
        enemy.recycle();
      }
    });
  });
}

async function spawnIsolatedEnemy(
  page: Page,
  type: EnemyType,
  options: { x?: number; y?: number; velocityX?: number; velocityY?: number } = {}
): Promise<void> {
  await stopWavesAndRecycleEnemies(page);
  await page.evaluate(
    ({ enemyType, spawnOptions }) => {
      const game = (window as any).__PHASER_GAME__;
      const scene = game.scene.getScene('GameScene') as any;
      const enemy = scene.enemySpawner.spawnEnemy({
        type: enemyType,
        getPlayerPosition: () => scene.player.getPosition(),
      });

      if (!enemy) {
        throw new Error(`Unable to spawn ${enemyType} enemy`);
      }

      const body = enemy.body;
      body.enable = true;
      body.reset(spawnOptions.x ?? enemy.x, spawnOptions.y ?? enemy.y);
      if (spawnOptions.velocityX !== undefined || spawnOptions.velocityY !== undefined) {
        body.setVelocity(spawnOptions.velocityX ?? 0, spawnOptions.velocityY ?? 0);
      }
    },
    { enemyType: type, spawnOptions: options }
  );

  const countField =
    type === 'basic' ? 'activeBasic' : type === 'shooter' ? 'activeShooter' : 'activeCharger';
  await page.waitForFunction(
    (field) => ((window as any).__GAME_STATE__?.enemyTypes?.[field] ?? 0) === 1,
    countField,
    { timeout: 1000 }
  );
}

async function getActiveEnemyHealth(page: Page, type: EnemyType): Promise<number> {
  return page.evaluate((enemyType) => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    const enemy = scene.enemySpawner
      .getGroup()
      .getChildren()
      .find((candidate: any) => candidate.active && candidate.getType() === enemyType);

    return enemy?.getHealth() ?? 0;
  }, type);
}

test.describe('Enemy archetypes', () => {
  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test('M-001 and S-001: basic, shooter, and charger enemy types spawn', async ({ page }) => {
    await startGame(page);

    const observed = new Set<string>();
    const deadline = Date.now() + 5000;
    while (Date.now() < deadline && observed.size < 3) {
      const types = await getEnemyTypes(page);
      if (types.lastSpawnedType !== 'none') {
        observed.add(types.lastSpawnedType);
      }
      await page.waitForTimeout(100);
    }

    const types = await getEnemyTypes(page);
    expect(observed).toEqual(new Set(['basic', 'shooter', 'charger']));
    expect(types.activeBasic + types.activeShooter + types.activeCharger).toBeGreaterThan(0);
    await page.screenshot({ path: `${ARTIFACT_DIR}/enemy-types.png` });
  });

  test('M-002: basic enemy keeps downward drift behavior', async ({ page }) => {
    await startGame(page);
    await spawnIsolatedEnemy(page, 'basic', {
      x: 240,
      y: 40,
      velocityY: ENEMY_TYPE_CONFIGS.basic.speed,
    });

    const before = await getEnemies(page);
    await page.waitForTimeout(500);
    const after = await getEnemies(page);

    expect(before.activeCount).toBe(1);
    expect(after.samplePosition.y).toBeGreaterThan(before.samplePosition.y);
  });

  test('M-003 and S-002: shooter enemies fire from a bounded projectile pool', async ({
    page,
  }) => {
    await startGame(page);
    await spawnIsolatedEnemy(page, 'shooter', { x: 200, y: 80, velocityX: 0, velocityY: 0 });

    await page.waitForFunction(
      () => ((window as any).__GAME_STATE__?.enemyProjectiles?.activeCount ?? 0) > 0,
      undefined,
      { timeout: 3500 }
    );

    const types = await getEnemyTypes(page);
    const projectiles = await getEnemyProjectiles(page);
    expect(types.activeShooter).toBe(1);
    expect(projectiles.activeCount).toBeGreaterThan(0);
    expect(projectiles.activeCount).toBeLessThanOrEqual(ENEMY_PROJECTILE.MAX_PROJECTILES);
    await page.screenshot({ path: `${ARTIFACT_DIR}/enemy-projectiles.png` });
  });

  test('M-004: charger telegraphs before accelerating toward the player', async ({ page }) => {
    await startGame(page);
    await spawnIsolatedEnemy(page, 'charger', { x: 140, y: 70 });

    await page.waitForTimeout(100);
    const earlyStart = await getEnemies(page);
    await page.waitForTimeout(250);
    const earlyEnd = await getEnemies(page);
    const earlyDistance = earlyEnd.samplePosition.y - earlyStart.samplePosition.y;

    await page.waitForTimeout(800);
    const lateStart = await getEnemies(page);
    await page.waitForTimeout(250);
    const lateEnd = await getEnemies(page);
    const lateDistance = lateEnd.samplePosition.y - lateStart.samplePosition.y;

    expect((await getEnemyTypes(page)).activeCharger).toBe(1);
    expect(earlyDistance).toBeGreaterThan(0);
    expect(lateDistance).toBeGreaterThan(earlyDistance * 3);
    expect(lateEnd.samplePosition.x).toBeGreaterThan(earlyEnd.samplePosition.x);
  });

  test('M-005: type health and score values affect combat outcomes', async ({ page }) => {
    await startGame(page);
    const before = await getGameState(page);
    const beforeEnemies = before.enemies as EnemiesState;
    const player = before.playerPosition as { x: number; y: number };
    const config = ENEMY_TYPE_CONFIGS.shooter;

    await spawnIsolatedEnemy(page, 'shooter', {
      x: player.x,
      y: player.y - 120,
      velocityX: 0,
      velocityY: 0,
    });

    await pressKey(page, 'Space', 80);
    await page.waitForFunction(
      () => {
        const game = (window as any).__PHASER_GAME__;
        const scene = game.scene.getScene('GameScene') as any;
        const enemy = scene.enemySpawner
          .getGroup()
          .getChildren()
          .find((candidate: any) => candidate.active && candidate.getType() === 'shooter');
        return enemy?.getHealth() === 1;
      },
      undefined,
      { timeout: 3000 }
    );

    expect(await getActiveEnemyHealth(page, 'shooter')).toBe(config.health - 1);
    expect(((await getGameState(page)).enemies as EnemiesState).totalDestroyed).toBe(
      beforeEnemies.totalDestroyed
    );

    await pressKey(page, 'Space', 80);
    await page.waitForFunction(
      (destroyedBefore) =>
        ((window as any).__GAME_STATE__?.enemies?.totalDestroyed ?? 0) > destroyedBefore,
      beforeEnemies.totalDestroyed,
      { timeout: 3000 }
    );

    const after = await getGameState(page);
    expect(after.score).toBe(before.score + config.scoreValue);
  });

  test('M-006: state bridge reports enemy projectile and type counts', async ({ page }) => {
    await startGame(page);

    const types = await getEnemyTypes(page);
    const projectiles = await getEnemyProjectiles(page);

    expect(typeof projectiles.activeCount).toBe('number');
    expect(typeof types.activeBasic).toBe('number');
    expect(typeof types.activeShooter).toBe('number');
    expect(typeof types.activeCharger).toBe('number');
    expect(typeof types.lastSpawnedType).toBe('string');
  });
});
