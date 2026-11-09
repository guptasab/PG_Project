/**
 * maps.js - 3D Level Generators for The Backrooms, Rivals Neon Arena & Warehouse
 */

import * as THREE from '../lib/three.module.js';

// Procedural texture utilities
function createWallpaperTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Backrooms mono-yellow wallpaper
  ctx.fillStyle = '#c7b369';
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = '#9d8745';
  ctx.lineWidth = 2;
  // Diamond floral wallpaper pattern
  for (let x = 0; x < 128; x += 32) {
    for (let y = 0; y < 128; y += 32) {
      ctx.strokeRect(x + 4, y + 4, 24, 24);
      ctx.beginPath();
      ctx.arc(x + 16, y + 16, 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  return tex;
}

function createCarpetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#8f8352';
  ctx.fillRect(0, 0, 128, 128);

  // Noise / damp stain speckles
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#7a6f44' : '#a2955f';
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    const s = Math.random() * 4 + 1;
    ctx.fillRect(x, y, s, s);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  return tex;
}

function createGridTexture(bgColor = '#0a0d17', gridColor = '#00f2fe') {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 64, 64);

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 64, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 12);
  return tex;
}

export class MapManager {
  constructor(scene) {
    this.scene = scene;
    this.currentMapId = null;
    this.mapGroup = new THREE.Group();
    this.scene.add(this.mapGroup);

    this.colliders = []; // Bounding boxes for collision
    this.jumpPads = [];  // Interactive launch pads
    this.playerSpawns = [];
    this.botSpawns = [];
    this.lights = [];
    this.animatedMeshes = [];
    this.flickerLights = [];
  }

  clear() {
    // Remove all objects and colliders
    while (this.mapGroup.children.length > 0) {
      const obj = this.mapGroup.children[0];
      this.mapGroup.remove(obj);
    }
    this.colliders = [];
    this.jumpPads = [];
    this.playerSpawns = [];
    this.botSpawns = [];
    this.lights = [];
    this.animatedMeshes = [];
    this.flickerLights = [];
  }

  addBoxCollider(mesh) {
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    this.colliders.push(box);
    return box;
  }

