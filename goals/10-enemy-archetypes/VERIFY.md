# VERIFY.md - Enemy Archetypes

## 1. Setup

Before running any checks:

1. Run `npm install` if dependencies are missing.
2. Confirm `src/state-bridge.ts` exposes `window.__GAME_STATE__`.
3. Confirm helpers exist in `tests/game/helpers.ts`.
4. Confirm Goal 09 tests pass first.

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

### Check M-001 - AC-10.1: Three enemy types spawn

**Scenario**: Play through enough wave time to observe all configured enemy types.
**State bridge fields**: `enemyTypes`, `enemies`
**Actions**:
1. Start `GameScene`.
2. Let waves spawn enemies long enough to include basic, shooter, and charger types.
3. Sample `enemyTypes.lastSpawnedType` and active type counts over time.
**Expected**: Basic, shooter, and charger are all observed through state bridge samples.
**Maps to**: AC-10.1, AC-10.6

### Check M-002 - AC-10.2: Basic behavior remains downward drift

**Scenario**: Observe a basic enemy position over time.
**State bridge fields**: `enemies`, `enemyTypes`
**Actions**:
1. Start `GameScene`.
2. Wait for a basic enemy sample.
3. Record `enemies.samplePosition.y`.
4. Wait 500ms and record again.
**Expected**: Basic enemy y-position increases as it drifts downward.
**Maps to**: AC-10.2

### Check M-003 - AC-10.3: Shooter enemies fire pooled projectiles

**Scenario**: Wait for a shooter enemy and observe enemy projectile activity.
**State bridge fields**: `enemyTypes`, `enemyProjectiles`
**Actions**:
1. Start `GameScene`.
2. Wait until a shooter enemy is active.
3. Wait through its fire interval.
4. Read `enemyProjectiles.activeCount`.
**Expected**: Enemy projectile active count becomes greater than 0 and remains bounded.
**Maps to**: AC-10.3, AC-10.6

### Check M-004 - AC-10.4: Charger behavior changes speed after telegraph

**Scenario**: Observe a charger enemy before and after its charge delay.
**State bridge fields**: `enemyTypes`, `enemies`
**Actions**:
1. Start `GameScene`.
2. Wait until a charger enemy is active.
3. Record sample position before and after the charge delay.
4. Compare movement distance over equal windows if the implementation exposes enough data.
**Expected**: Charger accelerates or moves toward the player after a readable delay.
**Maps to**: AC-10.4

### Check M-005 - AC-10.5: Type health and score affect combat

**Scenario**: Shoot enemies and verify score/health behavior matches type data.
**State bridge fields**: `score`, `enemies`, `enemyTypes`, `playerBullets`
**Actions**:
1. Start `GameScene`.
2. Destroy at least one enemy.
3. Compare score increase to the configured type score value.
4. For a tougher enemy, verify it can require more than one hit unless Ion Blast is active.
**Expected**: Score and destruction behavior match enemy type configuration.
**Maps to**: AC-10.5

## 5. Manual Smoke (SHOULD tier)

Screenshots are saved to `goals/10-enemy-archetypes/test-artifacts/`.

### Check S-001 - Visual: Three enemy silhouettes

**Scenario**: Capture gameplay with multiple enemy types active.
**Capture**: `page.screenshot({ path: 'goals/10-enemy-archetypes/test-artifacts/enemy-types.png' })`
**Human checks**: Enemy types are visually distinguishable enough for playtesting.
**Maps to**: AC-10.1

### Check S-002 - Visual: Enemy projectile pattern

**Scenario**: Capture a shooter enemy firing.
**Capture**: `page.screenshot({ path: 'goals/10-enemy-archetypes/test-artifacts/enemy-projectiles.png' })`
**Human checks**: Enemy shots are visible, dodgeable, and distinct from player shots.
**Maps to**: AC-10.3

## 6. Evidence Collection

```bash
npx playwright test tests/game/enemy-archetypes.spec.ts
npm test
npx tsc --noEmit
```

Save test output to `goals/10-enemy-archetypes/test-artifacts/test-output.txt`.

## 7. Regression

Run all previous goals' tests:

```bash
npm test
```

Existing enemy and wave tests may need updates for enemy health or mixed enemy types, but their behavioral intent must remain covered.

## 8. Evidence Format

/goal must add final evidence to `goals/10-enemy-archetypes/PROGRESS.md` before marking complete.

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
