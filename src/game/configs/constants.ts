/**
 * Scene keys - use these everywhere instead of raw strings.
 */
export const SCENE_KEYS = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
  GAME_OVER: 'GameOverScene',
  HUD: 'HUDScene',
} as const;

/**
 * Game dimensions.
 */
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const WORLD_BOUNDS = {
  x: 0,
  y: 0,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
} as const;

/**
 * Game-specific labels for the foundation scenes.
 */
export const GAME_TITLE = 'Raiden Shooter';
export const MENU_START_PROMPT = 'Press SPACE to start';

/**
 * Placeholder colors for geometric shapes before final pixel art arrives.
 * Values are hex numbers for Phaser graphics (0xRRGGBB).
 */
export const COLORS = {
  PLAYER: 0x00ff00,
  ENEMY: 0xff0000,
  BULLET: 0xffff00,
  BACKGROUND: 0x111111,
  UI_TEXT: 0xffffff,
  ACCENT: 0x00aaff,
} as const;

export const TEXT_COLORS = {
  PRIMARY: '#ffffff',
  SECONDARY: '#aaaaaa',
} as const;

// --- Goal 00 adds constants below this line ---
// --- Goal 01 adds constants below this line ---
export const PLAYER_SHIP = {
  WIDTH: 32,
  HEIGHT: 32,
  SPEED: 260,
  START_X: GAME_WIDTH / 2,
  START_Y: GAME_HEIGHT - 64,
} as const;

// --- Goal 02 adds constants below this line ---
export const PLAYER_BULLET = {
  WIDTH: 4,
  HEIGHT: 12,
  SPEED: 320,
} as const;

export const PLAYER_WEAPON = {
  FIRE_INTERVAL_MS: 150,
  MAX_BULLETS: 8,
} as const;

// --- Goal 03 adds constants below this line ---
// --- Goal 04 adds constants below this line ---
