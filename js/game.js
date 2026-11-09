/**
 * game.js - Core match coordinator, Three.js renderer & bot management for RIVALS 3D
 */

import * as THREE from '../lib/three.module.js';
import { MapManager } from './maps.js';
import { PlayerController } from './player.js';
import { Bot } from './bot.js';
import { sound } from './audio.js';
import { storage } from './storage.js';
import { quests } from './quests.js';

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.domElement = canvas;
    this.clock = new THREE.Clock();

    this.isInMatch = false;
    this.currentMapId = null;

    // Match statistics
    this.playerKills = 0;
    this.playerHeadshots = 0;
    this.playerDeaths = 0;
    this.botTeamKills = 0;
    this.matchKillGoal = 20;
    this.gemsEarnedThisMatch = 0;
    this.streakCount = 0;

    // Three.js Core
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = false; // Fast 60fps performance

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Subsystems
    this.mapManager = new MapManager(this.scene);
    this.player = new PlayerController(this.camera, this.scene, this.mapManager, this.canvas);
    this.bots = [];

    this.ui = null; // Injected by main.js

    this.bindPlayerEvents();
    this.bindWindowEvents();
  }

  setUI(ui) {
    this.ui = ui;
  }

  bindWindowEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Pointer lock change detection
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === this.domElement) {
        if (this.ui && this.ui.pointerLockPrompt) {
          this.ui.pointerLockPrompt.classList.remove('active');
        }
      } else {
        if (this.isInMatch && this.ui && this.ui.pointerLockPrompt && !this.ui.modalPause.classList.contains('active')) {
          this.ui.pointerLockPrompt.classList.add('active');
        }
      }
    });
  }

  bindPlayerEvents() {
    // When player shoots
    this.player.onShootCallback = (weaponData) => {
      // Any additional muzzle flash point lights or particles
    };

    // When player hits a target
    this.player.onHitCallback = ({ hitPoint, damage, isHeadshot, killed, botName, weaponId, isSliding }) => {
      if (this.ui) {
        this.ui.showHitmarker(isHeadshot);

        // Project 3D hitPoint to 2D screen coordinate for floating damage number
        const screenPos = this.project3DToScreen(hitPoint);
        this.ui.showFloatingDamage(screenPos, damage, isHeadshot);
      }

      if (killed) {
        this.handleBotKilled(botName, isHeadshot, weaponId, isSliding);
      }
    };

    // When player takes damage from a bot
    this.player.onDamageTakenCallback = (health, shield) => {
      if (this.ui) {
        this.ui.showDamageFlash();
        this.ui.updateHUD(this.player);
      }
    };
  }

  project3DToScreen(worldPos) {
    const clone = worldPos.clone().project(this.camera);
    const x = (clone.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(clone.y * 0.5) + 0.5) * window.innerHeight;
    return { x, y };
  }

  startMatch(mapId = 'arena') {
    this.currentMapId = mapId;
    this.isInMatch = true;

    // Reset match stats
    this.playerKills = 0;
    this.playerHeadshots = 0;
    this.playerDeaths = 0;
    this.botTeamKills = 0;
    this.gemsEarnedThisMatch = 0;
    this.streakCount = 0;

    // Load selected map
    this.mapManager.loadMap(mapId);

    // Handle Ambient hum in Backrooms
    if (mapId === 'backrooms') {
      sound.startBackroomsHum();
    } else {
      sound.stopBackroomsHum();
    }

    // Spawn Player
    this.player.respawn();

    // Spawn 5 Bots
    this.spawnBots(5);

    // Switch to HUD
    if (this.ui) {
      this.ui.showScreen('hud');
      this.ui.hudPlayerScore.textContent = '0';
      this.ui.hudBotScore.textContent = '0';
      this.ui.updateHUD(this.player);
    }

    // Request pointer lock
    this.domElement.requestPointerLock();
  }

  spawnBots(count = 5) {
    // Clean existing
    this.bots.forEach(b => {
      this.scene.remove(b.group);
    });
    this.bots = [];

    const spawns = this.mapManager.botSpawns;

    for (let i = 0; i < count; i++) {
      const spawnPos = spawns[i % spawns.length] || new THREE.Vector3(0, 1.2, 0);
      const bot = new Bot(i, this.scene, this.mapManager, (deadBot, isHeadshot) => {
        // Handled in player onHitCallback
      });
      bot.spawn(spawnPos);
      this.bots.push(bot);
    }
  }

  handleBotKilled(botName, isHeadshot, weaponId, isSliding) {
    this.playerKills++;
    this.streakCount++;
    if (isHeadshot) this.playerHeadshots++;

    // Calculate Gems: 10 base + 5 headshot bonus!
    const gemAward = isHeadshot ? 15 : 10;
    this.gemsEarnedThisMatch += gemAward;
    storage.addGems(gemAward);

    // Update quest progress
    quests.onKillEvent({
      weaponId,
      isHeadshot,
      isSliding,
      killStreak: this.streakCount
    });

    sound.playKillSound();

    if (this.ui) {
      this.ui.hudPlayerScore.textContent = this.playerKills;
      this.ui.showGemGain(gemAward, isHeadshot);

      const weaponData = this.player.currentWeaponData;
      this.ui.addKillFeedEntry('YOU', botName, weaponData ? weaponData.name : 'Rival Gun', isHeadshot);

      // Streak announcements
      if (isHeadshot) {
        this.ui.showKillAnnouncement('HEADSHOT!', '#fbbf24');
      } else if (this.streakCount === 3) {
        this.ui.showKillAnnouncement('TRIPLE KILL!', '#00f2fe');
      } else if (this.streakCount === 5) {
        this.ui.showKillAnnouncement('RAMPAGE!', '#ff0055');
      } else if (this.streakCount >= 8) {
        this.ui.showKillAnnouncement('UNSTOPPABLE!', '#a855f7');
      }
    }

    // Check Win Condition (First to 20 kills)
    if (this.playerKills >= this.matchKillGoal) {
      this.endMatch(true);
    }
  }

  handleBotFiredBullet(bot, muzzlePos, targetPos) {
    // Bot tracer line
    const geom = new THREE.BufferGeometry().setFromPoints([muzzlePos, targetPos]);
    const mat = new THREE.LineBasicMaterial({ color: 0xff0055, linewidth: 2 });
    const line = new THREE.Line(geom, mat);
    this.scene.add(line);

    setTimeout(() => {
      this.scene.remove(line);
      geom.dispose();
      mat.dispose();
    }, 45);

    // Distance attenuation audio for bot shot
    const distToPlayer = muzzlePos.distanceTo(this.player.position);
    if (distToPlayer < 40) {
      sound.playShootSound('pistol');
    }

    // Check if shot hits player
    const distToTarget = targetPos.distanceTo(this.player.position);
    if (distToTarget < 1.4) {
      // Hit player!
      const botDamage = Math.floor(12 + Math.random() * 8);
      this.player.takeDamage(botDamage, bot.name);

      if (this.player.isDead) {
        this.playerDeaths++;
        this.streakCount = 0;
        this.botTeamKills++;
        if (this.ui) {
          this.ui.hudBotScore.textContent = this.botTeamKills;
          this.ui.addKillFeedEntry(bot.name, 'YOU', 'Rival Gun', false);
          this.ui.showKillAnnouncement('ELIMINATED', '#ef4444');
        }
      }
    }
  }

  endMatch(isVictory) {
    this.isInMatch = false;
    sound.stopBackroomsHum();

    // Reward 2 bonus Keys on match completion!
    const keysEarned = isVictory ? 3 : 1;
    storage.addKeys(keysEarned);

    if (this.ui) {
      this.ui.showMatchEnd(
        isVictory,
        this.gemsEarnedThisMatch,
        this.playerKills,
        this.playerHeadshots,
        keysEarned
      );
    }
  }

  update() {
    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (this.isInMatch) {
      // Update player
      this.player.update(delta);

      // Update map animations & jump pads
      this.mapManager.update(delta);

      // Update bots
      for (const bot of this.bots) {
        bot.update(delta, this.player.position, (b, muz, tgt) => {
          this.handleBotFiredBullet(b, muz, tgt);
        });
      }

      // Update HUD
      if (this.ui) {
        this.ui.updateHUD(this.player);
      }
    }

    // Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.update();
    };
    animate();
  }
}