  // =========================================================================
  // MAP 1: THE BACKROOMS (Level 0 Mono-Yellow Maze)
  // =========================================================================
  buildBackrooms() {
    this.clear();
    this.currentMapId = 'backrooms';

    // Atmosphere
    this.scene.background = new THREE.Color(0x38341e);
    this.scene.fog = new THREE.FogExp2(0x38341e, 0.035);

    // Ambient light (dim fluorescent)
    const ambient = new THREE.AmbientLight(0xfff1b8, 0.5);
    this.mapGroup.add(ambient);
    this.lights.push(ambient);

    const wallpaperTex = createWallpaperTexture();
    const carpetTex = createCarpetTexture();

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallpaperTex,
      roughness: 0.9,
      metalness: 0.1
    });

    const floorMat = new THREE.MeshStandardMaterial({
      map: carpetTex,
      roughness: 0.95,
      metalness: 0.05
    });

    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xd4ceaa,
      roughness: 0.9
    });

    // Floor (Large maze floor 80x80)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    this.mapGroup.add(floor);

    // Ceiling
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 4.2, 0);
    this.mapGroup.add(ceiling);

    // Outer Perimeter Walls
    const wallHeight = 4.2;
    const addWall = (x, z, w, d) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, wallHeight, d), wallMat);
      wall.position.set(x, wallHeight / 2, z);
      this.mapGroup.add(wall);
      this.addBoxCollider(wall);
      return wall;
    };

    // Bounds
    addWall(0, -40, 80, 2);
    addWall(0, 40, 80, 2);
    addWall(-40, 0, 2, 80);
    addWall(40, 0, 2, 80);

    // Maze Corridor Wall Layout (Rooms and Intersecting Hallways)
    const mazeWalls = [
      // Central maze cluster
      { x: -15, z: -20, w: 20, d: 1.5 },
      { x: -5, z: -10, w: 1.5, d: 20 },
      { x: 10, z: -25, w: 1.5, d: 15 },
      { x: 20, z: -18, w: 20, d: 1.5 },
      { x: -25, z: 0, w: 1.5, d: 25 },
      { x: -10, z: 5, w: 18, d: 1.5 },
      { x: 0, z: 15, w: 1.5, d: 22 },
      { x: 15, z: 8, w: 22, d: 1.5 },
      { x: 25, z: 20, w: 1.5, d: 20 },
      { x: -18, z: 25, w: 22, d: 1.5 },
      // Pillars and dividing rooms
      { x: 8, z: -6, w: 4, d: 4 },
      { x: -18, z: -8, w: 3, d: 3 },
      { x: 18, z: -8, w: 3, d: 3 },
      { x: -8, z: -28, w: 4, d: 4 },
      { x: 28, z: -4, w: 4, d: 4 },
      { x: -28, z: 20, w: 4, d: 4 },
      { x: 12, z: 28, w: 15, d: 1.5 }
    ];

    mazeWalls.forEach(w => addWall(w.x, w.z, w.w, w.d));

    // Fluorescent Lights hanging from ceiling with flicker
    const lightPositions = [
      { x: -20, z: -20 }, { x: 0, z: -20 }, { x: 20, z: -20 },
      { x: -20, z: 0 },   { x: 0, z: 0 },   { x: 20, z: 0 },
      { x: -20, z: 20 },  { x: 0, z: 20 },  { x: 20, z: 20 }
    ];

    const fixtureMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffe680,
      emissiveIntensity: 1.2
    });

    lightPositions.forEach(pos => {
      // Mesh
      const fix = new THREE.Mesh(new THREE.BoxGeometry(2, 0.15, 0.6), fixtureMat);
      fix.position.set(pos.x, 4.1, pos.z);
      this.mapGroup.add(fix);

      // Light
      const pLight = new THREE.PointLight(0xfff0aa, 1.2, 18, 1.5);
      pLight.position.set(pos.x, 3.8, pos.z);
      this.mapGroup.add(pLight);
      this.lights.push(pLight);
      this.flickerLights.push({ light: pLight, baseIntensity: 1.2 });
    });

    // Spawns
    this.playerSpawns = [
      new THREE.Vector3(0, 1.2, 0),
      new THREE.Vector3(-30, 1.2, -30),
      new THREE.Vector3(30, 1.2, 30)
    ];

    this.botSpawns = [
      new THREE.Vector3(-30, 1.2, 15),
      new THREE.Vector3(25, 1.2, -25),
      new THREE.Vector3(-15, 1.2, -30),
      new THREE.Vector3(30, 1.2, 10),
      new THREE.Vector3(-5, 1.2, 28),
      new THREE.Vector3(15, 1.2, -10)
    ];
  }

  // =========================================================================
  // MAP 2: RIVALS NEON ARENA (Roblox Rivals Tournament Colosseum)
  // =========================================================================
  buildArena() {
    this.clear();
    this.currentMapId = 'arena';

    // Sky & Lighting
    this.scene.background = new THREE.Color(0x070913);
    this.scene.fog = new THREE.FogExp2(0x070913, 0.02);

    const ambient = new THREE.AmbientLight(0x38bdf8, 0.6);
    this.mapGroup.add(ambient);
    this.lights.push(ambient);

    const dirLight = new THREE.DirectionalLight(0xff0055, 0.9);
    dirLight.position.set(20, 40, 20);
    this.mapGroup.add(dirLight);
    this.lights.push(dirLight);

    const gridTex = createGridTexture('#0a0d1a', '#00f2fe');

    const arenaFloorMat = new THREE.MeshStandardMaterial({
      map: gridTex,
      roughness: 0.3,
      metalness: 0.7
    });

    const barrierMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.2,
      metalness: 0.8
    });

    const neonCyanMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x00f2fe,
      emissiveIntensity: 1.2
    });

    const neonPinkMat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xff0055,
      emissiveIntensity: 1.2
    });

    // Main Arena Floor (70x70)
    const floor = new THREE.Mesh(new THREE.BoxGeometry(70, 1, 70), arenaFloorMat);
    floor.position.set(0, -0.5, 0);
    this.mapGroup.add(floor);

    // Outer Stadium Barrier Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const addWall = (x, z, w, d, h = 6) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
      wall.position.set(x, h / 2, z);
      this.mapGroup.add(wall);
      this.addBoxCollider(wall);
      return wall;
    };

    addWall(0, -35, 70, 2);
    addWall(0, 35, 70, 2);
    addWall(-35, 0, 2, 70);
    addWall(35, 0, 2, 70);

    // Neon trim lines around outer walls
    const addNeonTrim = (x, y, z, w, d, colorMat) => {
      const trim = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), colorMat);
      trim.position.set(x, y, z);
      this.mapGroup.add(trim);
    };
    addNeonTrim(0, 5.8, -34, 68, 0.4, neonCyanMat);
    addNeonTrim(0, 5.8, 34, 68, 0.4, neonCyanMat);
    addNeonTrim(-34, 5.8, 0, 0.4, 68, neonPinkMat);
    addNeonTrim(34, 5.8, 0, 0.4, 68, neonPinkMat);

    // Elevated Catwalks & Platforms
    const addPlatform = (x, y, z, w, h, d) => {
      const plat = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), barrierMat);
      plat.position.set(x, y + h / 2, z);
      this.mapGroup.add(plat);
      this.addBoxCollider(plat);

      // Neon edge
      const edge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.15, d + 0.1), neonCyanMat);
      edge.position.set(x, y + h + 0.05, z);
      this.mapGroup.add(edge);
      return plat;
    };

    // Central Tower Platform
    addPlatform(0, 0, 0, 16, 2.8, 16);

    // Bridges / Catwalks on sides
    addPlatform(-20, 0, -18, 14, 2.2, 10);
    addPlatform(20, 0, -18, 14, 2.2, 10);
    addPlatform(-20, 0, 18, 14, 2.2, 10);
    addPlatform(20, 0, 18, 14, 2.2, 10);

    // Cover Blocks (tactical barriers like in Roblox Rivals)
    const addCover = (x, z, rotY = 0) => {
      const block = new THREE.Mesh(new THREE.BoxGeometry(4, 2.2, 1.2), barrierMat);
      block.position.set(x, 1.1, z);
      block.rotation.y = rotY;
      this.mapGroup.add(block);
      this.addBoxCollider(block);

      const glowStripe = new THREE.Mesh(new THREE.BoxGeometry(4.05, 0.2, 1.25), neonPinkMat);
      glowStripe.position.set(x, 1.8, z);
      glowStripe.rotation.y = rotY;
      this.mapGroup.add(glowStripe);
    };

    addCover(0, -10);
    addCover(0, 10);
    addCover(-12, 0, Math.PI / 2);
    addCover(12, 0, Math.PI / 2);
    addCover(-22, -4);
    addCover(22, 4);
    addCover(-8, -24, 0.4);
    addCover(8, 24, -0.4);

    // Ramps to high ground
    const addRamp = (x, y, z, w, len, angleY, slopeRot) => {
      const ramp = new THREE.Mesh(new THREE.BoxGeometry(w, 0.6, len), barrierMat);
      ramp.position.set(x, y, z);
      ramp.rotation.y = angleY;
      ramp.rotation.x = slopeRot;
      this.mapGroup.add(ramp);
      this.addBoxCollider(ramp);
    };

    addRamp(0, 1.4, -10.5, 4, 6.5, 0, -0.45);
    addRamp(0, 1.4, 10.5, 4, 6.5, 0, 0.45);

    // FUNCTIONAL JUMP PADS (Roblox Rivals Iconic Jump Pad Mechanics!)
    const addJumpPad = (x, z, power = 16) => {
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 2.0, 0.25, 24),
        new THREE.MeshStandardMaterial({ color: 0x111827 })
      );
      base.position.set(x, 0.12, z);
      this.mapGroup.add(base);

      // Glowing animated ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.4, 0.15, 12, 32),
        new THREE.MeshStandardMaterial({
          color: 0x00f2fe,
          emissive: 0x00f2fe,
          emissiveIntensity: 1.8
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, 0.28, z);
      this.mapGroup.add(ring);
      this.animatedMeshes.push({ mesh: ring, rotSpeed: 2.0 });

      // Core point light
      const pLight = new THREE.PointLight(0x00f2fe, 1.5, 8);
      pLight.position.set(x, 0.6, z);
      this.mapGroup.add(pLight);
      this.lights.push(pLight);

      this.jumpPads.push({
        position: new THREE.Vector3(x, 0, z),
        radius: 2.2,
        velocity: new THREE.Vector3(0, power, 0)
      });
    };

    // Place Jump Pads around the arena for rapid vertical gameplay
    addJumpPad(-14, -14, 18);
    addJumpPad(14, -14, 18);
    addJumpPad(-14, 14, 18);
    addJumpPad(14, 14, 18);

    // Spawns
    this.playerSpawns = [
      new THREE.Vector3(0, 1.2, -26),
      new THREE.Vector3(-24, 1.2, 0),
      new THREE.Vector3(24, 1.2, 0)
    ];

    this.botSpawns = [
      new THREE.Vector3(0, 1.2, 26),
      new THREE.Vector3(-24, 3.4, 18),
      new THREE.Vector3(24, 3.4, -18),
      new THREE.Vector3(-18, 1.2, -10),
      new THREE.Vector3(18, 1.2, 10),
      new THREE.Vector3(0, 4.0, 0) // On top of center platform!
    ];
  }

  // =========================================================================
  // MAP 3: WAREHOUSE RUMBLE (Industrial Shipping Containers & Catwalks)
  // =========================================================================
  buildWarehouse() {
    this.clear();
    this.currentMapId = 'warehouse';

    this.scene.background = new THREE.Color(0x18181b);
    this.scene.fog = new THREE.FogExp2(0x18181b, 0.025);

    const ambient = new THREE.AmbientLight(0xf59e0b, 0.5);
    this.mapGroup.add(ambient);
    this.lights.push(ambient);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 0.8);
    dirLight.position.set(25, 30, -15);
    this.mapGroup.add(dirLight);
    this.lights.push(dirLight);

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.8
    });

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46,
      roughness: 0.7
    });

    // Floor (70x70)
    const floor = new THREE.Mesh(new THREE.BoxGeometry(70, 1, 70), floorMat);
    floor.position.set(0, -0.5, 0);
    this.mapGroup.add(floor);

    // Enclosing Warehouse Walls (Height 10)
    const addWall = (x, z, w, d) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 10, d), wallMat);
      wall.position.set(x, 5, z);
      this.mapGroup.add(wall);
      this.addBoxCollider(wall);
      return wall;
    };

    addWall(0, -35, 70, 2);
    addWall(0, 35, 70, 2);
    addWall(-35, 0, 2, 70);
    addWall(35, 0, 2, 70);

    // Shipping Containers (Stackable colored industrial cover)
    const containerColors = [0xb91c1c, 0x1d4ed8, 0x047857, 0xd97706];
    const addContainer = (x, y, z, rotY = 0, colorIdx = 0) => {
      const mat = new THREE.MeshStandardMaterial({
        color: containerColors[colorIdx % containerColors.length],
        roughness: 0.5,
        metalness: 0.6
      });
      const cont = new THREE.Mesh(new THREE.BoxGeometry(6, 2.8, 14), mat);
      cont.position.set(x, y + 1.4, z);
      cont.rotation.y = rotY;
      this.mapGroup.add(cont);
      this.addBoxCollider(cont);
      return cont;
    };

    // Warehouse Shipping Layout
    addContainer(-18, 0, -10, 0, 0);
    addContainer(-18, 2.8, -10, 0, 1); // Stacked 2 high!
    addContainer(18, 0, -10, 0, 2);
    addContainer(-18, 0, 15, Math.PI / 2, 3);
    addContainer(16, 0, 12, 0.4, 0);
    addContainer(0, 0, 22, Math.PI / 2, 1);
    addContainer(-2, 0, -20, 0, 2);

    // Overhead Steel Catwalk
    const catwalkMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.4,
      metalness: 0.8
    });
    const catwalk = new THREE.Mesh(new THREE.BoxGeometry(60, 0.4, 4), catwalkMat);
    catwalk.position.set(0, 4.2, 0);
    this.mapGroup.add(catwalk);
    this.addBoxCollider(catwalk);

    // Stairs to Catwalk
    const stairs = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 9), catwalkMat);
    stairs.position.set(0, 2.1, 6.5);
    stairs.rotation.x = 0.5;
    this.mapGroup.add(stairs);
    this.addBoxCollider(stairs);

    // Jump pad in corner
    const addJumpPad = (x, z) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.4, 0.15, 12, 32),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.5 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, 0.2, z);
      this.mapGroup.add(ring);
      this.animatedMeshes.push({ mesh: ring, rotSpeed: 1.5 });

      this.jumpPads.push({
        position: new THREE.Vector3(x, 0, z),
        radius: 2.2,
        velocity: new THREE.Vector3(0, 16, 0)
      });
    };
    addJumpPad(-28, -28);
    addJumpPad(28, 28);

    // Spawns
    this.playerSpawns = [
      new THREE.Vector3(0, 1.2, -28),
      new THREE.Vector3(-25, 1.2, 0),
      new THREE.Vector3(25, 1.2, 0)
    ];

    this.botSpawns = [
      new THREE.Vector3(0, 1.2, 28),
      new THREE.Vector3(-20, 1.2, -20),
      new THREE.Vector3(20, 1.2, -20),
      new THREE.Vector3(-10, 1.2, 10),
      new THREE.Vector3(10, 1.2, 10),
      new THREE.Vector3(0, 5.0, 0) // On catwalk
    ];
  }

  loadMap(mapId) {
    if (mapId === 'backrooms') {
      this.buildBackrooms();
    } else if (mapId === 'warehouse') {
      this.buildWarehouse();
    } else {
      this.buildArena();
    }
  }

  update(delta) {
    // Animate jump pads
    for (const anim of this.animatedMeshes) {
      anim.mesh.rotation.z += anim.rotSpeed * delta;
    }

    // Flicker fluorescent lights in backrooms
    if (this.currentMapId === 'backrooms') {
      for (const fl of this.flickerLights) {
        if (Math.random() < 0.04) {
          fl.light.intensity = fl.baseIntensity * (0.3 + Math.random() * 0.9);
        } else {
          fl.light.intensity = fl.baseIntensity;
        }
      }
    }
  }
}
