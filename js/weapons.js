/**
 * weapons.js - Weapon data registry and 3D procedural model builders
 */

import * as THREE from '../lib/three.module.js';
import { applySkinToModel } from './skins.js';

export const WEAPONS = {
  ar: {
    id: 'ar',
    name: 'Rival AR-15',
    category: 'primary',
    type: 'Assault Rifle',
    damage: 45, // High damage - eliminates bots in 1 headshot or 1-2 body shots!
    headshotMultiplier: 2.5,
    fireRate: 650, // RPM
    fireInterval: 60 / 650, // seconds
    spread: 0.002, // Near zero spread - pinpoint laser accuracy
    recoilY: 0.003, // Minimal recoil
    recoilX: 0.001,
    magSize: 60, // Doubled mag capacity
    reserveAmmo: 360,
    reloadTime: 0.8, // Fast reload
    costKeys: 0, // Starter weapon
    automatic: true,
    adsZoom: 1.35,
    adsPosition: new THREE.Vector3(0, -0.16, -0.32),
    hipPosition: new THREE.Vector3(0.22, -0.22, -0.42),
    stats: { damage: 85, firerate: 85, accuracy: 98, mag: 95 }
  },

  shotgun: {
    id: 'shotgun',
    name: 'Pump Shotgun',
    category: 'primary',
    type: 'Scatter Shotgun',
    damage: 28, // 8 pellets = 224 damage - absolute obliteration
    pellets: 8,
    headshotMultiplier: 2.0,
    fireRate: 110,
    fireInterval: 60 / 110,
    spread: 0.025,
    recoilY: 0.015,
    recoilX: 0.005,
    magSize: 12,
    reserveAmmo: 96,
    reloadTime: 0.9,
    costKeys: 5,
    automatic: false,
    adsZoom: 1.25,
    adsPosition: new THREE.Vector3(0, -0.15, -0.3),
    hipPosition: new THREE.Vector3(0.22, -0.22, -0.42),
    stats: { damage: 100, firerate: 45, accuracy: 70, mag: 60 }
  },

  sniper: {
    id: 'sniper',
    name: 'Viper Sniper',
    category: 'primary',
    type: 'Bolt-Action Sniper',
    damage: 250, // Instant 1-shot obliteration anywhere!
    headshotMultiplier: 3.0,
    fireRate: 60,
    fireInterval: 60 / 60,
    spread: 0.0,
    recoilY: 0.02,
    recoilX: 0.005,
    magSize: 10,
    reserveAmmo: 60,
    reloadTime: 1.0,
    costKeys: 10,
    automatic: false,
    adsZoom: 3.5, // High zoom with scope overlay
    adsPosition: new THREE.Vector3(0, -0.14, -0.25),
    hipPosition: new THREE.Vector3(0.22, -0.22, -0.44),
    stats: { damage: 100, firerate: 30, accuracy: 100, mag: 40 }
  },

  smg: {
    id: 'smg',
    name: 'Dual Micro-SMGs',
    category: 'primary',
    type: 'Submachine Gun',
    damage: 32,
    headshotMultiplier: 2.0,
    fireRate: 1050,
    fireInterval: 60 / 1050,
    spread: 0.008,
    recoilY: 0.004,
    recoilX: 0.002,
    magSize: 80,
    reserveAmmo: 400,
    reloadTime: 0.7,
    costKeys: 12,
    automatic: true,
    adsZoom: 1.2,
    adsPosition: new THREE.Vector3(0, -0.16, -0.3),
    hipPosition: new THREE.Vector3(0.2, -0.2, -0.38),
    stats: { damage: 70, firerate: 100, accuracy: 85, mag: 100 }
  },

  pistol: {
    id: 'pistol',
    name: 'Combat Pistol',
    category: 'secondary',
    type: 'Sidearm Pistol',
    damage: 55, // 1-2 shot kill
    headshotMultiplier: 2.2,
    fireRate: 480,
    fireInterval: 60 / 480,
    spread: 0.002,
    recoilY: 0.006,
    recoilX: 0.002,
    magSize: 24,
    reserveAmmo: 180,
    reloadTime: 0.6,
    costKeys: 0, // Starter secondary
    automatic: false,
    adsZoom: 1.2,
    adsPosition: new THREE.Vector3(0, -0.14, -0.28),
    hipPosition: new THREE.Vector3(0.18, -0.2, -0.36),
    stats: { damage: 75, firerate: 75, accuracy: 96, mag: 70 }
  },

  revolver: {
    id: 'revolver',
    name: 'Rival Revolver',
    category: 'secondary',
    type: 'Heavy Revolver',
    damage: 110, // Instant 1-shot kill!
    headshotMultiplier: 2.5,
    fireRate: 200,
    fireInterval: 60 / 200,
    spread: 0.001,
    recoilY: 0.015,
    recoilX: 0.004,
    magSize: 12,
    reserveAmmo: 96,
    reloadTime: 0.9,
    costKeys: 8,
    automatic: false,
    adsZoom: 1.3,
    adsPosition: new THREE.Vector3(0, -0.14, -0.28),
    hipPosition: new THREE.Vector3(0.18, -0.2, -0.36),
    stats: { damage: 98, firerate: 45, accuracy: 98, mag: 50 }
  },

  knife: {
    id: 'knife',
    name: 'Tactical Knife',
    category: 'melee',
    type: 'Combat Knife',
    damage: 150, // 1-hit kill
    headshotMultiplier: 1.5,
    fireRate: 150,
    fireInterval: 60 / 150,
    spread: 0.0,
    recoilY: 0.0,
    recoilX: 0.0,
    magSize: 1,
    reserveAmmo: 1,
    reloadTime: 0,
    costKeys: 0, // Starter melee
    automatic: false,
    adsZoom: 1.0,
    adsPosition: new THREE.Vector3(0.1, -0.18, -0.32),
    hipPosition: new THREE.Vector3(0.18, -0.22, -0.32),
    stats: { damage: 95, firerate: 80, accuracy: 100, mag: 100 }
  },

  rpg: {
    id: 'rpg',
    name: 'Rival RPG-7',
    category: 'primary',
    type: 'Rocket Launcher',
    damage: 350, // Massive direct damage + huge explosion
    headshotMultiplier: 1.5,
    fireRate: 85,
    fireInterval: 60 / 85,
    spread: 0.0,
    recoilY: 0.04,
    recoilX: 0.01,
    isProjectile: true,
    blastRadius: 9.0,
    magSize: 4,
    reserveAmmo: 36,
    reloadTime: 1.0,
    costKeys: 5,
    automatic: false,
    adsZoom: 1.25,
    adsPosition: new THREE.Vector3(0, -0.15, -0.32),
    hipPosition: new THREE.Vector3(0.22, -0.22, -0.42),
    stats: { damage: 100, firerate: 35, accuracy: 95, mag: 25 }
  },

  minigun: {
    id: 'minigun',
    name: 'Apex Minigun',
    category: 'primary',
    type: 'Heavy Rotary Cannon',
    damage: 38,
    headshotMultiplier: 2.0,
    fireRate: 1400,
    fireInterval: 60 / 1400,
    spread: 0.006,
    recoilY: 0.002,
    recoilX: 0.002,
    magSize: 200,
    reserveAmmo: 1000,
    reloadTime: 1.5,
    costKeys: 8,
    automatic: true,
    adsZoom: 1.15,
    adsPosition: new THREE.Vector3(0, -0.18, -0.32),
    hipPosition: new THREE.Vector3(0.2, -0.25, -0.42),
    stats: { damage: 95, firerate: 100, accuracy: 80, mag: 100 }
  },

  laser: {
    id: 'laser',
    name: 'Hyper Laser Beam',
    category: 'primary',
    type: 'Energy Plasma Beam',
    damage: 65,
    headshotMultiplier: 2.2,
    fireRate: 750,
    fireInterval: 60 / 750,
    spread: 0.0,
    recoilY: 0.001,
    recoilX: 0.001,
    magSize: 100,
    reserveAmmo: 600,
    reloadTime: 0.8,
    costKeys: 10,
    automatic: true,
    adsZoom: 1.3,
    adsPosition: new THREE.Vector3(0, -0.15, -0.3),
    hipPosition: new THREE.Vector3(0.2, -0.2, -0.38),
    stats: { damage: 95, firerate: 90, accuracy: 100, mag: 95 }
  },

  katana: {
    id: 'katana',
    name: 'Neon Katana',
    category: 'melee',
    type: 'High-Frequency Katana',
    damage: 250, // 1-hit slash kill
    headshotMultiplier: 2.0,
    fireRate: 120,
    fireInterval: 60 / 120,
    spread: 0.0,
    recoilY: 0.0,
    recoilX: 0.0,
    magSize: 1,
    reserveAmmo: 1,
    reloadTime: 0,
    costKeys: 15,
    automatic: false,
    adsZoom: 1.0,
    adsPosition: new THREE.Vector3(0.1, -0.18, -0.35),
    hipPosition: new THREE.Vector3(0.18, -0.22, -0.35),
    stats: { damage: 100, firerate: 75, accuracy: 100, mag: 100 }
  }
};

