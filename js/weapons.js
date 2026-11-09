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
    damage: 24,
    headshotMultiplier: 2.0,
    fireRate: 600, // RPM
    fireInterval: 60 / 600, // seconds
    spread: 0.015,
    recoilY: 0.02,
    recoilX: 0.008,
    magSize: 30,
    reserveAmmo: 120,
    reloadTime: 1.8,
    costKeys: 0, // Starter weapon
    automatic: true,
    adsZoom: 1.35,
    adsPosition: new THREE.Vector3(0, -0.16, -0.32),
    hipPosition: new THREE.Vector3(0.22, -0.22, -0.42),
    stats: { damage: 65, firerate: 75, accuracy: 78, mag: 70 }
  },

  shotgun: {
    id: 'shotgun',
    name: 'Pump Shotgun',
    category: 'primary',
    type: 'Scatter Shotgun',
    damage: 13, // 8 pellets = 104 body dmg at close range!
    pellets: 8,
    headshotMultiplier: 1.8,
    fireRate: 80,
    fireInterval: 60 / 80,
    spread: 0.055,
    recoilY: 0.06,
    recoilX: 0.02,
    magSize: 6,
    reserveAmmo: 36,
    reloadTime: 2.4,
    costKeys: 5,
    automatic: false,
    adsZoom: 1.25,
    adsPosition: new THREE.Vector3(0, -0.15, -0.3),
    hipPosition: new THREE.Vector3(0.22, -0.22, -0.42),
    stats: { damage: 92, firerate: 25, accuracy: 40, mag: 20 }
  },

  sniper: {
    id: 'sniper',
    name: 'Viper Sniper',
    category: 'primary',
    type: 'Bolt-Action Sniper',
    damage: 110, // 220 on headshot = instant kill!
    headshotMultiplier: 2.2,
    fireRate: 45,
    fireInterval: 60 / 45,
    spread: 0.002,
    recoilY: 0.09,
    recoilX: 0.02,
    magSize: 5,
    reserveAmmo: 25,
    reloadTime: 2.6,
    costKeys: 10,
    automatic: false,
    adsZoom: 3.5, // High zoom with scope overlay
    adsPosition: new THREE.Vector3(0, -0.14, -0.25),
    hipPosition: new THREE.Vector3(0.22, -0.22, -0.44),
    stats: { damage: 98, firerate: 15, accuracy: 98, mag: 15 }
  },

  smg: {
    id: 'smg',
    name: 'Dual Micro-SMGs',
    category: 'primary',
    type: 'Submachine Gun',
    damage: 16,
    headshotMultiplier: 1.8,
    fireRate: 950,
    fireInterval: 60 / 950,
    spread: 0.035,
    recoilY: 0.016,
    recoilX: 0.012,
    magSize: 40,
    reserveAmmo: 160,
    reloadTime: 1.5,
    costKeys: 12,
    automatic: true,
    adsZoom: 1.2,
    adsPosition: new THREE.Vector3(0, -0.16, -0.3),
    hipPosition: new THREE.Vector3(0.2, -0.2, -0.38),
    stats: { damage: 45, firerate: 95, accuracy: 60, mag: 85 }
  },

  pistol: {
    id: 'pistol',
    name: 'Combat Pistol',
    category: 'secondary',
    type: 'Sidearm Pistol',
    damage: 34,
    headshotMultiplier: 2.0,
    fireRate: 420,
    fireInterval: 60 / 420,
    spread: 0.012,
    recoilY: 0.03,
    recoilX: 0.008,
    magSize: 12,
    reserveAmmo: 60,
    reloadTime: 1.2,
    costKeys: 0, // Starter secondary
    automatic: false,
    adsZoom: 1.2,
    adsPosition: new THREE.Vector3(0, -0.14, -0.28),
    hipPosition: new THREE.Vector3(0.18, -0.2, -0.36),
    stats: { damage: 50, firerate: 60, accuracy: 82, mag: 40 }
  },

  revolver: {
    id: 'revolver',
    name: 'Rival Revolver',
    category: 'secondary',
    type: 'Heavy Revolver',
    damage: 65,
    headshotMultiplier: 2.2,
    fireRate: 150,
    fireInterval: 60 / 150,
    spread: 0.008,
    recoilY: 0.07,
    recoilX: 0.015,
    magSize: 6,
    reserveAmmo: 36,
    reloadTime: 2.0,
    costKeys: 8,
    automatic: false,
    adsZoom: 1.3,
    adsPosition: new THREE.Vector3(0, -0.14, -0.28),
    hipPosition: new THREE.Vector3(0.18, -0.2, -0.36),
    stats: { damage: 85, firerate: 30, accuracy: 90, mag: 20 }
  },

  knife: {
    id: 'knife',
    name: 'Tactical Knife',
    category: 'melee',
    type: 'Combat Knife',
    damage: 75,
    headshotMultiplier: 1.5,
    fireRate: 120,
    fireInterval: 60 / 120,
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
    stats: { damage: 75, firerate: 65, accuracy: 100, mag: 100 }
  },

  katana: {
    id: 'katana',
    name: 'Neon Katana',
    category: 'melee',
    type: 'High-Frequency Katana',
    damage: 120,
    headshotMultiplier: 1.5,
    fireRate: 90,
    fireInterval: 60 / 90,
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
    stats: { damage: 95, firerate: 50, accuracy: 100, mag: 100 }
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
