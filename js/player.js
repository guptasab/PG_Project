/**
 * player.js - First Person Player controller with movement, sliding, ADS, shooting & viewmodel
 */

import * as THREE from '../lib/three.module.js';
import { sound } from './audio.js';
import { WEAPONS, createWeaponModel } from './weapons.js';
import { storage } from './storage.js';

export class PlayerController {
  constructor(camera, scene, mapManager, domElement) {
    this.camera = camera;
    this.scene = scene;
    this.mapManager = mapManager;
    this.domElement = domElement;

    // Position & Physics
    this.position = new THREE.Vector3(0, 1.6, 0);
    this.velocity = new THREE.Vector3();
    this.moveSpeed = 9.0;
    this.sprintMultiplier = 1.45;
    this.jumpForce = 9.2;
    this.gravity = 24.0;
    this.isOnGround = false;

    // Sliding Mechanics (Roblox Rivals slide-cancel style)
    this.isSliding = false;
    this.slideTimer = 0;
    this.slideDuration = 0.8;
    this.slideSpeed = 16.0;
    this.slideDirection = new THREE.Vector3();

    // Vitals
    this.maxHealth = 100;
    this.health = 100;
    this.maxShield = 50;
    this.shield = 50;
    this.shieldRegenDelay = 4.0;
    this.timeSinceDamage = 10.0;
    this.isDead = false;

    // View & Camera
    this.pitch = 0;
    this.yaw = 0;
    this.defaultFOV = 75;
    this.currentFOV = 75;
    this.camera.fov = this.defaultFOV;

    // Weapons & Inventory
    this.currentSlot = 1; // 1: Primary, 2: Secondary, 3: Melee
    this.currentWeaponData = null;
    this.currentWeaponModel = null;
    this.ammo = 30;
    this.reserveAmmo = 90;
    this.isReloading = false;
    this.reloadTimer = 0;
    this.shootTimer = 0;
    this.isADS = false;

    // Viewmodel Animation
    this.viewmodelGroup = new THREE.Group();
    this.camera.add(this.viewmodelGroup);
    this.scene.add(this.camera);

    this.swayTarget = new THREE.Vector2();
    this.swayCurrent = new THREE.Vector2();
    this.bobTimer = 0;
    this.recoilOffset = new THREE.Vector3();
    this.recoilRotation = new THREE.Vector3();

    // Input States
    this.keys = {
      w: false, a: false, s: false, d: false,
      shift: false, space: false, c: false, r: false,
      lmb: false, rmb: false
    };

    // Callback hooks
    this.onShootCallback = null;
    this.onHitCallback = null;
    this.onDamageTakenCallback = null;

    this.setupInputs();
    this.equipSlot(1);
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    window.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mouseup', (e) => this.onMouseUp(e));
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('wheel', (e) => this.onWheel(e));
  }

  onKeyDown(e) {
    if (this.isDead) return;
    const k = e.key.toLowerCase();
    if (k === 'w') this.keys.w = true;
    if (k === 'a') this.keys.a = true;
    if (k === 's') this.keys.s = true;
    if (k === 'd') this.keys.d = true;
    if (e.key === 'Shift') this.keys.shift = true;
    if (e.key === ' ' || e.code === 'Space') {
      this.keys.space = true;
      this.tryJump();
    }
    if (k === 'c' || e.key === 'Control') {
      this.keys.c = true;
      this.trySlide();
    }
    if (k === 'r') this.tryReload();
    if (k === '1') this.equipSlot(1);
    if (k === '2') this.equipSlot(2);
    if (k === '3') this.equipSlot(3);
  }

  onKeyUp(e) {
    const k = e.key.toLowerCase();
    if (k === 'w') this.keys.w = false;
    if (k === 'a') this.keys.a = false;
    if (k === 's') this.keys.s = false;
    if (k === 'd') this.keys.d = false;
    if (e.key === 'Shift') this.keys.shift = false;
    if (e.key === ' ' || e.code === 'Space') this.keys.space = false;
    if (k === 'c' || e.key === 'Control') this.keys.c = false;
  }

  onMouseDown(e) {
    if (this.isDead) return;
    if (document.pointerLockElement !== this.domElement) return;

    if (e.button === 0) {
      this.keys.lmb = true;
      this.tryShoot();
    } else if (e.button === 2) {
      this.keys.rmb = true;
      this.isADS = true;
    }
  }

  onMouseUp(e) {
    if (e.button === 0) {
      this.keys.lmb = false;
    } else if (e.button === 2) {
      this.keys.rmb = false;
      this.isADS = false;
    }
  }

