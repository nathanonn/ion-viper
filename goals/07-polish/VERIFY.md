# VERIFY.md - Polish

## 1. Setup

Before running any checks:

1. Run `npm install` if dependencies are not present.
2. Complete Goals 00 through 06.
3. Confirm gameplay, HUD, waves, win, loss, and state bridge tests pass.
4. Confirm generated assets are present under `public/assets/`.

## 2. Dev Server

- **Start command**: `npm run dev`
- **URL**: `http://localhost:8080`
- **Auto-start**: `npm test` starts the dev server through Playwright.

## 3. Verification Tiers

| Tier | Label | Method | Required? |
|------|-------|--------|-----------|
| **MUST** | State bridge assertions | Playwright reads `window.__GAME_STATE__` | Yes |
| **SHOULD** | Visual and audio smoke | Human-reviewed screenshots and browser evidence | Yes |
| **NICE** | Edge cases | Long-session polish checks | No |

## 4. Automated Checks (MUST tier)

### Check M-001 - AC-07.1: assets load without breaking gameplay

**Scenario**: Boot the game after replacing placeholders.
**State bridge fields**: `scene`, `ready`
**Actions**:
1. Navigate to `http://localhost:8080`.
2. Wait for MenuScene.
3. Press SPACE and wait for GameScene.
4. Watch for page errors.
**Expected**: Game boots, assets load, and no missing-asset errors appear.
**Maps to**: AC-07.1

### Check M-002 - AC-07.2: effects do not break enemy destruction

**Scenario**: Destroy an enemy with particles enabled.
**State bridge fields**: `enemies`, `score`
**Actions**:
1. Start GameScene.
2. Destroy an enemy.
3. Read enemy and score state.
**Expected**: Enemy destruction still increments destroyed count and score.
**Maps to**: AC-07.2, AC-07.6

### Check M-003 - AC-07.3: parallax and shake do not disrupt controls

**Scenario**: Move, shoot, and take damage with polish enabled.
**State bridge fields**: `playerPosition`, `playerBullets`, `playerHealth`
**Actions**:
1. Start GameScene.
2. Move right and fire.
3. Trigger player damage.
4. Read state.
**Expected**: Player still moves, bullets still fire, and health changes correctly.
**Maps to**: AC-07.3, AC-07.6

### Check M-004 - AC-07.4: sound effects are triggered from gameplay events

**Scenario**: Fire, hit an enemy, and take damage.
**State bridge fields**: `playerBullets`, `enemies`, `playerHealth`
**Actions**:
1. Start GameScene after user gesture.
2. Fire a bullet.
3. Destroy an enemy.
4. Damage the player.
**Expected**: Gameplay events still occur and browser console has no audio errors. Manual evidence confirms sound output.
**Maps to**: AC-07.4

### Check M-005 - AC-07.5: music lifecycle works

**Scenario**: Start gameplay and then reach GameOverScene.
**State bridge fields**: `scene`, `gameOver`
**Actions**:
1. Start GameScene.
2. Confirm no audio errors in console.
3. Trigger game over.
4. Wait for GameOverScene.
**Expected**: Music starts after gameplay begins and stops or fades when game over occurs.
**Maps to**: AC-07.5

### Check M-006 - AC-07.6: regression suite passes

**Scenario**: Run the full Playwright suite.
**State bridge fields**: all existing fields
**Actions**:
1. Run `npm test`.
2. Run `npx tsc --noEmit`.
**Expected**: Full test suite and type check pass.
**Maps to**: AC-07.6

## 5. Manual Smoke (SHOULD tier)

Screenshots are saved to `goals/07-polish/test-artifacts/`.

### Check S-001 - Visual: final gameplay

**Scenario**: Capture active gameplay with player, bullets, enemies, HUD, and background.
**Capture**: `page.screenshot({ path: 'goals/07-polish/test-artifacts/final-gameplay.png' })`
**Human checks**: Pixel art is coherent, objects are readable, and HUD does not overlap action.
**Maps to**: AC-07.1, AC-07.3

### Check S-002 - Visual: explosion and damage feedback

**Scenario**: Capture enemy destruction and player damage moments.
**Capture**: `page.screenshot({ path: 'goals/07-polish/test-artifacts/feedback.png' })`
**Human checks**: Particles and shake feel noticeable but do not obscure gameplay.
**Maps to**: AC-07.2, AC-07.3

### Check S-003 - Audio: sound and music smoke

**Scenario**: Play through firing, hit, damage, and game over events.
**Capture**: Manual note in `PROGRESS.md`.
**Human checks**: Fire, hit, explosion, damage, and music cues are audible and balanced.
**Maps to**: AC-07.4, AC-07.5

## 6. Evidence Collection

```bash
npx playwright test tests/game/polish.spec.ts --config tests/playwright.config.ts
npm test
```

Save test output to `goals/07-polish/test-artifacts/test-output.txt`.

## 7. Regression

Run all previous goals' tests:

```bash
npm test
```

## 8. Evidence Format

/goal must add final evidence to `goals/07-polish/PROGRESS.md` using these tables.

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
