import { mkdirSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { BOSS } from '../../src/game/configs/constants';
import { getGameState, pressKey, waitForGameReady, waitForScene } from './helpers';

const ARTIFACT_DIR = 'goals/12-boss-fight/test-artifacts';

interface BossState {
  active: boolean;
  health: number;
  maxHealth: number;
  phase: number;
  defeated: boolean;
}

async function startGame(page: Page): Promise<void> {
  await page.goto('http://127.0.0.1:8080/');
  await waitForGameReady(page);
  await waitForScene(page, 'MenuScene');
  await pressKey(page, 'Space', 100);
  await waitForScene(page, 'GameScene');
}

async function getBossState(page: Page): Promise<BossState> {
  const state = await getGameState(page);
  return state.boss as BossState;
}

async function forceFinalRegularWaveClear(page: Page): Promise<void> {
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    const waveSystem = scene.waveSystem;
    const waves = waveSystem.waves as { enemyCount: number }[];
    const finalWave = waves[waves.length - 1];

    for (const enemy of scene.enemySpawner.getGroup().getChildren()) {
      if (enemy.active) {
        scene.enemySpawner.destroyEnemy(enemy);
      }
    }

    waveSystem.currentWaveIndex = waves.length - 1;
    waveSystem.spawnedInWave = finalWave.enemyCount;
    waveSystem.clearedInWave = finalWave.enemyCount - 1;
    waveSystem.regularWavesComplete = false;
    waveSystem.gameWon = false;
    waveSystem.onEnemyCleared();
    scene.startBossIfRegularWavesComplete();
    scene.publishWaveState();
    scene.publishEnemyState();
    scene.publishBossState();
  });

  await page.waitForFunction(
    () =>
      (window as any).__GAME_STATE__?.boss?.active === true &&
      (window as any).__GAME_STATE__?.gameWon === false,
    undefined,
    { timeout: 2000 }
  );
}

async function firePlayerBulletAtBoss(page: Page): Promise<void> {
  await page.evaluate((bossHeight) => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    const boss = scene.bossSystem.getBoss();
    const bullet = scene.playerWeapon.getGroup().getFirstDead(false);

    if (!bullet) {
      throw new Error('No pooled player bullet available');
    }

    bullet.fire(boss.x, boss.y + bossHeight / 2 + 16, 0);
  }, BOSS.HEIGHT);
}

async function damageBossDirectly(page: Page, amount: number): Promise<void> {
  await page.evaluate((damageAmount) => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    scene.bossSystem.damageBoss(damageAmount);
    scene.publishBossState();
    scene.publishWaveState();
  }, amount);
}

async function recycleEnemyProjectiles(page: Page): Promise<void> {
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;

    for (const projectile of scene.enemyProjectileSystem.getGroup().getChildren()) {
      projectile.recycle();
    }
    scene.publishEnemyState();
  });
}

async function sampleBossAttackPressure(page: Page, phase: 1 | 2 | 3): Promise<number> {
  await recycleEnemyProjectiles(page);
  await page.evaluate(({ targetPhase, fireIntervalMs }) => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    const boss = scene.bossSystem.getBoss();

    boss.setPhase(targetPhase);
    scene.bossSystem.phase = targetPhase;
    scene.bossSystem.attackElapsedMs = fireIntervalMs;
    scene.bossSystem.update(16);
    scene.publishEnemyState();
    scene.publishBossState();
  }, { targetPhase: phase, fireIntervalMs: BOSS.PHASES[phase].FIRE_INTERVAL_MS });

  const state = await getGameState(page);
  return (state.enemyProjectiles as { activeCount: number }).activeCount;
}

async function forceIonBlastActive(page: Page): Promise<void> {
  await page.evaluate(() => {
    const game = (window as any).__PHASER_GAME__;
    const scene = game.scene.getScene('GameScene') as any;
    scene.powerUpSystem.activateIonBlast();
    scene.publishIonBlastState();
  });
}

