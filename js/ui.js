/**
 * ui.js - User Interface manager for RIVALS 3D (HUD, Menus, Modals, 3D Loadout Preview & Crates)
 */

import * as THREE from '../lib/three.module.js';
import { storage } from './storage.js';
import { sound } from './audio.js';
import { WEAPONS, createWeaponModel } from './weapons.js';
import { SKINS, CRATES, rollCrate } from './skins.js';
import { quests } from './quests.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.previewRenderer = null;
    this.previewScene = null;
    this.previewCamera = null;
    this.previewModel = null;
    this.selectedWeaponId = 'ar';
    this.selectedCategory = 'primary';
    this.isDraggingPreview = false;
    this.prevMouseX = 0;

    this.cacheDOMElements();
    this.bindEvents();
    this.init3DPreview();

    // Subscribe to storage updates
    storage.subscribe(() => this.updateCurrencyDisplays());
  }

  cacheDOMElements() {
    // Screens
    this.mainMenu = document.getElementById('main-menu');
    this.screenLoadout = document.getElementById('screen-loadout');
    this.screenQuests = document.getElementById('screen-quests');
    this.gameHud = document.getElementById('game-hud');

    // Modals
    this.modalMapSelect = document.getElementById('modal-map-select');
    this.modalHowToPlay = document.getElementById('modal-how-to-play');
    this.modalPause = document.getElementById('modal-pause');
    this.modalMatchEnd = document.getElementById('modal-match-end');
    this.crateOverlay = document.getElementById('crate-opening-overlay');

    // HUD Elements
    this.hudHealthFill = document.getElementById('hud-health-fill');
    this.hudHealthText = document.getElementById('hud-health-text');
    this.hudShieldFill = document.getElementById('hud-shield-fill');
    this.hudShieldText = document.getElementById('hud-shield-text');
    this.hudAmmoCurrent = document.getElementById('hud-ammo-current');
    this.hudAmmoReserve = document.getElementById('hud-ammo-reserve');
    this.hudWeaponName = document.getElementById('hud-weapon-name');
    this.hudWeaponSkin = document.getElementById('hud-weapon-skin');
    this.hitmarker = document.getElementById('hitmarker');
    this.killFeed = document.getElementById('kill-feed');
    this.killAnnouncement = document.getElementById('kill-announcement');
    this.damageVignette = document.getElementById('damage-vignette');
    this.sniperScopeOverlay = document.getElementById('sniper-scope-overlay');
    this.pointerLockPrompt = document.getElementById('pointer-lock-prompt');
    this.damageNumbersContainer = document.getElementById('damage-numbers-container');
    this.currencyGainContainer = document.getElementById('currency-gain-container');

    // Scoreboard
    this.scoreboardOverlay = document.getElementById('scoreboard-overlay');
    this.sbTbody = document.getElementById('sb-tbody');
    this.hudPlayerScore = document.getElementById('hud-player-score');
    this.hudBotScore = document.getElementById('hud-bot-score');

    // Top Bar Currency Displays
    this.menuKeysCount = document.getElementById('menu-keys-count');
    this.menuGemsCount = document.getElementById('menu-gems-count');
    this.loadoutKeysCount = document.getElementById('loadout-keys-count');
    this.loadoutGemsCount = document.getElementById('loadout-gems-count');
    this.questsKeysCount = document.getElementById('quests-keys-count');
    this.menuLevel = document.getElementById('menu-level');
    this.menuXpFill = document.getElementById('menu-xp-fill');

    // Active Loadout Display in Menu
    this.menuPrimaryName = document.getElementById('menu-primary-name');
    this.menuPrimarySkin = document.getElementById('menu-primary-skin');
    this.menuSecondaryName = document.getElementById('menu-secondary-name');
    this.menuSecondarySkin = document.getElementById('menu-secondary-skin');

    // Loadout Preview Details
    this.weaponsGrid = document.getElementById('weapons-grid');
    this.skinsGrid = document.getElementById('skins-grid');
    this.questsList = document.getElementById('quests-list');
    this.previewWeaponName = document.getElementById('preview-weapon-name');
    this.previewWeaponType = document.getElementById('preview-weapon-type');
    this.previewWeaponStatus = document.getElementById('preview-weapon-status');
    this.btnWeaponAction = document.getElementById('btn-weapon-action');
    this.statDamage = document.getElementById('stat-damage');
    this.statFirerate = document.getElementById('stat-firerate');
    this.statAccuracy = document.getElementById('stat-accuracy');
    this.statMag = document.getElementById('stat-mag');
    this.statDamageVal = document.getElementById('stat-damage-val');
    this.statFirerateVal = document.getElementById('stat-firerate-val');
    this.statAccuracyVal = document.getElementById('stat-accuracy-val');
    this.statMagVal = document.getElementById('stat-mag-val');
  }

  bindEvents() {
    // Navigation
    document.getElementById('btn-play').addEventListener('click', () => {
      sound.resume();
      this.openModal(this.modalMapSelect);
    });

    document.getElementById('btn-how-to-play').addEventListener('click', () => {
      sound.resume();
      this.openModal(this.modalHowToPlay);
    });

    document.getElementById('btn-loadout').addEventListener('click', () => {
      sound.resume();
      this.showScreen('loadout');
      this.renderWeaponsGrid();
      this.selectWeapon(storage.data.equipped.primary || 'ar');
    });

    document.getElementById('btn-quests').addEventListener('click', () => {
      sound.resume();
      this.showScreen('quests');
      this.renderQuestsList();
    });

    document.getElementById('btn-loadout-back').addEventListener('click', () => {
      this.showScreen('menu');
    });

    document.getElementById('btn-quests-back').addEventListener('click', () => {
      this.showScreen('menu');
    });

    document.getElementById('btn-reset-data').addEventListener('click', () => {
      if (confirm('Reset all progress, keys, and gems?')) {
        storage.reset();
        this.updateCurrencyDisplays();
      }
    });

    // Modal Close buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close');
        const modal = document.getElementById(modalId);
        if (modal) this.closeModal(modal);
      });
    });

    // Map selection deploy
    document.querySelectorAll('.select-map-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mapId = btn.getAttribute('data-map');
        this.closeModal(this.modalMapSelect);
        this.game.startMatch(mapId);
      });
    });

    // Loadout Category Pills
    document.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.selectedCategory = pill.getAttribute('data-category');
        this.renderWeaponsGrid();
      });
    });

    // Loadout Sub Tabs (Weapons vs Crates vs Skins)
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const targetTab = document.getElementById(btn.getAttribute('data-tab'));
        if (targetTab) targetTab.classList.add('active');

        if (btn.getAttribute('data-tab') === 'tab-skins') {
          this.renderSkinsGrid();
        }
      });
    });

    // Crate Buying
    document.querySelectorAll('.buy-crate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const crateId = btn.getAttribute('data-crate');
        const cost = parseInt(btn.getAttribute('data-cost'), 10);
        this.purchaseCrate(crateId, cost);
      });
    });

    // Claim reward button on crate reveal
    document.getElementById('btn-claim-reward').addEventListener('click', () => {
      this.crateOverlay.classList.remove('active');
      this.showScreen('loadout');
      this.renderSkinsGrid();
      this.update3DPreview();
    });

    // Weapon Action Button (Equip or Buy with Keys)
    this.btnWeaponAction.addEventListener('click', () => {
      this.handleWeaponAction();
    });

    // Pointer Lock click-to-resume
    this.pointerLockPrompt.addEventListener('click', () => {
      try {
        const p = this.game.domElement.requestPointerLock();
        if (p && p.catch) p.catch(() => {});
      } catch (e) {}
    });

    // Pause Menu buttons
    document.getElementById('btn-resume-game').addEventListener('click', () => {
      this.closeModal(this.modalPause);
      try {
        const p = this.game.domElement.requestPointerLock();
        if (p && p.catch) p.catch(() => {});
      } catch (e) {}
    });

    document.getElementById('btn-pause-how-to-play').addEventListener('click', () => {
      this.openModal(this.modalHowToPlay);
    });

    document.getElementById('btn-quit-to-menu').addEventListener('click', () => {
      this.closeModal(this.modalPause);
      this.game.endMatch(false);
      this.showScreen('menu');
    });

    // Match End buttons
    document.getElementById('btn-play-again').addEventListener('click', () => {
      this.closeModal(this.modalMatchEnd);
      this.game.startMatch(this.game.currentMapId || 'arena');
    });

    document.getElementById('btn-end-return-menu').addEventListener('click', () => {
      this.closeModal(this.modalMatchEnd);
      this.showScreen('menu');
    });

    // TAB Scoreboard hold
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        if (this.game.isInMatch) {
          this.scoreboardOverlay.classList.add('active');
          this.renderScoreboard();
        }
      } else if (e.key === 'Escape') {
        if (this.game.isInMatch) {
          if (this.modalPause.classList.contains('active')) {
            this.closeModal(this.modalPause);
            this.game.domElement.requestPointerLock();
          } else {
            document.exitPointerLock();
            this.openModal(this.modalPause);
          }
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'Tab') {
        this.scoreboardOverlay.classList.remove('active');
      }
    });

    // Setup Quest Toast Callback
    quests.setToastCallback((msg) => {
      this.showKillAnnouncement(msg, '#fbbf24');
    });
  }

  showScreen(screenName) {
    this.mainMenu.classList.remove('active');
    this.screenLoadout.classList.remove('active');
    this.screenQuests.classList.remove('active');
    this.gameHud.classList.remove('active');

    if (screenName === 'menu') {
      this.mainMenu.classList.add('active');
      this.updateActiveLoadoutMenuCard();
    } else if (screenName === 'loadout') {
      this.screenLoadout.classList.add('active');
    } else if (screenName === 'quests') {
      this.screenQuests.classList.add('active');
    } else if (screenName === 'hud') {
      this.gameHud.classList.add('active');
    }
  }

  openModal(modal) {
    if (modal) modal.classList.add('active');
  }

  closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }

  updateCurrencyDisplays() {
    const d = storage.data;
    if (this.menuKeysCount) this.menuKeysCount.textContent = d.keys;
    if (this.menuGemsCount) this.menuGemsCount.textContent = d.gems;
    if (this.loadoutKeysCount) this.loadoutKeysCount.textContent = d.keys;
    if (this.loadoutGemsCount) this.loadoutGemsCount.textContent = d.gems;
    if (this.questsKeysCount) this.questsKeysCount.textContent = d.keys;

    if (this.menuLevel) this.menuLevel.textContent = d.level;
    if (this.menuXpFill) {
      const pct = Math.min(100, Math.floor((d.xp / d.xpToNextLevel) * 100));
      this.menuXpFill.style.width = `${pct}%`;
    }

    const questDot = document.getElementById('quest-alert-dot');
    if (questDot) {
      questDot.style.display = quests.hasUnclaimedQuests() ? 'flex' : 'none';
    }

    this.updateActiveLoadoutMenuCard();
  }

  updateActiveLoadoutMenuCard() {
    const d = storage.data;
    const primData = WEAPONS[d.equipped.primary] || WEAPONS.ar;
    const secData = WEAPONS[d.equipped.secondary] || WEAPONS.pistol;

    const primSkin = SKINS[storage.getWeaponSkin(primData.id)] || SKINS.default_matte;
    const secSkin = SKINS[storage.getWeaponSkin(secData.id)] || SKINS.default_matte;

    if (this.menuPrimaryName) this.menuPrimaryName.textContent = primData.name;
    if (this.menuPrimarySkin) this.menuPrimarySkin.textContent = primSkin.name;
    if (this.menuSecondaryName) this.menuSecondaryName.textContent = secData.name;
    if (this.menuSecondarySkin) this.menuSecondarySkin.textContent = secSkin.name;
  }

  // =========================================================================
  // 3D WEAPON PREVIEW IN LOADOUT
  // =========================================================================
  init3DPreview() {
    const canvas = document.getElementById('weapon-preview-canvas');
    if (!canvas) return;

    this.previewRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.previewRenderer.setPixelRatio(window.devicePixelRatio);
    this.previewRenderer.setSize(canvas.clientWidth || 400, canvas.clientHeight || 300);

    this.previewScene = new THREE.Scene();
    this.previewCamera = new THREE.PerspectiveCamera(45, (canvas.clientWidth || 400) / (canvas.clientHeight || 300), 0.1, 100);
    this.previewCamera.position.set(0, 0.1, 1.2);

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    this.previewScene.add(ambient);

    const dir1 = new THREE.DirectionalLight(0x00f2fe, 1.2);
    dir1.position.set(3, 4, 3);
    this.previewScene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0xff0055, 0.8);
    dir2.position.set(-3, -2, 2);
    this.previewScene.add(dir2);

    // Mouse drag rotation
    canvas.addEventListener('mousedown', (e) => {
      this.isDraggingPreview = true;
      this.prevMouseX = e.clientX;
    });

    window.addEventListener('mouseup', () => {
      this.isDraggingPreview = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDraggingPreview && this.previewModel) {
        const deltaX = e.clientX - this.prevMouseX;
        this.previewModel.rotation.y += deltaX * 0.015;
        this.prevMouseX = e.clientX;
      }
    });

    // Start preview animation loop
    const animatePreview = () => {
      requestAnimationFrame(animatePreview);
      if (this.previewModel && !this.isDraggingPreview) {
        this.previewModel.rotation.y += 0.008;
      }
      if (this.previewRenderer && this.screenLoadout.classList.contains('active')) {
        this.previewRenderer.render(this.previewScene, this.previewCamera);
      }
    };
    animatePreview();
  }

  update3DPreview() {
    if (!this.previewScene) return;

    if (this.previewModel) {
      this.previewScene.remove(this.previewModel);
    }

    const skinId = storage.getWeaponSkin(this.selectedWeaponId);
    this.previewModel = createWeaponModel(this.selectedWeaponId, skinId);
    this.previewModel.position.set(0, 0, 0);
    this.previewModel.rotation.set(0.1, Math.PI / 4, 0);
    this.previewModel.scale.set(1.4, 1.4, 1.4);
    this.previewScene.add(this.previewModel);
  }

  // =========================================================================
  // LOADOUT & WEAPONS ARSENAL
  // =========================================================================
  renderWeaponsGrid() {
    this.weaponsGrid.innerHTML = '';

    const weaponsList = Object.values(WEAPONS).filter(w => w.category === this.selectedCategory);

    weaponsList.forEach(w => {
      const isUnlocked = storage.isWeaponUnlocked(w.id);
      const isEquipped = storage.data.equipped[w.category] === w.id;
      const isSelected = this.selectedWeaponId === w.id;

      const card = document.createElement('div');
      card.className = `weapon-card-item ${isSelected ? 'selected' : ''} ${isEquipped ? 'equipped' : ''}`;

      card.innerHTML = `
        <div class="w-item-header">
          <span class="w-item-name">${w.name}</span>
          <span class="w-item-tag ${isEquipped ? 'equipped' : isUnlocked ? '' : 'locked'}">
            ${isEquipped ? 'EQUIPPED' : isUnlocked ? 'OWNED' : 'LOCKED'}
          </span>
        </div>
        <div class="w-item-cost">
          ${isUnlocked ? 'UNLOCKED' : `🔑 ${w.costKeys} KEYS`}
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectWeapon(w.id);
      });

      this.weaponsGrid.appendChild(card);
    });
  }

  selectWeapon(weaponId) {
    this.selectedWeaponId = weaponId;
    const w = WEAPONS[weaponId];
    if (!w) return;

    this.renderWeaponsGrid();

    this.previewWeaponName.textContent = w.name;
    this.previewWeaponType.textContent = `${w.type} &bull; ${w.category.toUpperCase()}`;

    const isUnlocked = storage.isWeaponUnlocked(w.id);
    const isEquipped = storage.data.equipped[w.category] === w.id;

    if (isEquipped) {
      this.previewWeaponStatus.className = 'preview-weapon-status equipped';
      this.previewWeaponStatus.textContent = 'EQUIPPED';
      this.btnWeaponAction.className = 'rival-btn secondary-btn action-full-btn';
      this.btnWeaponAction.textContent = 'ALREADY EQUIPPED';
      this.btnWeaponAction.disabled = true;
    } else if (isUnlocked) {
      this.previewWeaponStatus.className = 'preview-weapon-status owned';
      this.previewWeaponStatus.textContent = 'OWNED';
      this.btnWeaponAction.className = 'rival-btn primary-btn action-full-btn';
      this.btnWeaponAction.textContent = 'EQUIP WEAPON';
      this.btnWeaponAction.disabled = false;
    } else {
      this.previewWeaponStatus.className = 'preview-weapon-status locked';
      this.previewWeaponStatus.textContent = `LOCKED (${w.costKeys} KEYS)`;
      this.btnWeaponAction.className = 'rival-btn quest-btn action-full-btn';
      this.btnWeaponAction.textContent = `BUY WITH ${w.costKeys} KEYS 🔑`;
      this.btnWeaponAction.disabled = storage.data.keys < w.costKeys;
    }

    // Stats
    this.statDamage.style.width = `${w.stats.damage}%`;
    this.statFirerate.style.width = `${w.stats.firerate}%`;
    this.statAccuracy.style.width = `${w.stats.accuracy}%`;
    this.statMag.style.width = `${w.stats.mag}%`;

    this.statDamageVal.textContent = w.damage;
    this.statFirerateVal.textContent = `${w.fireRate} RPM`;
    this.statAccuracyVal.textContent = `${Math.floor(100 - w.spread * 800)}%`;
    this.statMagVal.textContent = w.magSize;

    this.update3DPreview();
  }

  handleWeaponAction() {
    const w = WEAPONS[this.selectedWeaponId];
    if (!w) return;

    const isUnlocked = storage.isWeaponUnlocked(w.id);

    if (isUnlocked) {
      // Equip
      storage.equipWeapon(w.category, w.id);
      sound.playKeySound();
      this.selectWeapon(w.id);
    } else {
      // Buy with keys
      if (storage.data.keys >= w.costKeys) {
        storage.unlockWeapon(w.id, w.costKeys);
        storage.equipWeapon(w.category, w.id);
        sound.playKeySound();
        this.selectWeapon(w.id);
      } else {
        alert(`You need ${w.costKeys} Keys to unlock this gun! Complete Quests to earn more keys.`);
      }
    }
  }

  // =========================================================================
  // CRATES UNBOXING & REVEAL
  // =========================================================================
  purchaseCrate(crateId, cost) {
    if (storage.data.gems < cost) {
      alert(`Not enough Gems! You have ${storage.data.gems} Gems. Eliminate AI bots in matches to earn more!`);
      return;
    }

    storage.spendGems(cost);
    storage.data.stats.cratesOpened = (storage.data.stats.cratesOpened || 0) + 1;
    storage.save();

    // Roll skin
    const wonSkin = rollCrate(crateId);
    if (!wonSkin) return;

    storage.unlockSkin(wonSkin.id);
    // Equip onto selected weapon immediately
    storage.setWeaponSkin(this.selectedWeaponId, wonSkin.id);

    // Play unboxing animation overlay
    this.startUnboxingAnimation(wonSkin);
  }

  startUnboxingAnimation(skin) {
    this.crateOverlay.classList.add('active');
    const cubeElem = document.getElementById('unboxing-box-elem');
    const statusText = document.getElementById('crate-status-text');
    const rewardCard = document.getElementById('skin-reward-card');

    cubeElem.style.display = 'block';
    rewardCard.style.display = 'none';
    statusText.textContent = 'OPENING CRATE...';

    sound.playCrateRoll();

    // Wait 1.4s then reveal
    setTimeout(() => {
      cubeElem.style.display = 'none';
      statusText.textContent = 'SKIN UNBOXED!';

      sound.playCrateReveal(skin.rarity);

      // Populate card
      document.getElementById('reward-rarity').textContent = skin.rarity.toUpperCase();
      document.getElementById('reward-skin-name').textContent = skin.name;
      document.getElementById('reward-skin-desc').textContent = skin.desc;

      const circle = document.getElementById('reward-skin-circle');
      circle.style.background = `radial-gradient(circle, ${skin.accentHex} 0%, ${skin.colorHex} 100%)`;

      rewardCard.style.display = 'flex';
      rewardCard.style.borderColor = skin.accentHex;
    }, 1400);
  }

  // =========================================================================
  // SKINS WARDROBE
  // =========================================================================
  renderSkinsGrid() {
    this.skinsGrid.innerHTML = '';

    const currentSkin = storage.getWeaponSkin(this.selectedWeaponId);

    Object.values(SKINS).forEach(skin => {
      const isUnlocked = storage.isSkinUnlocked(skin.id);
      const isEquipped = currentSkin === skin.id;

      const card = document.createElement('div');
      card.className = `skin-card ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}`;

      card.innerHTML = `
        <div class="skin-swatch" style="background: radial-gradient(circle, ${skin.accentHex} 0%, ${skin.colorHex} 100%)"></div>
        <span class="skin-card-name">${skin.name}</span>
        <span class="skin-card-rarity odd-badge ${skin.rarity}">${skin.rarity}</span>
        <span style="font-size: 11px; margin-top: 6px; color: ${isEquipped ? '#10b981' : isUnlocked ? '#cbd5e1' : '#f59e0b'};">
          ${isEquipped ? 'EQUIPPED' : isUnlocked ? 'CLICK TO EQUIP' : 'LOCKED (OPEN CRATES)'}
        </span>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          storage.setWeaponSkin(this.selectedWeaponId, skin.id);
          sound.playKeySound();
          this.renderSkinsGrid();
          this.update3DPreview();
        });
      }

      this.skinsGrid.appendChild(card);
    });
  }

  // =========================================================================
  // QUESTS LIST
  // =========================================================================
  renderQuestsList() {
    this.questsList.innerHTML = '';

    const allQuests = quests.getQuests();

    allQuests.forEach(q => {
      const card = document.createElement('div');
      card.className = `quest-item-card ${q.completed ? 'completed' : ''} ${q.claimed ? 'claimed' : ''}`;

      const pct = Math.min(100, Math.floor((q.progress / q.target) * 100));

      card.innerHTML = `
        <div class="quest-info">
          <h4 class="quest-title">${q.title}</h4>
          <p class="quest-desc">${q.desc}</p>
          <div class="quest-progress-bar-bg">
            <div class="quest-progress-fill" style="width: ${pct}%"></div>
          </div>
          <span style="font-size: 11px; color: #94a3b8; margin-top: 4px; display: inline-block;">
            Progress: ${q.progress} / ${q.target}
          </span>
        </div>
        <div class="quest-reward-side">
          <div class="quest-reward-badge">
            <span>🔑</span>
            <span>+${q.rewardKeys}</span>
          </div>
          ${
            q.claimed
              ? '<span style="font-size: 13px; font-weight: 700; color: #10b981;">CLAIMED</span>'
              : q.completed
              ? `<button class="rival-btn claim-btn" data-claim="${q.id}">CLAIM</button>`
              : '<span style="font-size: 12px; color: #64748b; font-weight: 700;">IN PROGRESS</span>'
          }
        </div>
      `;

      const claimBtn = card.querySelector(`[data-claim="${q.id}"]`);
      if (claimBtn) {
        claimBtn.addEventListener('click', () => {
          quests.claimReward(q.id);
          this.renderQuestsList();
          this.updateCurrencyDisplays();
        });
      }

      this.questsList.appendChild(card);
    });
  }

  // =========================================================================
  // HUD UPDATES & IN-GAME FEEDBACK
  // =========================================================================
  updateHUD(player) {
    if (!player) return;

    // Vitals
    const healthPct = Math.max(0, (player.health / player.maxHealth) * 100);
    this.hudHealthFill.style.width = `${healthPct}%`;
    this.hudHealthText.textContent = Math.ceil(player.health);

    const shieldPct = Math.max(0, (player.shield / player.maxShield) * 100);
    this.hudShieldFill.style.width = `${shieldPct}%`;
    this.hudShieldText.textContent = Math.ceil(player.shield);

    // Ammo & Weapon
    if (player.currentWeaponData) {
      this.hudWeaponName.textContent = player.currentWeaponData.name;
      const skin = SKINS[storage.getWeaponSkin(player.currentWeaponData.id)] || SKINS.default_matte;
      this.hudWeaponSkin.textContent = skin.name;

      this.hudAmmoCurrent.textContent = player.ammo;
      this.hudAmmoReserve.textContent = player.reserveAmmo;
    }

    // Active Slot Pills
    for (let i = 1; i <= 3; i++) {
      const pill = document.getElementById(`slot-pill-${i}`);
      if (pill) {
        if (player.currentSlot === i) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      }
    }

    // Sniper Scope Overlay
    if (player.isADS && player.currentWeaponData && player.currentWeaponData.id === 'sniper') {
      this.sniperScopeOverlay.style.display = 'block';
    } else {
      this.sniperScopeOverlay.style.display = 'none';
    }
  }

  showHitmarker(isHeadshot = false) {
    this.hitmarker.className = `hitmarker active ${isHeadshot ? 'headshot' : ''}`;
    setTimeout(() => {
      this.hitmarker.classList.remove('active');
    }, 150);
  }

  showDamageFlash() {
    this.damageVignette.classList.add('hit');
    setTimeout(() => {
      this.damageVignette.classList.remove('hit');
    }, 180);
  }

  showFloatingDamage(screenPos, damage, isHeadshot) {
    const el = document.createElement('div');
    el.className = `damage-number-elem ${isHeadshot ? 'crit' : ''}`;
    el.textContent = isHeadshot ? `CRIT! ${damage}` : damage;
    el.style.left = `${screenPos.x}px`;
    el.style.top = `${screenPos.y}px`;

    this.damageNumbersContainer.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 750);
  }

  showGemGain(amount, isHeadshot = false) {
    const el = document.createElement('div');
    el.className = 'gem-gain-float';
    el.textContent = `+${amount} 💎 ${isHeadshot ? '(HEADSHOT BONUS!)' : 'GEMS'}`;

    this.currencyGainContainer.appendChild(el);
    sound.playGemSound();
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1000);
  }

  addKillFeedEntry(killerName, victimName, weaponName, isHeadshot = false) {
    const entry = document.createElement('div');
    entry.className = `kf-item ${isHeadshot ? 'headshot' : ''}`;

    entry.innerHTML = `
      <span class="kf-killer">${killerName}</span>
      <span class="kf-weapon">[${weaponName}${isHeadshot ? ' 💀' : ''}]</span>
      <span class="kf-victim">${victimName}</span>
    `;

    this.killFeed.appendChild(entry);
    setTimeout(() => {
      if (entry.parentNode) entry.parentNode.removeChild(entry);
    }, 4500);
  }

  showKillAnnouncement(text, color = '#ff0055') {
    this.killAnnouncement.textContent = text;
    this.killAnnouncement.style.color = color;
    this.killAnnouncement.style.display = 'block';

    setTimeout(() => {
      this.killAnnouncement.style.display = 'none';
    }, 1200);
  }

  renderScoreboard() {
    const mapLabel = document.getElementById('sb-map-label');
    if (mapLabel) {
      mapLabel.textContent = `MAP: ${this.game.currentMapId ? this.game.currentMapId.toUpperCase() : 'ARENA'}`;
    }

    const rows = [
      { name: 'YOU (PLAYER)', kills: this.game.playerKills, headshots: this.game.playerHeadshots, deaths: this.game.playerDeaths, isPlayer: true }
    ];

    this.game.bots.forEach(b => {
      rows.push({
        name: b.name,
        kills: Math.floor(Math.random() * 4),
        headshots: Math.floor(Math.random() * 2),
        deaths: Math.floor(this.game.playerKills / this.game.bots.length) + 1,
        isPlayer: false
      });
    });

    // Sort by kills descending
    rows.sort((a, b) => b.kills - a.kills);

    this.sbTbody.innerHTML = '';
    rows.forEach(r => {
      const kd = r.deaths === 0 ? r.kills : (r.kills / r.deaths).toFixed(1);
      const score = r.kills * 100 + r.headshots * 50;
      const tr = document.createElement('tr');
      if (r.isPlayer) tr.className = 'sb-row-player';

      tr.innerHTML = `
        <td>${r.name}</td>
        <td>${r.kills}</td>
        <td>${r.headshots}</td>
        <td>${r.deaths}</td>
        <td>${kd}</td>
        <td>${score}</td>
      `;
      this.sbTbody.appendChild(tr);
    });
  }

  showMatchEnd(isVictory, gemsEarned, kills, headshots, keysEarned) {
    document.exitPointerLock();

    const banner = document.getElementById('match-end-banner');
    const sub = document.getElementById('match-end-sub');
    banner.textContent = isVictory ? 'VICTORY!' : 'MATCH FINISHED';
    banner.style.color = isVictory ? '#fbbf24' : '#38bdf8';
    sub.textContent = isVictory ? 'YOU DOMINATED THE COMBAT ARENA' : 'SOLID EFFORT IN COMBAT';

    document.getElementById('end-gems-earned').textContent = `+${gemsEarned}`;
    document.getElementById('end-kills-count').textContent = kills;
    document.getElementById('end-headshots-count').textContent = headshots;
    document.getElementById('end-keys-earned').textContent = `+${keysEarned}`;

    this.openModal(this.modalMatchEnd);
  }
}
