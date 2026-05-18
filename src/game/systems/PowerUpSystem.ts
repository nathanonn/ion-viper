import Phaser from 'phaser';
import {
  ASSET_KEYS,
  COLORS,
  GAME_HEIGHT,
  ION_BLAST,
  PLAYER_WEAPON,
} from '../configs/constants';
import { IonBlastPickup } from '../objects/IonBlastPickup';
import type { PlayerShip } from '../objects/PlayerShip';

export interface IonBlastState {
  active: boolean;
  remainingMs: number;
  collectedCount: number;
  projectileCount: number;
  pickupActive: boolean;
  pickupPosition: { x: number; y: number };
  poolActiveCount: number;
  totalSpawned: number;
  totalRecycled: number;
  maxPickups: number;
}

export class PowerUpSystem {
  private readonly pickups: Phaser.Physics.Arcade.Group;
  private active = false;
  private remainingMs = 0;
  private collectedCount = 0;
  private nextSpawnInMs: number = ION_BLAST.SPAWN_DELAY_MS;
  private spawnIndex = 0;
  private totalSpawned = 0;
  private totalRecycled = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player?: PlayerShip
  ) {
    this.ensurePickupTexture();
    this.pickups = scene.physics.add.group({
      classType: IonBlastPickup,
      maxSize: ION_BLAST.MAX_PICKUPS,
      runChildUpdate: true,
    });
    this.prewarmPickups();
  }

  start(): void {
    this.active = false;
    this.remainingMs = 0;
    this.collectedCount = 0;
    this.nextSpawnInMs = ION_BLAST.SPAWN_DELAY_MS;
    this.spawnIndex = 0;
    this.totalSpawned = 0;
    this.totalRecycled = 0;
    this.recycleAllPickups();
  }

  update(delta: number): void {
    this.updateTimer(delta);
    this.recycleOffscreenPickups();
    this.updateSpawn(delta);
    this.collectOverlappingPickups();
  }

  handlePlayerOverlap(
    _playerObject:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile,
    pickupObject:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile
  ): void {
    const pickup = pickupObject as IonBlastPickup;

    if (!pickup.active) {
      return;
    }

    this.collectPickup(pickup);
  }

  activateIonBlast(): void {
    this.active = true;
    this.remainingMs = ION_BLAST.DURATION_MS;
    this.collectedCount += 1;
  }

  isIonBlastActive(): boolean {
    return this.active;
  }

  getProjectileCount(): number {
    return this.active ? PLAYER_WEAPON.ION_BLAST_PROJECTILE_COUNT : 1;
  }

  getGroup(): Phaser.Physics.Arcade.Group {
    return this.pickups;
  }

  getState(): IonBlastState {
    const pickup = this.getFirstActivePickup();

    return {
      active: this.active,
      remainingMs: Math.ceil(this.remainingMs),
      collectedCount: this.collectedCount,
      projectileCount: this.getProjectileCount(),
      pickupActive: pickup !== null,
      pickupPosition: pickup ? { x: pickup.x, y: pickup.y } : { x: 0, y: 0 },
      poolActiveCount: this.pickups.countActive(true),
      totalSpawned: this.totalSpawned,
      totalRecycled: this.totalRecycled,
      maxPickups: ION_BLAST.MAX_PICKUPS,
    };
  }

  private updateTimer(delta: number): void {
    if (!this.active) {
      return;
    }

    this.remainingMs = Math.max(0, this.remainingMs - delta);
    if (this.remainingMs <= 0) {
      this.active = false;
    }
  }

  private updateSpawn(delta: number): void {
    this.nextSpawnInMs -= delta;
    if (this.nextSpawnInMs > 0) {
      return;
    }

    if (this.pickups.countActive(true) < ION_BLAST.MAX_PICKUPS) {
      this.spawnPickup();
    }

    this.nextSpawnInMs = ION_BLAST.SPAWN_INTERVAL_MS;
  }

  private spawnPickup(): void {
    const pickup = this.pickups.getFirstDead(false) as IonBlastPickup | null;
    if (!pickup) {
      return;
    }

    const spawnPositions = ION_BLAST.SPAWN_X_POSITIONS;
    const x = spawnPositions[this.spawnIndex % spawnPositions.length];
    this.spawnIndex += 1;
    pickup.spawn(x, ION_BLAST.SPAWN_Y);
    this.totalSpawned += 1;
  }

  private recycleOffscreenPickups(): void {
    for (const child of this.pickups.getChildren()) {
      const pickup = child as IonBlastPickup;

      if (pickup.active && pickup.y - ION_BLAST.HEIGHT / 2 > GAME_HEIGHT) {
        pickup.recycle();
        this.totalRecycled += 1;
      }
    }
  }

  private recycleAllPickups(): void {
    for (const child of this.pickups.getChildren()) {
      (child as IonBlastPickup).recycle();
    }
  }

  private collectOverlappingPickups(): void {
    if (!this.player?.active) {
      return;
    }

    const playerBounds = this.player.getBounds();
    for (const child of this.pickups.getChildren()) {
      const pickup = child as IonBlastPickup;
      if (
        pickup.active &&
        Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, pickup.getBounds())
      ) {
        this.collectPickup(pickup);
      }
    }
  }

  private collectPickup(pickup: IonBlastPickup): void {
    if (!pickup.active) {
      return;
    }

    pickup.recycle();
    this.totalRecycled += 1;
    this.activateIonBlast();
  }

  private prewarmPickups(): void {
    for (let i = 0; i < ION_BLAST.MAX_PICKUPS; i += 1) {
      const pickup = this.pickups.create(0, 0, ASSET_KEYS.IMAGES.ION_BLAST_PICKUP) as
        | IonBlastPickup
        | null;
      pickup?.recycle();
    }
  }

  private getFirstActivePickup(): IonBlastPickup | null {
    const activePickups = this.pickups.getMatching('active', true);
    return activePickups.length > 0 ? (activePickups[0] as IonBlastPickup) : null;
  }

  private ensurePickupTexture(): void {
    if (this.scene.textures.exists(ASSET_KEYS.IMAGES.ION_BLAST_PICKUP)) {
      return;
    }

    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(COLORS.ACCENT, 1);
    graphics.fillRect(4, 0, 12, 20);
    graphics.fillRect(0, 4, 20, 12);
    graphics.lineStyle(2, COLORS.BULLET, 1);
    graphics.strokeRect(3, 3, 14, 14);
    graphics.generateTexture(
      ASSET_KEYS.IMAGES.ION_BLAST_PICKUP,
      ION_BLAST.WIDTH,
      ION_BLAST.HEIGHT
    );
    graphics.destroy();
  }
}