  onWheel(e) {
    if (document.pointerLockElement !== this.domElement) return;
    if (e.deltaY > 0) {
      this.equipSlot((this.currentSlot % 3) + 1);
    } else if (e.deltaY < 0) {
      this.equipSlot(this.currentSlot === 1 ? 3 : this.currentSlot - 1);
    }
  }

  onMouseMove(e) {
    if (document.pointerLockElement !== this.domElement || this.isDead) return;

    const sensitivity = 0.0022;
    this.yaw -= e.movementX * sensitivity;
    this.pitch -= e.movementY * sensitivity;

    // Pitch Clamp (-85 to +85 deg)
    const maxPitch = Math.PI / 2 - 0.05;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

    // Weapon sway
    this.swayTarget.x = Math.max(-0.06, Math.min(0.06, e.movementX * 0.0008));
    this.swayTarget.y = Math.max(-0.06, Math.min(0.06, e.movementY * 0.0008));
  }

  equipSlot(slotNum) {
    this.currentSlot = slotNum;
    let weaponId = 'ar';

    if (slotNum === 1) {
      weaponId = storage.data.equipped.primary || 'ar';
    } else if (slotNum === 2) {
      weaponId = storage.data.equipped.secondary || 'pistol';
    } else if (slotNum === 3) {
      weaponId = storage.data.equipped.melee || 'knife';
    }

    this.setWeapon(weaponId);
  }

  setWeapon(weaponId) {
    const data = WEAPONS[weaponId];
    if (!data) return;

    this.currentWeaponData = data;
    this.ammo = data.magSize;
    this.reserveAmmo = data.reserveAmmo;
    this.isReloading = false;
    this.isADS = false;

    // Build 3D model for viewmodel
    if (this.currentWeaponModel) {
      this.viewmodelGroup.remove(this.currentWeaponModel);
    }

    const skinId = storage.getWeaponSkin(weaponId);
    this.currentWeaponModel = createWeaponModel(weaponId, skinId);
    this.viewmodelGroup.add(this.currentWeaponModel);

    // Initial position
    this.currentWeaponModel.position.copy(data.hipPosition);
  }

  tryJump() {
    if (this.isOnGround) {
      this.velocity.y = this.jumpForce;
      this.isOnGround = false;
      sound.playJumpSound();
    }
  }

  trySlide() {
    if (this.keys.shift && this.isOnGround && !this.isSliding) {
      this.isSliding = true;
      this.slideTimer = this.slideDuration;
      sound.playSlideSound();

      // Slide in direction of movement or forward
      const moveVec = this.getMovementVector();
      if (moveVec.lengthSq() > 0) {
        this.slideDirection.copy(moveVec).normalize();
      } else {
        this.slideDirection.set(0, 0, -1).applyEuler(new THREE.Euler(0, this.yaw, 0)).normalize();
      }
    }
  }

  tryReload() {
    if (this.isReloading || !this.currentWeaponData) return;
    if (this.ammo >= this.currentWeaponData.magSize || this.reserveAmmo <= 0) return;

    this.isReloading = true;
    this.reloadTimer = this.currentWeaponData.reloadTime;
    sound.playReloadSound();
  }

  tryShoot() {
    if (this.isReloading || this.shootTimer > 0 || !this.currentWeaponData) return;

    if (this.ammo <= 0) {
      sound.playEmptyClick();
      this.tryReload();
      return;
    }

    this.ammo--;
    this.shootTimer = this.currentWeaponData.fireInterval;

    // Fire audio
    sound.playShootSound(this.currentWeaponData.id);

    // Recoil
    this.pitch += this.currentWeaponData.recoilY;
    this.yaw += (Math.random() - 0.5) * this.currentWeaponData.recoilX;
    this.recoilOffset.z = 0.08;
    this.recoilRotation.x = 0.12;

    // Hitscan shooting
    this.performHitscan();

    if (this.onShootCallback) {
      this.onShootCallback(this.currentWeaponData);
    }
  }

