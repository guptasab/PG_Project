/**
 * storage.js - LocalStorage persistence and state manager for RIVALS 3D
 */

const STORAGE_KEY = 'rivals_fps_saved_data_v1';

const DEFAULT_STATE = {
  keys: 5,         // Keys earned from quests (enough to unlock Pump Shotgun right away or save!)
  gems: 150,       // Gems earned from killing bots (enough for a Standard Crate right away!)
  level: 1,
  xp: 40,
  xpToNextLevel: 100,

  // Weapon ownership & loadout
  unlockedWeapons: ['ar', 'pistol', 'knife'],
  equipped: {
    primary: 'ar',
    secondary: 'pistol',
    melee: 'knife'
  },

  // Active skin per weapon
  weaponSkins: {
    ar: 'default_matte',
    shotgun: 'default_matte',
    sniper: 'default_matte',
    smg: 'default_matte',
    pistol: 'default_matte',
    revolver: 'default_matte',
    knife: 'default_matte',
    katana: 'default_matte'
  },

  // All skins unlocked by user
  unlockedSkins: ['default_matte', 'carbon_fiber'],

  // Active Quests
  quests: [
    {
      id: 'q_kills_5',
      title: 'First Blood',
      desc: 'Eliminate 5 AI bots in any arena',
      progress: 0,
      target: 5,
      rewardKeys: 3,
      completed: false,
      claimed: false,
      type: 'kills'
    },
    {
      id: 'q_headshots_3',
      title: 'Headhunter',
      desc: 'Land 3 headshot eliminations',
      progress: 0,
      target: 3,
      rewardKeys: 5,
      completed: false,
      claimed: false,
      type: 'headshots'
    },
    {
      id: 'q_shotgun_kills',
      title: 'Close Quarters',
      desc: 'Eliminate 4 bots with the Pump Shotgun',
      progress: 0,
      target: 4,
      rewardKeys: 6,
      completed: false,
      claimed: false,
      type: 'weapon_shotgun'
    },
    {
      id: 'q_sniper_kills',
      title: 'Viper Sharpshooter',
      desc: 'Eliminate 3 bots with the Viper Sniper',
      progress: 0,
      target: 3,
      rewardKeys: 8,
      completed: false,
      claimed: false,
      type: 'weapon_sniper'
    },
    {
      id: 'q_slide_kills',
      title: 'Slide & Glide',
      desc: 'Eliminate 2 bots while slide-dashing',
      progress: 0,
      target: 2,
      rewardKeys: 5,
      completed: false,
      claimed: false,
      type: 'sliding_kill'
    },
    {
      id: 'q_match_champ',
      title: 'Arena Dominator',
      desc: 'Eliminate 15 bots across your matches',
      progress: 0,
      target: 15,
      rewardKeys: 10,
      completed: false,
      claimed: false,
      type: 'kills'
    }
  ],

  stats: {
    totalKills: 0,
    headshots: 0,
    deaths: 0,
    cratesOpened: 0,
    totalGemsEarned: 150,
    totalKeysEarned: 5
  }
};

class StorageManager {
  constructor() {
    this.data = this.load();
    this.listeners = [];
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with DEFAULT_STATE in case new fields were added
        return {
          ...DEFAULT_STATE,
          ...parsed,
          equipped: { ...DEFAULT_STATE.equipped, ...(parsed.equipped || {}) },
          weaponSkins: { ...DEFAULT_STATE.weaponSkins, ...(parsed.weaponSkins || {}) },
          stats: { ...DEFAULT_STATE.stats, ...(parsed.stats || {}) },
          quests: parsed.quests && parsed.quests.length > 0 ? parsed.quests : DEFAULT_STATE.quests
        };
      }
    } catch (e) {
      console.error('Failed to load save data, using default', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.notify();
    } catch (e) {
      console.error('Failed to save data', e);
    }
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.data);
  }

  notify() {
    for (const cb of this.listeners) {
      cb(this.data);
    }
  }

  // Currency helpers
  addGems(amount) {
    this.data.gems = Math.max(0, this.data.gems + amount);
    if (amount > 0) {
      this.data.stats.totalGemsEarned = (this.data.stats.totalGemsEarned || 0) + amount;
      this.addXP(Math.floor(amount / 2));
    }
    this.save();
    return this.data.gems;
  }

  spendGems(amount) {
    if (this.data.gems >= amount) {
      this.data.gems -= amount;
      this.save();
      return true;
    }
    return false;
  }

  addKeys(amount) {
    this.data.keys = Math.max(0, this.data.keys + amount);
    if (amount > 0) {
      this.data.stats.totalKeysEarned = (this.data.stats.totalKeysEarned || 0) + amount;
      this.addXP(amount * 10);
    }
    this.save();
    return this.data.keys;
  }

  spendKeys(amount) {
    if (this.data.keys >= amount) {
      this.data.keys -= amount;
      this.save();
      return true;
    }
    return false;
  }

  addXP(amount) {
    this.data.xp += amount;
    while (this.data.xp >= this.data.xpToNextLevel) {
      this.data.xp -= this.data.xpToNextLevel;
      this.data.level += 1;
      this.data.xpToNextLevel = Math.floor(this.data.xpToNextLevel * 1.35);
      // Level up reward: 2 bonus keys!
      this.data.keys += 2;
    }
    this.save();
  }

  // Weapon helpers
  isWeaponUnlocked(weaponId) {
    return this.data.unlockedWeapons.includes(weaponId);
  }

  unlockWeapon(weaponId, costKeys = 0) {
    if (this.isWeaponUnlocked(weaponId)) return true;
    if (costKeys > 0 && !this.spendKeys(costKeys)) return false;

    this.data.unlockedWeapons.push(weaponId);
    this.save();
    return true;
  }

  equipWeapon(category, weaponId) {
    if (!this.isWeaponUnlocked(weaponId)) return false;
    this.data.equipped[category] = weaponId;
    this.save();
    return true;
  }

  // Skin helpers
  isSkinUnlocked(skinId) {
    return this.data.unlockedSkins.includes(skinId);
  }

  unlockSkin(skinId) {
    if (!this.isSkinUnlocked(skinId)) {
      this.data.unlockedSkins.push(skinId);
      this.save();
    }
  }

  setWeaponSkin(weaponId, skinId) {
    if (this.isSkinUnlocked(skinId)) {
      this.data.weaponSkins[weaponId] = skinId;
      this.save();
      return true;
    }
    return false;
  }

  getWeaponSkin(weaponId) {
    return this.data.weaponSkins[weaponId] || 'default_matte';
  }
}

export const storage = new StorageManager();
