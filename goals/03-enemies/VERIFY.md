# VERIFY.md - Enemies

## 1. Setup

Before running any checks:

1. Run `npm install` if dependencies are not present.
2. Complete Goals 00 through 02.
3. Confirm player bullets can be fired and counted.
4. Confirm state bridge updates each frame.

## 2. Dev Server

- **Start command**: `npm run dev`
- **URL**: `http://localhost:8080`
- **Auto-start**: `npm test` starts the dev server through Playwright.

## 3. Verification Tiers

| Tier | Label | Method | Required? |
|------|-------|--------|-----------|
| **MUST** | State bridge assertions | Playwright reads `window.__GAME_STATE__` | Yes |
| **SHOULD** | Visual screenshots | Human-reviewed screenshots | Yes |
| **NICE** | Edge cases | Spawn interval and pool saturation checks | No |

## 4. Automated Checks (MUST tier)

### Check M-001 - AC-03.1: enemies spawn from the top

**Scenario**: Start GameScene and wait for spawn interval.
**State bridge fields**: `enemies`
**Actions**:
1. Start GameScene.
2. Record `enemies.activeCount`.
3. Wait longer than the configured spawn interval.
4. Read active count again.
**Expected**: Active enemy count increases.
**Maps to**: AC-03.1, AC-03.5

### Check M-002 - AC-03.2: enemies move downward

**Scenario**: Track an enemy position through a debug-friendly state field or test hook.
**State bridge fields**: `enemies`
**Actions**:
1. Start GameScene.
2. Wait for at least one enemy.
3. Record a representative enemy y-position if exposed for tests.
4. Wait 500 ms and read it again.
**Expected**: Enemy y-position increases over time, or the test verifies downward velocity on active enemy bodies.
**Maps to**: AC-03.2

### Check M-003 - AC-03.3: bullets destroy enemies

**Scenario**: Align player under an enemy or use deterministic test spawn, then fire.
**State bridge fields**: `enemies`, `playerBullets`
**Actions**:
1. Start GameScene.
2. Ensure an enemy is in bullet path.
3. Fire until overlap occurs.
4. Read `enemies.totalDestroyed`.
**Expected**: Total destroyed increases and the bullet active count decreases or recycles.
**Maps to**: AC-03.3

### Check M-004 - AC-03.4: offscreen enemies recycle

**Scenario**: Let enemies travel below the bottom edge.
**State bridge fields**: `enemies`
**Actions**:
1. Start GameScene.
2. Wait for enemies to spawn.
3. Wait long enough for enemies to leave the bottom.
4. Read active count.
**Expected**: Enemies that cross the bottom are no longer active.
**Maps to**: AC-03.4

### Check M-005 - AC-03.5: enemy state bridge reports

**Scenario**: Read state during GameScene.
**State bridge fields**: `enemies`
**Actions**:
1. Start GameScene.
2. Read state.
**Expected**: `enemies.activeCount` and `enemies.totalDestroyed` are numbers.
**Maps to**: AC-03.5

## 5. Manual Smoke (SHOULD tier)

Screenshots are saved to `goals/03-enemies/test-artifacts/`.

### Check S-001 - Visual: enemies descending

**Scenario**: Capture GameScene after several enemies spawn.
**Capture**: `page.screenshot({ path: 'goals/03-enemies/test-artifacts/enemies.png' })`
**Human checks**: Enemy placeholders are visible and descending from the top area.
**Maps to**: AC-03.1, AC-03.2

### Check S-002 - Visual: bullet impact moment

**Scenario**: Capture after a bullet-enemy hit or immediately before/after impact.
**Capture**: `page.screenshot({ path: 'goals/03-enemies/test-artifacts/bullet-enemy-hit.png' })`
**Human checks**: Bullets and enemies use readable placeholder colors and do not visually merge.
**Maps to**: AC-03.3

## 6. Evidence Collection

```bash
npx playwright test tests/game/enemies.spec.ts --config tests/playwright.config.ts
npm test
```

Save test output to `goals/03-enemies/test-artifacts/test-output.txt`.

## 7. Regression

Run all previous goals' tests:

```bash
npm test
```

## 8. Evidence Format

/goal must add final evidence to `goals/03-enemies/PROGRESS.md` using these tables.

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