  performHitscan() {
    const isShotgun = this.currentWeaponData.id === 'shotgun';
    const pelletCount = isShotgun ? (this.currentWeaponData.pellets || 8) : 1;

    for (let p = 0; p < pelletCount; p++) {
      const spread = this.isADS ? (this.currentWeaponData.spread * 0.25) : this.currentWeaponData.spread;
      const raycaster = new THREE.Raycaster();

      // Spread offset
      const spreadX = (Math.random() - 0.5) * spread;
      const spreadY = (Math.random() - 0.5) * spread;

      const screenCenter = new THREE.Vector2(spreadX, spreadY);
      raycaster.setFromCamera(screenCenter, this.camera);

      // Collect target objects: map colliders and bot meshes
      const targetMeshes = [];
      this.scene.traverse((obj) => {
        if (obj.isMesh && obj.userData && obj.userData.isBot && obj.parent && obj.parent.visible) {
          targetMeshes.push(obj);
        }
      });

      const intersects = raycaster.intersectObjects(targetMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const bot = hit.object.userData.botInstance;
        const isHeadshot = hit.object.userData.part === 'head';

        let damage = this.currentWeaponData.damage;
        if (isHeadshot) {
          damage = Math.floor(damage * this.currentWeaponData.headshotMultiplier);
        }

        // Trigger hitmarker and sound
        sound.playHitmarker(isHeadshot);

        if (bot) {
          const killed = bot.takeDamage(damage, isHeadshot, this.position);
          if (this.onHitCallback) {
            this.onHitCallback({
              hitPoint: hit.point,
              damage,
              isHeadshot,
              killed,
              botName: bot.name,
              weaponId: this.currentWeaponData.id,
              isSliding: this.isSliding
            });
          }
        }

        // Bullet impact particle
        this.createImpactSpark(hit.point, hit.face ? hit.face.normal : new THREE.Vector3(0, 1, 0));
      }

      // Tracer line
      const muzzleWorld = new THREE.Vector3(0.2, -0.2, -0.4).applyMatrix4(this.camera.matrixWorld);
      const endPoint = intersects.length > 0 ? intersects[0].point : raycaster.ray.at(50, new THREE.Vector3());
      this.createBulletTracer(muzzleWorld, endPoint);
    }
  }

