# VERIFY.md - Player Weapons

## 1. Setup

Before running any checks:

1. Run `npm install` if dependencies are not present.
2. Complete Goals 00 and 01.
3. Confirm player movement and `playerPosition` state bridge fields work.
4. Confirm `pressKey()` can hold SPACE.

## 2. Dev Server

- **Start command**: `npm run dev`
- **URL**: `http://localhost:8080`
- **Auto-start**: `npm test` starts the dev server through Playwright.

## 3. Verification Tiers

| Tier | Label | Method | Required? |
|------|-------|--------|-----------|
| **MUST** | State bridge assertions | Playwright reads `window.__GAME_STATE__` | Yes |
| **SHOULD** | Visual screenshots | Human-reviewed screenshots | Yes |
| **NICE** | Edge cases | Pool exhaustion and long hold checks | No |

## 4. Automated Checks (MUST tier)

### Check M-001 - AC-02.1: SPACE fires a bullet

**Scenario**: Start GameScene and press SPACE.
**State bridge fields**: `playerBullets`
**Actions**:
1. Start GameScene.
2. Record `playerBullets.activeCount`.
3. Press SPACE for 100 ms.
4. Read active count again.
**Expected**: Active bullet count increases.
**Maps to**: AC-02.1, AC-02.5

### Check M-002 - AC-02.2: bullets use a capped pool

**Scenario**: Hold SPACE long enough to create many bullets.
**State bridge fields**: `playerBullets`
**Actions**:
1. Start GameScene.
2. Hold SPACE for several seconds.
3. Read active count.
**Expected**: Active count never exceeds the configured max pool size.
**Maps to**: AC-02.2

### Check M-003 - AC-02.3: fire rate limits shots

**Scenario**: Hold SPACE briefly and compare active count to fire-rate expectations.
**State bridge fields**: `playerBullets`
**Actions**:
1. Start GameScene.
2. Hold SPACE for less than twice the fire interval.
3. Read active count.
**Expected**: The number of active bullets is consistent with the configured cooldown, not one bullet per frame.
**Maps to**: AC-02.3

### Check M-004 - AC-02.4: bullets recycle offscreen

**Scenario**: Fire bullets and wait long enough for them to leave the top.
**State bridge fields**: `playerBullets`
**Actions**:
1. Start GameScene.
2. Press SPACE.
3. Wait for bullet travel time past the top edge.
4. Read active count.
**Expected**: Active bullet count returns to 0 or decreases as offscreen bullets recycle.
**Maps to**: AC-02.4

### Check M-005 - AC-02.5: state bridge field exists

**Scenario**: Read state after GameScene starts.
**State bridge fields**: `playerBullets`
**Actions**:
1. Start GameScene.
2. Read state.
**Expected**: `playerBullets.activeCount` is a number.
**Maps to**: AC-02.5

## 5. Manual Smoke (SHOULD tier)

Screenshots are saved to `goals/02-player-weapons/test-artifacts/`.

### Check S-001 - Visual: bullets fire upward

**Scenario**: Hold SPACE and capture GameScene with bullets visible.
**Capture**: `page.screenshot({ path: 'goals/02-player-weapons/test-artifacts/bullets.png' })`
**Human checks**: Bullets originate near the player and travel upward.
**Maps to**: AC-02.1

### Check S-002 - Visual: sustained fire is readable

**Scenario**: Hold SPACE for a short burst.
**Capture**: `page.screenshot({ path: 'goals/02-player-weapons/test-artifacts/burst.png' })`
**Human checks**: Bullet spacing is readable and not a solid unbounded stream.
**Maps to**: AC-02.3

## 6. Evidence Collection

```bash
npx playwright test tests/game/player-weapons.spec.ts --config tests/playwright.config.ts
npm test
```

Save test output to `goals/02-player-weapons/test-artifacts/test-output.txt`.

## 7. Regression

Run all previous goals' tests:

```bash
npm test
```

## 8. Evidence Format

/goal must add final evidence to `goals/02-player-weapons/PROGRESS.md` using these tables.

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
