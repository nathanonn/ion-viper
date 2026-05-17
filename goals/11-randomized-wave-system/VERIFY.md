# VERIFY.md - Randomized Waves

## 1. Setup

Before running any checks:

1. Run `npm install` if dependencies are missing.
2. Confirm `src/state-bridge.ts` exposes `window.__GAME_STATE__`.
3. Confirm helpers exist in `tests/game/helpers.ts`.
4. Confirm Goal 10 tests pass first.

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

### Check M-001 - AC-11.1: Spawn positions vary

**Scenario**: Observe multiple spawns during a wave run.
**State bridge fields**: `waveRandomization`, `enemies`
**Actions**:
1. Start `GameScene`.
2. Wait until `waveRandomization.spawnCount` is at least 5.
3. Read `uniqueSpawnLanes`, `lastSpawnX`, and `previousSpawnX`.
**Expected**: Randomization is enabled and more than one spawn lane has been used.
**Maps to**: AC-11.1, AC-11.5

### Check M-002 - AC-11.2: Recent spacing is fair

**Scenario**: Sample recent spawn spacing.
**State bridge fields**: `waveRandomization`
**Actions**:
1. Start `GameScene`.
2. Wait through several spawns.
3. Read `minimumRecentSpacing`.
**Expected**: Minimum recent spacing is greater than or equal to the configured fairness threshold after enough lanes are available.
**Maps to**: AC-11.2, AC-11.5

### Check M-003 - AC-11.3: Timed waves remain readable

**Scenario**: Let the first mixed wave run.
**State bridge fields**: `currentWave`, `enemies`, `enemyTypes`, `playerHealth`
**Actions**:
1. Start `GameScene`.
2. Play or idle through the first wave's spawn window.
3. Sample enemy counts and player health.
**Expected**: The wave spawns enemies at readable intervals and does not immediately overwhelm or damage the player unfairly.
**Maps to**: AC-11.3

### Check M-004 - AC-11.4: Randomized waves still complete

**Scenario**: Clear enemies through all regular waves using existing test play helpers or controlled firing.
**State bridge fields**: `currentWave`, `waveCount`, `gameWon`, `enemies`
**Actions**:
1. Start `GameScene`.
2. Destroy or clear wave enemies until the final regular wave is complete.
3. Read wave state.
**Expected**: Wave count advances reliably and no wave becomes stuck because of randomization.
**Maps to**: AC-11.4

### Check M-005 - AC-11.6: Prior systems still pass

**Scenario**: Run full regression after randomized timing changes.
**State bridge fields**: all existing fields
**Actions**:
1. Run `npm test`.
2. Inspect failures if any.
**Expected**: All prior tests pass or are updated only to reflect intended randomized wave behavior.
**Maps to**: AC-11.6

## 5. Manual Smoke (SHOULD tier)

Screenshots are saved to `goals/11-randomized-wave-system/test-artifacts/`.

### Check S-001 - Visual: Varied spawn lanes

**Scenario**: Capture gameplay after several enemies have spawned.
**Capture**: `page.screenshot({ path: 'goals/11-randomized-wave-system/test-artifacts/randomized-lanes.png' })`
**Human checks**: Enemies are spread across lanes and do not appear stacked in an unfair clump.
**Maps to**: AC-11.1, AC-11.2

### Check S-002 - Visual: Mixed wave readability

**Scenario**: Capture a mixed wave with different enemy archetypes.
**Capture**: `page.screenshot({ path: 'goals/11-randomized-wave-system/test-artifacts/mixed-wave-readability.png' })`
**Human checks**: Wave pressure is challenging but readable; there is enough space to react.
**Maps to**: AC-11.3

## 6. Evidence Collection

```bash
npx playwright test tests/game/randomized-waves.spec.ts
npm test
npx tsc --noEmit
```

Save test output to `goals/11-randomized-wave-system/test-artifacts/test-output.txt`.

## 7. Regression

Run all previous goals' tests:

```bash
npm test
```

If tests assumed a fixed spawn order, update them to assert fairness metrics and wave completion instead of exact positions.

## 8. Evidence Format

/goal must add final evidence to `goals/11-randomized-wave-system/PROGRESS.md` before marking complete.

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
