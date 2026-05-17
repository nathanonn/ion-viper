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
export const GAME_TITLE = 'Ion Viper';
export const GAME_DESCRIPTION = 'Raiden-style vertical shooter';
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

export const ASSET_KEYS = {
  IMAGES: {
    PLAYER_SHIP: 'player-ship',
    ENEMY_DRONE: 'enemy-drone',
    PLAYER_BULLET: 'player-bullet',
    ION_BLAST_PICKUP: 'ion-blast-pickup',
    EXPLOSION_PARTICLE: 'explosion-particle',
    SPACE_BACKGROUND: 'space-background',
    STAR_PARALLAX: 'star-parallax',
  },
  AUDIO: {
    FIRE: 'fire-sfx',
    HIT: 'hit-sfx',
    EXPLOSION: 'explosion-sfx',
    PLAYER_DAMAGE: 'player-damage-sfx',
    MUSIC: 'gameplay-music',
  },
} as const;

export const ASSET_PATHS = {
  IMAGES: {
    PLAYER_SHIP: 'assets/images/player-ship.png',
    ENEMY_DRONE: 'assets/images/enemy-drone.png',
    PLAYER_BULLET: 'assets/images/player-bullet.png',
    EXPLOSION_PARTICLE: 'assets/images/explosion-particle.png',
    SPACE_BACKGROUND: 'assets/images/space-background.png',
    STAR_PARALLAX: 'assets/images/star-parallax.png',
  },
  AUDIO: {
    FIRE: 'assets/audio/fire.wav',
    HIT: 'assets/audio/hit.wav',
    EXPLOSION: 'assets/audio/explosion.wav',
    PLAYER_DAMAGE: 'assets/audio/player-damage.wav',
    MUSIC: 'assets/audio/gameplay-loop.wav',
  },
} as const;

export const POLISH = {
  BACKGROUND_SCROLL_SPEED: 18,
  STAR_SCROLL_SPEED: 56,
  SHAKE_DURATION_MS: 150,
  SHAKE_INTENSITY: 0.006,
  FIRE_VOLUME: 0.22,
  HIT_VOLUME: 0.25,
  EXPLOSION_VOLUME: 0.42,
  DAMAGE_VOLUME: 0.36,
  MUSIC_VOLUME: 0.16,
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
  ION_BLAST_PROJECTILE_COUNT: 3,
} as const;

export const ION_BLAST = {
  WIDTH: 20,
  HEIGHT: 20,
  SPEED: 240,
  MAX_PICKUPS: 2,
  SPAWN_DELAY_MS: 750,
  SPAWN_INTERVAL_MS: 5000,
  DURATION_MS: 1800,
  SPAWN_Y: -10,
  SPAWN_X_POSITIONS: [280, 400, 520],
} as const;

// --- Goal 03 adds constants below this line ---
export const ENEMY = {
  WIDTH: 28,
  HEIGHT: 28,
  SPEED: 120,
  SCORE_VALUE: 100,
} as const;

export const ENEMY_PROJECTILE = {
  WIDTH: 4,
  HEIGHT: 10,
  SPEED: 190,
  MAX_PROJECTILES: 24,
} as const;

export const ENEMY_SPAWNER = {
  SPAWN_INTERVAL_MS: 500,
  MAX_ENEMIES: 12,
  SPAWN_Y: -ENEMY.HEIGHT / 2,
  SPAWN_X_POSITIONS: [GAME_WIDTH / 2, 160, 640, 280, 520],
} as const;

// --- Goal 04 adds constants below this line ---
export const PLAYER_COMBAT = {
  STARTING_HEALTH: 3,
  DAMAGE_PER_CONTACT: 1,
  INVULNERABILITY_MS: 1000,
  FLASH_INTERVAL_MS: 100,
} as const;

// --- Goal 05 adds constants below this line ---
export const HUD = {
  PADDING: 16,
  LINE_HEIGHT: 24,
  FONT_SIZE: '18px',
  DEPTH: 1000,
  WAVE_PLACEHOLDER: '-',
} as const;
