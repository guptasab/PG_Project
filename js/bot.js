/**
 * bot.js - Roblox Rivals styled 3D AI Bots with pathing, combat state machine & rewards
 */

import * as THREE from '../lib/three.module.js';
import { sound } from './audio.js';

const BOT_NAMES = [
  'Rival_Neo', 'Specter_99', 'Cyber_Ghost', 'Viper_AI', 'Aero_Strike',
  'Nexus_Bot', 'Zero_Byte', 'Phantom_X', 'Glitch_King', 'Apex_Unit'
];

export class Bot {
  constructor(id, scene, mapManager, onDeathCallback) {
    this.id = id;
    this.name = BOT_NAMES[id % BOT_NAMES.length];
    this.scene = scene;
    this.mapManager = mapManager;
    this.onDeathCallback = onDeathCallback;

    this.maxHealth = 30; // 10x easier: reduced health so bots pop in 1-2 shots
    this.health = 30;
    this.isDead = false;
    this.respawnTimer = 0;

    // Movement & Combat parameters (Peaceful towards player)
    this.speed = 3.6; // Gentle, predictable movement
    this.strafeDir = 1;
    this.strafeTimer = 0;
    this.attackCooldown = 0;
    this.fireRate = 2.0;
    this.burstCount = 0;

    this.state = 'patrol'; // 'patrol' or 'bot_duel' - NEVER TARGETS PLAYER
    this.patrolTarget = new THREE.Vector3();
    this.patrolTimer = 0;
    this.targetBot = null;

    // 3D Model Components
    this.group = new THREE.Group();
    this.head = null;
    this.torso = null;
    this.leftArm = null;
    this.rightArm = null;
    this.leftLeg = null;
    this.rightLeg = null;
    this.weapon = null;
    this.healthBarSprite = null;

    this.walkCycle = 0;

    this.buildModel();
    this.scene.add(this.group);
  }

