# VERIFY.md - Ion Blast Power-Up

## 1. Setup

Before running any checks:

1. Run `npm install` if dependencies are missing.
2. Confirm `src/state-bridge.ts` exposes `window.__GAME_STATE__`.
3. Confirm helpers exist in `tests/game/helpers.ts`.
4. Confirm Playwright can start `npm run dev` on port 8080.
5. Confirm Goal 08 tests pass first.

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

### Check M-001 - AC-09.1: Ion Blast pickup spawns

**Scenario**: Start gameplay and wait for the first Ion Blast pickup opportunity.
**State bridge fields**: `scene`, `ionBlast`
**Actions**:
1. Navigate to `http://localhost:8080`.
2. Start the game and wait for `GameScene`.
3. Wait until an Ion Blast pickup has spawned or is ready to collect using the state bridge contract implemented by /goal.
**Expected**: Ion Blast state exists and the pickup can appear without console errors.
**Maps to**: AC-09.1, AC-09.6

### Check M-002 - AC-09.2: Collecting pickup activates Ion Blast

**Scenario**: Move the player into the pickup and verify activation.
**State bridge fields**: `playerPosition`, `ionBlast`
**Actions**:
1. Start `GameScene`.
2. Navigate the player into the Ion Blast pickup lane.
3. Read state before and after collection.
**Expected**: `ionBlast.active` becomes true and `ionBlast.collectedCount` increases.
**Maps to**: AC-09.2, AC-09.6

### Check M-003 - AC-09.3: Ion Blast fires multiple projectiles

**Scenario**: Fire while Ion Blast is active.
**State bridge fields**: `playerBullets`, `ionBlast`
**Actions**:
1. Activate Ion Blast.
2. Record `playerBullets.activeCount`.
3. Press SPACE long enough for one firing interval.
4. Record `playerBullets.activeCount` and `ionBlast.projectileCount`.
**Expected**: Projectile count per shot is greater than 1 and active bullet count increases by multiple projectiles when pool capacity allows.
**Maps to**: AC-09.3, AC-09.5, AC-09.6

### Check M-004 - AC-09.4: Ion Blast expires

**Scenario**: Wait past the configured Ion Blast duration.
**State bridge fields**: `ionBlast`
**Actions**:
1. Activate Ion Blast.
2. Wait for `ionBlast.remainingMs` to reach 0.
3. Fire once after expiration.
**Expected**: `ionBlast.active` is false and `ionBlast.projectileCount` returns to 1.
**Maps to**: AC-09.4, AC-09.6

### Check M-005 - AC-09.5: Pools stay bounded

**Scenario**: Hold fire during Ion Blast and verify active bullets never exceed the configured pool size.
**State bridge fields**: `playerBullets`, `ionBlast`
**Actions**:
1. Activate Ion Blast.
2. Hold SPACE for multiple firing intervals.
3. Sample `playerBullets.activeCount`.
**Expected**: Active bullet count never exceeds the configured max bullet pool.
**Maps to**: AC-09.5

## 5. Manual Smoke (SHOULD tier)

Screenshots are saved to `goals/09-ion-blast-power-up/test-artifacts/`.

### Check S-001 - Visual: Pickup visible

**Scenario**: Ion Blast pickup is on screen before collection.
**Capture**: `page.screenshot({ path: 'goals/09-ion-blast-power-up/test-artifacts/ion-blast-pickup.png' })`
**Human checks**: Pickup is readable, does not resemble an enemy, and appears in a fair lane.
**Maps to**: AC-09.1

### Check S-002 - Visual: Multi-shot pattern

**Scenario**: Ion Blast is active and player fires.
**Capture**: `page.screenshot({ path: 'goals/09-ion-blast-power-up/test-artifacts/ion-blast-multishot.png' })`
**Human checks**: Multiple player projectiles are visible and the pattern is readable.
**Maps to**: AC-09.3

## 6. Evidence Collection

```bash
npx playwright test tests/game/ion-blast.spec.ts
npm test
npx tsc --noEmit
```

Save test output to `goals/09-ion-blast-power-up/test-artifacts/test-output.txt`.

## 7. Regression

Run all previous goals' tests:

```bash
npm test
```

If prior weapon tests fail, update them only when their old assumption about single-shot firing conflicts with active Ion Blast. Normal weapon behavior outside Ion Blast must remain single-shot.

## 8. Evidence Format

/goal must add final evidence to `goals/09-ion-blast-power-up/PROGRESS.md` before marking complete.

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