  createBulletTracer(start, end) {
    const points = [start, end];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0xffea00,
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });
    const line = new THREE.Line(geom, mat);
    this.scene.add(line);

    setTimeout(() => {
      this.scene.remove(line);
      geom.dispose();
      mat.dispose();
    }, 50);
  }

  createImpactSpark(pos, normal) {
    const sparkGeom = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const spark = new THREE.Mesh(sparkGeom, sparkMat);
    spark.position.copy(pos).addScaledVector(normal, 0.05);
    this.scene.add(spark);

    setTimeout(() => {
      this.scene.remove(spark);
      sparkGeom.dispose();
      sparkMat.dispose();
    }, 80);
  }

  getMovementVector() {
    const move = new THREE.Vector3();
    if (this.keys.w) move.z -= 1;
    if (this.keys.s) move.z += 1;
    if (this.keys.a) move.x -= 1;
    if (this.keys.d) move.x += 1;
    if (move.lengthSq() > 0) {
      move.normalize();
      move.applyEuler(new THREE.Euler(0, this.yaw, 0));
    }
    return move;
  }

  takeDamage(amount, attackerName = 'Bot') {
    if (this.isDead) return;

    this.timeSinceDamage = 0;
    sound.playHurtSound();

    // Shield takes damage first
    if (this.shield > 0) {
      const shieldDmg = Math.min(this.shield, amount);
      this.shield -= shieldDmg;
      amount -= shieldDmg;
    }

    this.health = Math.max(0, this.health - amount);

    if (this.onDamageTakenCallback) {
      this.onDamageTakenCallback(this.health, this.shield);
    }

    if (this.health <= 0) {
      this.die(attackerName);
    }
  }

  die(killerName) {
    this.isDead = true;
    sound.playHurtSound();
    // Respawn after 3 seconds
    setTimeout(() => {
      this.respawn();
    }, 2800);
  }

  respawn() {
    const spawns = this.mapManager.playerSpawns;
    const spawnPos = spawns[Math.floor(Math.random() * spawns.length)] || new THREE.Vector3(0, 1.6, 0);

    this.position.copy(spawnPos);
    this.velocity.set(0, 0, 0);
    this.health = this.maxHealth;
    this.shield = this.maxShield;
    this.isDead = false;
    this.isSliding = false;
    this.equipSlot(1);

    if (this.onDamageTakenCallback) {
      this.onDamageTakenCallback(this.health, this.shield);
    }
  }

  update(delta) {
    // Shield regeneration
    this.timeSinceDamage += delta;
    if (this.timeSinceDamage >= this.shieldRegenDelay && this.shield < this.maxShield) {
      this.shield = Math.min(this.maxShield, this.shield + delta * 20);
      if (this.onDamageTakenCallback) {
        this.onDamageTakenCallback(this.health, this.shield);
      }
    }

    // Auto-fire handling
    if (this.keys.lmb && this.currentWeaponData && this.currentWeaponData.automatic) {
      this.tryShoot();
    }

    // Timers
    if (this.shootTimer > 0) this.shootTimer -= delta;

    if (this.isReloading) {
      this.reloadTimer -= delta;
      if (this.reloadTimer <= 0) {
        this.isReloading = false;
        const needed = this.currentWeaponData.magSize - this.ammo;
        const added = Math.min(needed, this.reserveAmmo);
        this.ammo += added;
        this.reserveAmmo -= added;
      }
    }

    // Movement calculation
    if (!this.isDead) {
      let speed = this.moveSpeed;
      if (this.keys.shift && !this.isADS) {
        speed *= this.sprintMultiplier;
      }
      if (this.isADS) {
        speed *= 0.6;
      }

      if (this.isSliding) {
        this.slideTimer -= delta;
        this.velocity.x = this.slideDirection.x * this.slideSpeed;
        this.velocity.z = this.slideDirection.z * this.slideSpeed;

        if (this.slideTimer <= 0) {
          this.isSliding = false;
        }
      } else {
        const moveVec = this.getMovementVector();
        this.velocity.x = moveVec.x * speed;
        this.velocity.z = moveVec.z * speed;
      }

      // Gravity
      this.velocity.y -= this.gravity * delta;
      this.position.y += this.velocity.y * delta;

      // Floor ground collision
      const groundY = this.isSliding ? 0.9 : 1.6;
      if (this.position.y <= groundY) {
        this.position.y = groundY;
        this.velocity.y = 0;
        this.isOnGround = true;
      } else {
        this.isOnGround = false;
      }

      // Horizontal position step
      this.position.x += this.velocity.x * delta;
      this.position.z += this.velocity.z * delta;

      // Clamp arena bounds
      this.position.x = Math.max(-33, Math.min(33, this.position.x));
      this.position.z = Math.max(-33, Math.min(33, this.position.z));

      // Jump Pad Trigger Check!
      for (const pad of this.mapManager.jumpPads) {
        const padDist = new THREE.Vector2(this.position.x - pad.position.x, this.position.z - pad.position.z).length();
        if (padDist < pad.radius && this.position.y < 3.0) {
          this.velocity.y = pad.velocity.y;
          this.isOnGround = false;
          sound.playJumpPadLaunch();
        }
      }
    }

    // Update Camera position & rotation
    this.camera.position.copy(this.position);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // Camera roll on slide
    if (this.isSliding) {
      this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, 0.08, 0.2);
    } else {
      this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, 0, 0.2);
    }

    // Dynamic FOV (Sprint & ADS)
    let targetFOV = this.defaultFOV;
    if (this.isADS && this.currentWeaponData) {
      targetFOV = this.defaultFOV / this.currentWeaponData.adsZoom;
    } else if (this.keys.shift && this.isOnGround) {
      targetFOV = this.defaultFOV + 10;
    }
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 0.2);
    this.camera.updateProjectionMatrix();

    // Viewmodel Bobbing & Sway Update
    this.updateViewmodel(delta);
  }

  updateViewmodel(delta) {
    if (!this.currentWeaponModel || !this.currentWeaponData) return;

    // Sway lerp
    this.swayCurrent.lerp(this.swayTarget, 0.2);
    this.swayTarget.set(0, 0);

    // Target hip vs ADS position
    const targetPos = this.isADS
      ? this.currentWeaponData.adsPosition.clone()
      : this.currentWeaponData.hipPosition.clone();

    // Walking Bobbing
    const isMoving = (this.keys.w || this.keys.a || this.keys.s || this.keys.d) && this.isOnGround;
    if (isMoving && !this.isADS) {
      const bobFreq = this.keys.shift ? 14 : 10;
      this.bobTimer += delta * bobFreq;
      targetPos.x += Math.cos(this.bobTimer) * 0.015;
      targetPos.y += Math.sin(this.bobTimer * 2) * 0.012;
    }

    // Recoil recovery
    this.recoilOffset.lerp(new THREE.Vector3(0, 0, 0), 0.2);
    this.recoilRotation.lerp(new THREE.Vector3(0, 0, 0), 0.2);

    targetPos.add(this.recoilOffset);
    targetPos.x -= this.swayCurrent.x;
    targetPos.y -= this.swayCurrent.y;

    this.currentWeaponModel.position.lerp(targetPos, 0.35);

    // Rotation sway
    const targetRot = new THREE.Vector3(
      this.recoilRotation.x - this.swayCurrent.y * 2,
      this.swayCurrent.x * 2,
      -this.swayCurrent.x * 3
    );
    this.currentWeaponModel.rotation.set(targetRot.x, targetRot.y, targetRot.z);
  }
}
