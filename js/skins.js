/**
 * skins.js - Gun skins registry, crate unboxing loot tables & Three.js material applicator
 */

import * as THREE from '../lib/three.module.js';

export const SKINS = {
  default_matte: {
    id: 'default_matte',
    name: 'Default Matte',
    rarity: 'common',
    colorHex: '#334155',
    accentHex: '#64748b',
    emissiveHex: '#000000',
    metalness: 0.2,
    roughness: 0.8,
    desc: 'Standard issue military tactical matte coating.'
  },
  carbon_fiber: {
    id: 'carbon_fiber',
    name: 'Carbon Fiber',
    rarity: 'common',
    colorHex: '#18181b',
    accentHex: '#3f3f46',
    emissiveHex: '#000000',
    metalness: 0.6,
    roughness: 0.4,
    desc: 'Lightweight woven composite fibers with diamond sheen.'
  },
  arctic_camo: {
    id: 'arctic_camo',
    name: 'Arctic Blizzard',
    rarity: 'rare',
    colorHex: '#e2e8f0',
    accentHex: '#38bdf8',
    emissiveHex: '#0284c7',
    metalness: 0.4,
    roughness: 0.5,
    desc: 'Sub-zero winter warfare camouflage with frost accents.'
  },
  cyber_neon: {
    id: 'cyber_neon',
    name: 'Cyber Neon',
    rarity: 'rare',
    colorHex: '#0f172a',
    accentHex: '#00f2fe',
    emissiveHex: '#00f2fe',
    emissiveIntensity: 0.7,
    metalness: 0.5,
    roughness: 0.3,
    desc: 'High-tech neon cyan and hot pink cybernetic circuitry.'
  },
  golden_royale: {
    id: 'golden_royale',
    name: 'Golden Royale',
    rarity: 'epic',
    colorHex: '#eab308',
    accentHex: '#fef08a',
    emissiveHex: '#ca8a04',
    emissiveIntensity: 0.3,
    metalness: 0.95,
    roughness: 0.15,
    desc: 'Pure 24k polished gold reserved for arena champions.'
  },
  magma_core: {
    id: 'magma_core',
    name: 'Magma Core',
    rarity: 'epic',
    colorHex: '#7f1d1d',
    accentHex: '#f97316',
    emissiveHex: '#ff4400',
    emissiveIntensity: 0.85,
    metalness: 0.4,
    roughness: 0.5,
    desc: 'Cracked obsidian crust with bubbling molten lava.'
  },
  void_walker: {
    id: 'void_walker',
    name: 'Void Walker',
    rarity: 'legendary',
    colorHex: '#1e1035',
    accentHex: '#a855f7',
    emissiveHex: '#9333ea',
    emissiveIntensity: 0.9,
    metalness: 0.7,
    roughness: 0.25,
    desc: 'Dimensional dark matter humming with void energy.'
  },
  dragon_fire: {
    id: 'dragon_fire',
    name: 'Dragon Fire',
    rarity: 'legendary',
    colorHex: '#991b1b',
    accentHex: '#fbbf24',
    emissiveHex: '#ef4444',
    emissiveIntensity: 0.9,
    metalness: 0.85,
    roughness: 0.3,
    desc: 'Forged in dragon flame with serrated golden scales.'
  },
  galaxy_stars: {
    id: 'galaxy_stars',
    name: 'Galaxy Nebula',
    rarity: 'mythic',
    colorHex: '#09091f',
    accentHex: '#f43f5e',
    emissiveHex: '#818cf8',
    emissiveIntensity: 1.1,
    metalness: 0.8,
    roughness: 0.2,
    desc: 'A swirl of cosmic constellations and twinkling nebulae.'
  }
};

