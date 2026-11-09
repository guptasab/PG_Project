/**
 * quests.js - Quest system logic, event tracking & key reward claiming
 */

import { storage } from './storage.js';
import { sound } from './audio.js';

class QuestManager {
  constructor() {
    this.toastCallback = null;
  }

  setToastCallback(cb) {
    this.toastCallback = cb;
  }

  getQuests() {
    return storage.data.quests;
  }

  hasUnclaimedQuests() {
    return storage.data.quests.some(q => q.completed && !q.claimed);
  }

  claimReward(questId) {
    const quest = storage.data.quests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return false;

    quest.claimed = true;
    storage.addKeys(quest.rewardKeys);
    sound.playKeySound();
    storage.save();
    return true;
  }

  onKillEvent({ weaponId, isHeadshot = false, isSliding = false, killStreak = 1 }) {
    let updated = false;

    for (const quest of storage.data.quests) {
      if (quest.completed) continue;

      let inc = 0;

      if (quest.type === 'kills') {
        inc = 1;
      } else if (quest.type === 'headshots' && isHeadshot) {
        inc = 1;
      } else if (quest.type === 'sliding_kill' && isSliding) {
        inc = 1;
      } else if (quest.type === `weapon_${weaponId}`) {
        inc = 1;
      }

      if (inc > 0) {
        quest.progress = Math.min(quest.target, quest.progress + inc);
        updated = true;

        if (quest.progress >= quest.target) {
          quest.completed = true;
          sound.playKeySound();
          if (this.toastCallback) {
            this.toastCallback(`QUEST COMPLETE: ${quest.title} (+${quest.rewardKeys} 🔑)`);
          }
        }
      }
    }

    if (updated) {
      storage.save();
    }
  }
}

export const quests = new QuestManager();
