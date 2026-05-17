# VERIFY.md - QC Checkpoint (Final Validation)

## 1. Setup

Before running any checks:

1. Run `npm install` if dependencies are missing.
2. Confirm `src/state-bridge.ts` exposes `window.__GAME_STATE__`.
3. Confirm helpers exist in `tests/game/helpers.ts`.
4. Confirm `tests/playwright.config.ts` starts `npm run dev` on port 8080.
5. Confirm Goals 08 through 13 have been completed and their focused tests pass.

## 2. Dev Server

- **Start command**: `npm run dev`
- **URL**: `http://localhost:8080`
- **Auto-start**: Playwright starts the dev server automatically during `npm test`.

## 3. Verification Tiers

| Tier | Label | Method | Required? |
|------|-------|--------|-----------|
| MUST | State bridge assertions | `page.evaluate(() => window.__GAME_STATE__)` in Playwright | Yes |
| SHOULD | Visual screenshots | `page.screenshot()` for human review | Yes |
| NICE | Edge cases / polish | Optional checks | No |

## 4. Automated Checks (MUST tier)

### Check M-001 - AC-14.1: Full win path and New Game Plus restart

**Scenario**: Complete a full winning play session and restart into the next loop.
**State bridge fields**: `scene`, `gameIdentity`, `ionBlast`, `enemyTypes`, `waveRandomization`, `boss`, `victoryVisible`, `difficulty`, `gameWon`
**Actions**:
1. Navigate to `http://localhost:8080`.
2. Verify menu identity is Ion Viper.
3. Start `GameScene`.
4. Play through regular waves.
5. Defeat the boss.
6. Wait for VictoryScene.
7. Restart into the next loop.
8. Read state bridge in the new GameScene.
**Expected**: Victory is reached, restart enters the next difficulty loop, and gameplay resumes without stale victory or boss state.
**Maps to**: AC-14.1, AC-14.3, AC-14.5

### Check M-002 - AC-14.2: Full loss path and restart

**Scenario**: Trigger player defeat, restart, and verify clean gameplay state.
**State bridge fields**: `scene`, `gameOver`, `playerHealth`, `playerAlive`, `boss`, `victoryVisible`, `difficulty`
**Actions**:
1. Start `GameScene`.
2. Trigger or play into player defeat.
3. Wait for GameOverScene.
4. Press SPACE to restart.
5. Wait for `GameScene`.
6. Read state bridge.
**Expected**: GameOverScene is reachable, restart returns to valid gameplay, and loss restart does not incorrectly increment difficulty loop.
**Maps to**: AC-14.2, AC-14.5

### Check M-003 - AC-14.3: State bridge regression across key states

**Scenario**: Sample state bridge at menu, gameplay, boss, victory, game over, and restart.
**State bridge fields**: all fields
**Actions**:
1. Capture a state snapshot at each major scene/state.
2. Validate every expected field exists and is serializable.
3. Validate fields have values consistent with the current state.
**Expected**: All state bridge fields from Goals 00 through 13 exist, remain serializable, and do not carry stale state.
**Maps to**: AC-14.3, AC-14.5

### Check M-004 - AC-14.4: No console or page errors

**Scenario**: Track diagnostics through win and loss sessions.
**State bridge fields**: none
**Actions**:
1. Use `trackPageDiagnostics(page)` from helpers.
2. Run the full win path.
3. Run the full loss path.
4. Inspect page errors and console errors.
**Expected**: No page errors and no console errors.
**Maps to**: AC-14.4

### Check M-005 - AC-14.6: Fairness and difficulty sanity

**Scenario**: Inspect randomization and difficulty metrics during loop 1 and loop 2.
**State bridge fields**: `waveRandomization`, `difficulty`, `playerHealth`, `enemies`, `boss`
**Actions**:
1. Sample randomized wave metrics during loop 1.
2. Restart into loop 2.
3. Sample difficulty multipliers and early wave pressure.
4. Verify the player has a fair reaction window and the game remains playable.
**Expected**: Randomization spacing is fair; loop 2 is harder than loop 1 but not immediately unwinnable.
**Maps to**: AC-14.6