  buildModel() {
    // Roblox classic blocky avatar aesthetic
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 }); // Yellow skin
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 }); // Red team shirt
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6 }); // Blue jeans
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x00f2fe,
      emissiveIntensity: 1.0
    });

    // Torso (0.8w x 0.9h x 0.45d)
    this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.45), shirtMat);
    this.torso.position.y = 1.05;
    this.torso.userData = { isBot: true, botInstance: this, part: 'body' };
    this.group.add(this.torso);

    // Head (0.55 cube) - CRITICAL HITBOX
    this.head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), skinMat);
    this.head.position.y = 1.78;
    this.head.userData = { isBot: true, botInstance: this, part: 'head' };
    this.group.add(this.head);

    // Visor (Glowing faceplate)
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.08), visorMat);
    visor.position.set(0, 0.02, -0.28);
    this.head.add(visor);

    // Arms
    const armGeom = new THREE.BoxGeometry(0.32, 0.85, 0.32);
    this.leftArm = new THREE.Mesh(armGeom, shirtMat);
    this.leftArm.position.set(-0.6, 1.0, 0);
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeom, shirtMat);
    this.rightArm.position.set(0.6, 1.0, 0);
    this.group.add(this.rightArm);

    // Legs
    const legGeom = new THREE.BoxGeometry(0.36, 0.9, 0.36);
    this.leftLeg = new THREE.Mesh(legGeom, pantsMat);
    this.leftLeg.position.set(-0.22, 0.45, 0);
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeom, pantsMat);
    this.rightLeg.position.set(0.22, 0.45, 0);
    this.group.add(this.rightLeg);

    // Gun in Right Arm
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.3 });
    this.weapon = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.6), gunMat);
    this.weapon.position.set(0.6, 0.85, -0.3);
    this.group.add(this.weapon);

    // Build Floating Billboard Health Bar
    this.buildHealthBarSprite();
  }

  buildHealthBarSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    this.hbCtx = canvas.getContext('2d');
    this.hbTexture = new THREE.CanvasTexture(canvas);

    const spriteMat = new THREE.SpriteMaterial({ map: this.hbTexture, depthTest: false });
    this.healthBarSprite = new THREE.Sprite(spriteMat);
    this.healthBarSprite.scale.set(1.4, 0.35, 1);
    this.healthBarSprite.position.set(0, 2.35, 0);
    this.group.add(this.healthBarSprite);

    this.updateHealthBarTexture();
  }

  updateHealthBarTexture() {
    if (!this.hbCtx) return;
    const ctx = this.hbCtx;
    ctx.clearRect(0, 0, 128, 32);

    // Name text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, 64, 11);

    // Health bar bg
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 16, 108, 10);

    // Health bar fill
    const pct = Math.max(0, this.health / this.maxHealth);
    ctx.fillStyle = pct > 0.4 ? '#ef4444' : '#f59e0b';
    ctx.fillRect(12, 18, Math.floor(104 * pct), 6);

    this.hbTexture.needsUpdate = true;
  }

  spawn(position) {
    this.health = this.maxHealth;
    this.isDead = false;
    this.group.visible = true;
    this.group.position.copy(position);
    this.pickNewPatrolTarget();
    this.updateHealthBarTexture();
  }

  pickNewPatrolTarget() {
    const spawns = this.mapManager.botSpawns;
    if (spawns.length > 0) {
      const idx = Math.floor(Math.random() * spawns.length);
      this.patrolTarget.copy(spawns[idx]);
    } else {
      this.patrolTarget.set(
        (Math.random() - 0.5) * 40,
        1.2,
        (Math.random() - 0.5) * 40
      );
    }
    this.patrolTimer = 4 + Math.random() * 3;
  }

  takeDamage(amount, isHeadshot = false) {
    if (this.isDead) return false;

    this.health -= amount;
    this.updateHealthBarTexture();

    // Flash white/red
    this.torso.material.color.setHex(0xffffff);
    setTimeout(() => {
      if (this.torso) this.torso.material.color.setHex(0xef4444);
    }, 80);

    // Bot does NOT target player - it just gets a small impulse and keeps roaming
    this.patrolTimer = 1.0;

    if (this.health <= 0) {
      this.die(isHeadshot);
      return true; // Killed!
    }

    return false;
  }

  die(isHeadshot) {
    this.isDead = true;
    this.group.visible = false;
    this.respawnTimer = 1.5; // Fast respawn so player always has targets

    if (this.onDeathCallback) {
      this.onDeathCallback(this, isHeadshot);
    }
  }

  update(delta, playerPosition, onBotFiredBullet) {
    if (this.isDead) {
      this.respawnTimer -= delta;
      if (this.respawnTimer <= 0) {
        // Respawn
        const spawns = this.mapManager.botSpawns;
        const spawnPos = spawns[Math.floor(Math.random() * spawns.length)] || new THREE.Vector3(0, 1.2, 0);
        this.spawn(spawnPos);
      }
      return;
    }

    // BOTS NEVER TARGET OR ATTACK THE PLAYER!
    // They navigate between waypoints and cover calmly
    this.patrolTimer -= delta;
    const distToPatrol = this.group.position.distanceTo(this.patrolTarget);

    let moveVec = new THREE.Vector3();
    let isMoving = false;

    if (distToPatrol > 2.0 && this.patrolTimer > 0) {
      moveVec.subVectors(this.patrolTarget, this.group.position).normalize();
      this.lookTowards(this.patrolTarget);
      isMoving = true;
    } else {
      this.pickNewPatrolTarget();
    }

    // Occasional harmless bot target practice away into the air or at distant walls (never at player!)
    this.attackCooldown -= delta;
    if (this.attackCooldown <= 0) {
      this.shootPracticeTarget(onBotFiredBullet);
      this.attackCooldown = 3.0 + Math.random() * 4.0;
    }

    // Apply movement
    if (isMoving && moveVec.lengthSq() > 0) {
      const step = moveVec.multiplyScalar(this.speed * delta);
      const nextPos = this.group.position.clone().add(step);

      if (Math.abs(nextPos.x) < 33 && Math.abs(nextPos.z) < 33) {
        this.group.position.copy(nextPos);
      }

      // Walk limb animation
      this.walkCycle += delta * 7;
      const angle = Math.sin(this.walkCycle) * 0.4;
      this.leftLeg.rotation.x = angle;
      this.rightLeg.rotation.x = -angle;
      this.leftArm.rotation.x = -angle * 0.5;
    } else {
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
    }
  }

  lookTowards(targetPos) {
    const eyeTarget = targetPos.clone();
    eyeTarget.y = this.group.position.y;
    this.group.lookAt(eyeTarget);
  }

  // Shoots harmlessly into distance or at target waypoints, completely avoiding player
  shootPracticeTarget(onBotFiredBullet) {
    if (!this.group.visible || this.isDead) return;

    // Fire in forward facing direction
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.group.quaternion);
    const muzzlePos = this.group.position.clone().add(new THREE.Vector3(0.5, 1.2, -0.6).applyQuaternion(this.group.quaternion));
    const aimTarget = muzzlePos.clone().addScaledVector(forward, 25);

    if (onBotFiredBullet) {
      onBotFiredBullet(this, muzzlePos, aimTarget);
    }
  }
}