test.describe('Boss fight', () => {
  test.beforeAll(() => {
    mkdirSync(ARTIFACT_DIR, { recursive: true });
  });

  test('M-001 and S-001: final regular wave clear starts boss instead of winning', async ({
    page,
  }) => {
    await startGame(page);
    await forceFinalRegularWaveClear(page);

    const state = await getGameState(page);
    const boss = state.boss as BossState;

    expect(boss.active).toBe(true);
    expect(boss.defeated).toBe(false);
    expect(boss.health).toBe(boss.maxHealth);
    expect(boss.phase).toBe(1);
    expect(state.gameWon).toBe(false);
    await page.screenshot({ path: `${ARTIFACT_DIR}/boss-active.png` });
  });

  test('M-002: player bullets damage boss and HUD bar updates', async ({ page }) => {
    await startGame(page);
    await forceFinalRegularWaveClear(page);

    const before = await getBossState(page);
    await firePlayerBulletAtBoss(page);
    await page.waitForFunction(
      (initialHealth) => ((window as any).__GAME_STATE__?.boss?.health ?? 0) < initialHealth,
      before.health,
      { timeout: 2000 }
    );
    const after = await getBossState(page);
    const bossHud = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const hud = game.scene.getScene('HUDScene') as any;
      return {
        labelVisible: hud.bossLabel.visible,
        barVisible: hud.bossBarFill.visible,
        barWidth: hud.bossBarFill.displayWidth,
      };
    });

    expect(after.health).toBeLessThan(before.health);
    expect(after.health).toBeGreaterThanOrEqual(0);
    expect(after.health).toBeLessThanOrEqual(after.maxHealth);
    expect(bossHud.labelVisible).toBe(true);
    expect(bossHud.barVisible).toBe(true);
    expect(bossHud.barWidth).toBeLessThan(260);

    // Regression: a single non-fatal hit must not recycle the boss sprite.
    // Previously the overlap handler had the bullet/boss args swapped,
    // causing the boss sprite to be recycled on first contact while the
    // BossSystem still considered it alive.
    const bossSprite = await page.evaluate(() => {
      const game = (window as any).__PHASER_GAME__;
      const scene = game.scene.getScene('GameScene') as any;
      const boss = scene.bossSystem.getBoss();
      return {
        active: boss.active,
        visible: boss.visible,
        bodyEnabled: boss.body?.enable,
      };
    });
    expect(bossSprite.active).toBe(true);
    expect(bossSprite.visible).toBe(true);
    expect(bossSprite.bodyEnabled).toBe(true);
    expect(after.active).toBe(true);
    expect(after.defeated).toBe(false);
  });

  test('M-003: boss advances through three phases with higher projectile pressure', async ({
    page,
  }) => {
    await startGame(page);
    await forceFinalRegularWaveClear(page);

    const phase1Pressure = await sampleBossAttackPressure(page, 1);
    await damageBossDirectly(page, BOSS.MAX_HEALTH - Math.floor(BOSS.MAX_HEALTH * 0.55));
    const phase2 = await getBossState(page);
    const phase2Pressure = await sampleBossAttackPressure(page, 2);
    await damageBossDirectly(page, Math.ceil(BOSS.MAX_HEALTH * 0.25));
    const phase3 = await getBossState(page);
    const phase3Pressure = await sampleBossAttackPressure(page, 3);

    expect(phase2.phase).toBe(2);
    expect(phase3.phase).toBe(3);
    expect(phase1Pressure).toBe(1);
    expect(phase2Pressure).toBe(2);
    expect(phase3Pressure).toBe(3);
  });

  test('M-004 and S-002: defeating boss transitions to VictoryScene', async ({ page }) => {
    await startGame(page);
    await forceFinalRegularWaveClear(page);

    const boss = await getBossState(page);
    await damageBossDirectly(page, boss.health);
    await waitForScene(page, 'VictoryScene', 3000);
    await page.screenshot({ path: `${ARTIFACT_DIR}/victory-screen.png` });

    const state = await getGameState(page);
    const defeatedBoss = state.boss as BossState;

    expect(defeatedBoss.defeated).toBe(true);
    expect(defeatedBoss.health).toBe(0);
    expect(state.gameWon).toBe(true);
    expect(state.victoryVisible).toBe(true);
    expect(state.scene).toBe('VictoryScene');
  });

  test('M-005: Ion Blast projectiles damage boss without exceeding bullet pool', async ({
    page,
  }) => {
    await startGame(page);
    await forceFinalRegularWaveClear(page);
    await forceIonBlastActive(page);

    const before = await getBossState(page);
    const ionBlast = (await getGameState(page)).ionBlast as {
      active: boolean;
      projectileCount: number;
    };
    await pressKey(page, 'Space', 80);
    await page.waitForFunction(
      (initialHealth) => ((window as any).__GAME_STATE__?.boss?.health ?? 0) < initialHealth,
      before.health,
      { timeout: 2500 }
    );
    const after = await getGameState(page);
    const afterBoss = after.boss as BossState;
    const bullets = after.playerBullets as { activeCount: number };

    expect(ionBlast.active).toBe(true);
    expect(ionBlast.projectileCount).toBeGreaterThan(1);
    expect(afterBoss.health).toBeLessThan(before.health);
    expect(bullets.activeCount).toBeLessThanOrEqual(8);
  });
});
