# VERIFY.md - Boss Fight

## 1. Setup

Before running any checks:

1. Run `npm install` if dependencies are missing.
2. Confirm `src/state-bridge.ts` exposes `window.__GAME_STATE__`.
3. Confirm helpers exist in `tests/game/helpers.ts`.
4. Confirm Goal 11 tests pass first.

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

### Check M-001 - AC-12.1: Boss starts after final regular wave

**Scenario**: Clear regular waves and observe boss start.
**State bridge fields**: `currentWave`, `waveCount`, `gameWon`, `boss`
**Actions**:
1. Start `GameScene`.
2. Clear regular waves using gameplay or controlled test helpers.
3. Read state bridge when regular waves are done.
**Expected**: `boss.active` is true and `gameWon` is false until boss defeat.
**Maps to**: AC-12.1, AC-12.2

### Check M-002 - AC-12.3: Boss health decreases and health bar state updates

**Scenario**: Damage the active boss with player bullets.
**State bridge fields**: `boss`, `playerBullets`
**Actions**:
1. Start boss encounter.
2. Record `boss.health`.
3. Fire at the boss.
4. Read `boss.health` again.
**Expected**: Boss health decreases and remains between 0 and `boss.maxHealth`.
**Maps to**: AC-12.3, AC-12.5, AC-12.7

### Check M-003 - AC-12.4: Boss phase changes

**Scenario**: Damage the boss through health thresholds.
**State bridge fields**: `boss`, `enemyProjectiles`
**Actions**:
1. Start boss encounter.
2. Damage boss below configured phase thresholds.
3. Sample `boss.phase` and enemy projectile activity.
**Expected**: Boss phase advances to at least phase 2 and phase 3 during the fight; attack pressure changes.
**Maps to**: AC-12.4, AC-12.7

### Check M-004 - AC-12.6: Boss defeat transitions to victory

**Scenario**: Defeat the boss.
**State bridge fields**: `boss`, `gameWon`, `victoryVisible`, `scene`
**Actions**:
1. Start boss encounter.
2. Damage the boss until health reaches 0.
3. Wait for scene transition.
4. Read state bridge.
**Expected**: `boss.defeated` is true, `gameWon` is true, `victoryVisible` is true, and the active scene is VictoryScene or equivalent victory state.
**Maps to**: AC-12.6, AC-12.7

### Check M-005 - AC-12.5: Ion Blast damages boss

**Scenario**: Activate Ion Blast during boss and fire at the boss.
**State bridge fields**: `ionBlast`, `boss`, `playerBullets`
**Actions**:
1. Start boss encounter with Ion Blast available or active.
2. Record boss health.
3. Fire Ion Blast shots at the boss.
4. Read boss health again.
**Expected**: Ion Blast projectiles damage the boss without bypassing pool limits.
**Maps to**: AC-12.5

## 5. Manual Smoke (SHOULD tier)

Screenshots are saved to `goals/12-boss-fight/test-artifacts/`.

### Check S-001 - Visual: Boss encounter

**Scenario**: Capture the boss active with health bar visible.
**Capture**: `page.screenshot({ path: 'goals/12-boss-fight/test-artifacts/boss-active.png' })`
**Human checks**: Boss is prominent, health bar is readable, and attack space is visible.
**Maps to**: AC-12.2, AC-12.3

### Check S-002 - Visual: Victory screen

**Scenario**: Capture VictoryScene after boss defeat.
**Capture**: `page.screenshot({ path: 'goals/12-boss-fight/test-artifacts/victory-screen.png' })`
**Human checks**: Victory state is clear and not confused with GameOverScene.
**Maps to**: AC-12.6

## 6. Evidence Collection

```bash
npx playwright test tests/game/boss-fight.spec.ts
npm test
npx tsc --noEmit
```

Save test output to `goals/12-boss-fight/test-artifacts/test-output.txt`.

## 7. Regression

Run all previous goals' tests:

```bash
npm test
```

Existing wave win-condition tests must be updated to reflect the new boss gate: clearing waves starts boss; defeating boss wins.

## 8. Evidence Format

/goal must add final evidence to `goals/12-boss-fight/PROGRESS.md` before marking complete.

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