/**
 * Procedural 3D Weapon Model Generators (Three.js)
 */
export function createWeaponModel(weaponId, skinId = 'default_matte') {
  const group = new THREE.Group();
  group.name = `weapon_${weaponId}`;

  const defaultMat = new THREE.MeshStandardMaterial({ color: 0x22222a });

  switch (weaponId) {
    case 'ar': {
      // Receiver
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.42), defaultMat);
      receiver.position.set(0, 0, 0);
      group.add(receiver);

      // Barrel
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.32, 12), defaultMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.015, -0.34);
      group.add(barrel);

      // Muzzle Brake (Accent)
      const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.032, 0.06), defaultMat);
      muzzle.name = 'accent_muzzle';
      muzzle.position.set(0, 0.015, -0.52);
      group.add(muzzle);

      // Curved Magazine
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.18, 0.09), defaultMat);
      mag.position.set(0, -0.11, -0.05);
      mag.rotation.x = 0.2;
      group.add(mag);

      // Stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.22), defaultMat);
      stock.position.set(0, -0.01, 0.3);
      group.add(stock);

      // Grip
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.14, 0.06), defaultMat);
      grip.position.set(0, -0.1, 0.12);
      grip.rotation.x = -0.35;
      group.add(grip);

      // Holographic Sight (Accent Glow)
      const sightBase = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.12), defaultMat);
      sightBase.position.set(0, 0.065, -0.04);
      group.add(sightBase);

      const sightGlass = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.045, 0.01), defaultMat);
      sightGlass.name = 'glow_sight';
      sightGlass.position.set(0, 0.08, -0.08);
      group.add(sightGlass);
      break;
    }

    case 'shotgun': {
      // Heavy Receiver
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.38), defaultMat);
      group.add(receiver);

      // Heavy Barrel
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.44, 12), defaultMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.38);
      group.add(barrel);

      // Mag Tube underneath
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 12), defaultMat);
      tube.rotation.x = Math.PI / 2;
      tube.position.set(0, -0.025, -0.36);
      group.add(tube);

      // Pump Slider (Accent)
      const pump = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.075, 0.16), defaultMat);
      pump.name = 'accent_pump';
      pump.position.set(0, -0.02, -0.3);
      group.add(pump);

      // Stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.11, 0.28), defaultMat);
      stock.position.set(0, -0.03, 0.3);
      group.add(stock);

      // Front bead sight
      const bead = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.02, 0.02), defaultMat);
      bead.name = 'glow_bead';
      bead.position.set(0, 0.055, -0.58);
      group.add(bead);
      break;
    }

    case 'sniper': {
      // Long Frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.09, 0.5), defaultMat);
      group.add(frame);

      // Heavy Long Barrel
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.65, 12), defaultMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.55);
      group.add(barrel);

      // Big Muzzle Brake
      const brake = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.1), defaultMat);
      brake.name = 'accent_brake';
      brake.position.set(0, 0.02, -0.9);
      group.add(brake);

      // High-Power Telescopic Scope (Accent Glow)
      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.32, 12), defaultMat);
      scope.name = 'accent_scope';
      scope.rotation.x = Math.PI / 2;
      scope.position.set(0, 0.09, -0.08);
      group.add(scope);

      // Scope Mounts
      const mount1 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.03), defaultMat);
      mount1.position.set(0, 0.06, 0.02);
      const mount2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.03), defaultMat);
      mount2.position.set(0, 0.06, -0.18);
      group.add(mount1);
      group.add(mount2);

      // Ergonomic Stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.3), defaultMat);
      stock.position.set(0, -0.02, 0.38);
      group.add(stock);

      // Bolt Handle
      const bolt = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), defaultMat);
      bolt.position.set(0.05, 0.04, 0.05);
      group.add(bolt);
      break;
    }

    case 'smg': {
      // Compact Receiver
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.085, 0.3), defaultMat);
      group.add(receiver);

      // Barrel
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 12), defaultMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.01, -0.22);
      group.add(barrel);

      // Extended Magazine
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.05), defaultMat);
      mag.name = 'accent_mag';
      mag.position.set(0, -0.13, 0.02);
      mag.rotation.x = 0.15;
      group.add(mag);

      // Wire Stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.18), defaultMat);
      stock.position.set(0, 0, 0.22);
      group.add(stock);

      // Reflex Red-Dot Sight
      const sight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.06), defaultMat);
      sight.name = 'glow_sight';
      sight.position.set(0, 0.065, -0.04);
      group.add(sight);
      break;
    }

    case 'pistol': {
      // Slide (top)
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.052, 0.22), defaultMat);
      slide.name = 'accent_slide';
      slide.position.set(0, 0.03, -0.02);
      group.add(slide);

      // Frame & Grip
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.04, 0.2), defaultMat);
      frame.position.set(0, -0.01, -0.01);
      group.add(frame);

      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.13, 0.065), defaultMat);
      grip.position.set(0, -0.08, 0.05);
      grip.rotation.x = -0.3;
      group.add(grip);

      // Iron Sights
      const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.015, 0.01), defaultMat);
      frontSight.name = 'glow_sight';
      frontSight.position.set(0, 0.06, -0.12);
      group.add(frontSight);
      break;
    }

    case 'revolver': {
      // Cylinder
      const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.08, 12), defaultMat);
      cylinder.name = 'accent_cylinder';
      cylinder.rotation.x = Math.PI / 2;
      cylinder.position.set(0, 0.01, -0.02);
      group.add(cylinder);

      // Heavy Barrel
      const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.055, 0.24), defaultMat);
      barrel.position.set(0, 0.02, -0.17);
      group.add(barrel);

      // Hammer & Grip
      const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.04), defaultMat);
      hammer.position.set(0, 0.04, 0.05);
      group.add(hammer);

      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.065), defaultMat);
      grip.position.set(0, -0.07, 0.05);
      grip.rotation.x = -0.35;
      group.add(grip);
      break;
    }

    case 'knife': {
      // Blade
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.048, 0.24), defaultMat);
      blade.name = 'accent_blade';
      blade.position.set(0, 0, -0.12);
      group.add(blade);

      // Guard
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.02), defaultMat);
      guard.position.set(0, 0, 0.01);
      group.add(guard);

      // Handle
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 0.14), defaultMat);
      handle.position.set(0, 0, 0.09);
      group.add(handle);
      break;
    }

    case 'rpg': {
      // Launcher Body Tube
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 16), defaultMat);
      tube.rotation.x = Math.PI / 2;
      tube.position.set(0, 0, -0.1);
      group.add(tube);

      // Rear Exhaust Venturi Cone
      const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.038, 0.16, 16), defaultMat);
      exhaust.rotation.x = Math.PI / 2;
      exhaust.position.set(0, 0, 0.32);
      group.add(exhaust);

      // Rocket Warhead (Loaded at front tip - Accent)
      const warhead = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.22, 16), defaultMat);
      warhead.name = 'accent_warhead';
      warhead.rotation.x = -Math.PI / 2;
      warhead.position.set(0, 0, -0.55);
      group.add(warhead);

      // Optical PGO-7 Sight (Glow)
      const sight = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.08, 0.14), defaultMat);
      sight.name = 'glow_sight';
      sight.position.set(-0.06, 0.07, -0.15);
      group.add(sight);

      // Wooden heat guard & Grip
      const woodGuard = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.22, 16), defaultMat);
      woodGuard.rotation.x = Math.PI / 2;
      woodGuard.position.set(0, 0, 0.05);
      group.add(woodGuard);

      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.06), defaultMat);
      grip.position.set(0, -0.1, -0.12);
      grip.rotation.x = -0.3;
      group.add(grip);
      break;
    }

    case 'minigun': {
      // Main Heavy Motor Housing
      const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.32, 16), defaultMat);
      motor.rotation.x = Math.PI / 2;
      motor.position.set(0, -0.02, 0.05);
      group.add(motor);

      // 6 Rotating Gatling Barrels
      const barrelGroup = new THREE.Group();
      barrelGroup.name = 'accent_barrels';
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.52, 8), defaultMat);
        b.rotation.x = Math.PI / 2;
        b.position.set(Math.cos(angle) * 0.055, Math.sin(angle) * 0.055, -0.36);
        barrelGroup.add(b);
      }
      group.add(barrelGroup);

      // Top Carry Handle
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.28), defaultMat);
      handle.position.set(0, 0.11, -0.02);
      group.add(handle);

      // Rear Grip / Trigger
      const rearGrip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.06), defaultMat);
      rearGrip.position.set(0, -0.08, 0.22);
      group.add(rearGrip);
      break;
    }

    case 'laser': {
      // Sleek Cyber Frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.45), defaultMat);
      group.add(frame);

      // Energy Plasma Battery (Glow)
      const battery = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 16), defaultMat);
      battery.name = 'glow_battery';
      battery.rotation.x = Math.PI / 2;
      battery.position.set(0, 0.02, -0.02);
      group.add(battery);

      // Dual Energy Prongs
      const prong1 = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.03, 0.25), defaultMat);
      prong1.name = 'accent_prong';
      prong1.position.set(0.04, 0.01, -0.32);
      const prong2 = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.03, 0.25), defaultMat);
      prong2.name = 'accent_prong';
      prong2.position.set(-0.04, 0.01, -0.32);
      group.add(prong1);
      group.add(prong2);

      // Ergonomic Futuristic Grip
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.14, 0.07), defaultMat);
      grip.position.set(0, -0.1, 0.12);
      grip.rotation.x = -0.4;
      group.add(grip);
      break;
    }

    case 'katana': {
      // Long Sleek Curved Blade
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.04, 0.75), defaultMat);
      blade.name = 'glow_blade';
      blade.position.set(0, 0.02, -0.38);
      group.add(blade);

      // Tsuba (Circular Guard)
      const tsuba = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.015, 16), defaultMat);
      tsuba.name = 'accent_tsuba';
      tsuba.rotation.x = Math.PI / 2;
      tsuba.position.set(0, 0.01, 0.01);
      group.add(tsuba);

      // Two-handed Tsuka Handle
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 12), defaultMat);
      handle.rotation.x = Math.PI / 2;
      handle.position.set(0, 0.01, 0.16);
      group.add(handle);
      break;
    }
  }

  // Apply chosen skin
  applySkinToModel(group, skinId);

  return group;
}