### Check M-006 - AC-14.7: Full regression suite passes

**Scenario**: Run the complete Playwright suite.
**State bridge fields**: all fields indirectly
**Actions**:
1. Run `npm test`.
2. Run `npx tsc --noEmit`.
**Expected**: Both commands pass without failures.
**Maps to**: AC-14.7

## 5. Manual Smoke (SHOULD tier)

Screenshots are saved to `goals/14-qc-checkpoint/test-artifacts/`.

### Check S-001 - Visual: Ion Viper menu

**Scenario**: Capture the menu after boot.
**Capture**: `page.screenshot({ path: 'goals/14-qc-checkpoint/test-artifacts/menu.png' })`
**Human checks**: Ion Viper branding is clear and polished.
**Maps to**: AC-14.3

### Check S-002 - Visual: Ion Blast and mixed enemies

**Scenario**: Capture gameplay with Ion Blast active and varied enemies present.
**Capture**: `page.screenshot({ path: 'goals/14-qc-checkpoint/test-artifacts/ion-blast-mixed-wave.png' })`
**Human checks**: Projectiles and enemy types are readable and not cluttered.
**Maps to**: AC-14.3, AC-14.6

### Check S-003 - Visual: Boss fight

**Scenario**: Capture the boss fight with health bar visible.
**Capture**: `page.screenshot({ path: 'goals/14-qc-checkpoint/test-artifacts/boss-fight.png' })`
**Human checks**: Boss, health bar, and incoming attacks are visible and readable.
**Maps to**: AC-14.1, AC-14.6

### Check S-004 - Visual: Victory and New Game Plus

**Scenario**: Capture VictoryScene before restarting into loop 2.
**Capture**: `page.screenshot({ path: 'goals/14-qc-checkpoint/test-artifacts/victory-new-game-plus.png' })`
**Human checks**: Victory and next-loop restart are communicated clearly.
**Maps to**: AC-14.1

### Check S-005 - Visual: Game over

**Scenario**: Capture GameOverScene.
**Capture**: `page.screenshot({ path: 'goals/14-qc-checkpoint/test-artifacts/game-over.png' })`
**Human checks**: Loss state is distinct from victory and restart prompt is clear.
**Maps to**: AC-14.2

## 6. Evidence Collection

```bash
npx playwright test tests/game/integration.spec.ts
npm test
npx tsc --noEmit
```

Save test output to `goals/14-qc-checkpoint/test-artifacts/test-output.txt`.

## 7. Regression

Run all prior goals' tests:

```bash
npm test
```

If any previous test fails, determine whether the failure is a real regression or an outdated assumption from earlier goals. Update outdated tests only when the newer goal intentionally changed the behavior and equivalent coverage remains.

## 8. Evidence Format

/goal must add final evidence to `goals/14-qc-checkpoint/PROGRESS.md` before marking complete.

```md
## Final Verification Evidence

### Automated Check Evidence (MUST tier)

| Check ID | AC ID | Expected | Actual | Status |
| -------- | ----- | -------- | ------ | ------ |
|          |       |          |        |        |

### Screenshot Evidence (SHOULD tier)

| Check ID | Screenshot Path | Human Verdict | Notes |
| -------- | --------------- | ------------- | ----- |
|          |                 |               |       |

### Edge Case Evidence (NICE tier)

| Check ID | Expected | Actual | Status |
| -------- | -------- | ------ | ------ |
|          |          |        |        |

### Regression

| Test Suite | Result | Notes |
| ---------- | ------ | ----- |
|            |        |       |

### Acceptance Criteria Summary

| AC ID | Check IDs | Status |
| ----- | --------- | ------ |
|       |           |        |

### Files Changed

- _(populated by /goal)_

### Remaining Risks

- _(populated by /goal, "None known" if clean)_
```