export const CRATES = {
  standard: {
    id: 'standard',
    name: 'Standard Crate',
    cost: 100,
    pool: {
      common: ['default_matte', 'carbon_fiber'],
      rare: ['arctic_camo', 'cyber_neon'],
      epic: ['golden_royale', 'magma_core']
    },
    odds: {
      common: 0.65,
      rare: 0.25,
      epic: 0.10
    }
  },
  rivals: {
    id: 'rivals',
    name: 'Elite Rivals Crate',
    cost: 250,
    pool: {
      rare: ['arctic_camo', 'cyber_neon'],
      epic: ['golden_royale', 'magma_core'],
      legendary: ['void_walker', 'dragon_fire']
    },
    odds: {
      rare: 0.45,
      epic: 0.40,
      legendary: 0.15
    }
  },
  void: {
    id: 'void',
    name: 'Mythic Void Crate',
    cost: 500,
    pool: {
      epic: ['golden_royale', 'magma_core'],
      legendary: ['void_walker', 'dragon_fire'],
      mythic: ['galaxy_stars']
    },
    odds: {
      epic: 0.45,
      legendary: 0.40,
      mythic: 0.15
    }
  }
};

export function rollCrate(crateId) {
  const crate = CRATES[crateId];
  if (!crate) return null;

  const rand = Math.random();
  let cumulative = 0;
  let chosenRarity = Object.keys(crate.odds)[0];

  for (const [rarity, prob] of Object.entries(crate.odds)) {
    cumulative += prob;
    if (rand <= cumulative) {
      chosenRarity = rarity;
      break;
    }
  }

  const skinCandidates = crate.pool[chosenRarity] || crate.pool[Object.keys(crate.pool)[0]];
  const skinId = skinCandidates[Math.floor(Math.random() * skinCandidates.length)];

  return SKINS[skinId];
}

// Procedural texture generator for animated/glowing skins
const textureCache = new Map();

function createProceduralSkinTexture(skin) {
  if (textureCache.has(skin.id)) {
    return textureCache.get(skin.id);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Fill base
  ctx.fillStyle = skin.colorHex;
  ctx.fillRect(0, 0, 256, 256);

  if (skin.id === 'carbon_fiber') {
    // Checker carbon weave
    ctx.fillStyle = skin.accentHex;
    for (let x = 0; x < 256; x += 16) {
      for (let y = 0; y < 256; y += 16) {
        if ((x + y) % 32 === 0) {
          ctx.fillRect(x, y, 16, 16);
        }
      }
    }
  } else if (skin.id === 'arctic_camo') {
    // Camo patches
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 20; i++) {
      const cx = Math.random() * 256;
      const cy = Math.random() * 256;
      const r = 20 + Math.random() * 30;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = skin.accentHex;
    for (let i = 0; i < 15; i++) {
      const cx = Math.random() * 256;
      const cy = Math.random() * 256;
      const r = 12 + Math.random() * 20;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (skin.id === 'cyber_neon') {
    // Cyber circuit grid lines
    ctx.strokeStyle = skin.accentHex;
    ctx.lineWidth = 4;
    for (let i = 20; i < 256; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
    }
  } else if (skin.id === 'magma_core') {
    // Glowing lava cracks
    ctx.strokeStyle = skin.accentHex;
    ctx.lineWidth = 6;
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 256, Math.random() * 256);
      ctx.lineTo(Math.random() * 256, Math.random() * 256);
      ctx.stroke();
    }
  } else if (skin.id === 'galaxy_stars') {
    // Stars & nebulae
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = '#ffffff';
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const s = Math.random() * 3 + 1;
      ctx.fillRect(x, y, s, s);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set(skin.id, texture);
  return texture;
}

/**
 * Applies skin styling to a Three.js Mesh or Model group
 */
export function applySkinToModel(modelGroup, skinId) {
  const skin = SKINS[skinId] || SKINS.default_matte;
  const texture = createProceduralSkinTexture(skin);

  modelGroup.traverse((child) => {
    if (child.isMesh) {
      // Determine if child is an accent/glow piece or main body
      const isAccent = child.name && (child.name.includes('accent') || child.name.includes('glow') || child.name.includes('sight'));

      const material = new THREE.MeshStandardMaterial({
        color: isAccent ? new THREE.Color(skin.accentHex) : new THREE.Color(skin.colorHex),
        map: texture,
        metalness: skin.metalness,
        roughness: skin.roughness,
        emissive: isAccent
          ? new THREE.Color(skin.emissiveHex)
          : (skin.emissiveIntensity ? new THREE.Color(skin.emissiveHex) : new THREE.Color(0x000000)),
        emissiveIntensity: isAccent ? (skin.emissiveIntensity || 0.6) : (skin.emissiveIntensity ? skin.emissiveIntensity * 0.4 : 0)
      });

      child.material = material;
    }
  });
}
