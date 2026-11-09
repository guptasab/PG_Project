# ⚡ RIVALS 3D - First Person Shooter

A fast-paced, high-octane 3D First Person Shooter inspired by the Roblox hit game **Rivals**. Built entirely in vanilla WebGL with Three.js and the Web Audio API, featuring zero external runtime dependencies.

---

## 🎮 Play Immediately

The game server is currently running on **Port 5000**:
👉 **Open in browser**: [http://localhost:5000](http://localhost:5000)

Or launch anytime using:
```bash
./play.sh
```

---

## 🌟 Core Features & Systems

### 1. 🎯 Dynamic First Person Combat & Movement
- **Pointer Lock Controls**: Smooth 360° mouse aiming with pitch clamping.
- **Sprint & Dynamic FOV**: Hold <kbd>Shift</kbd> to sprint with speed boost and camera FOV expansion.
- **Slide Dashing**: Press <kbd>C</kbd> or <kbd>Ctrl</kbd> while sprinting to initiate a slide dash with camera tilt and slide friction sound.
- **Jump Pads**: Interactive arena pads that launch you high into the air for aerial frags.
- **Aim Down Sights (ADS)**: Right-click to zoom in, tighten bullet spread, and aim down sights.
- **Hitmarkers & Floating Damage Numbers**:
  - White hitmarkers & damage text for body hits.
  - Golden critical hitmarkers, high-pitch "DING!" audio chime, and `CRIT! 150` text for headshots.
- **Tactical Health & Shield**:
  - 100 Health + 50 Armor/Shield.
  - Shield absorbs incoming damage first and automatically regenerates after 4 seconds out of combat.

---

### 2. 🔑 Keys & 💎 Gems Dual Economy

| Currency | How to Earn | What It's Used For |
|---|---|---|
| **Keys 🔑** | Complete combat challenges in the **Quests Tab** | Permanently unlock **New Guns** in the Arsenal |
| **Gems 💎** | Eliminate AI bots (+10 per kill, +5 headshot bonus) | Buy **Weapon Crates** to unbox rare & legendary Gun Skins |

---

### 3. 🔫 Weapons Arsenal

All weapons feature custom procedural 3D models with viewmodel recoil, muzzle flash, procedural sway, and bullet tracers:

1. **Rival AR-15** (Assault Rifle): Full-auto, 24 dmg body / 48 head, 600 RPM, 30 rounds *(Free / Starter)*
2. **Pump Shotgun**: Semi-auto, 8 pellets x 13 dmg (up to 104 body / 187 head), 6 rounds *(Cost: 5 Keys 🔑)*
3. **Viper Sniper**: Bolt-action with full-screen sniper scope, 110 body / 242 head (one-shot kill!), 5 rounds *(Cost: 10 Keys 🔑)*
4. **Dual Micro-SMGs**: Ultra-high fire rate (950 RPM), fast run speed, 40 rounds *(Cost: 12 Keys 🔑)*
5. **Combat Pistol**: Semi-auto sidearm, 34 body / 68 head, 12 rounds *(Free / Starter)*
6. **Rival Revolver**: Heavy sidearm punch, 65 body / 143 head, 6 rounds *(Cost: 8 Keys 🔑)*
7. **Tactical Knife**: Fast melee slash, 75 dmg *(Free / Starter)*
8. **Neon Katana**: High-frequency energy blade, 120 dmg *(Cost: 15 Keys 🔑)*

---

### 4. 📦 Crates & Gun Skins Customization

Buy crates with Gems and experience the 3D unboxing animation with sound effects and rarity fanfare:

- **Standard Crate (100 💎)**: Common (65%), Rare (25%), Epic (10%)
- **Elite Rivals Crate (250 💎)**: Rare (45%), Epic (40%), Legendary (15%)
- **Mythic Void Crate (500 💎)**: Epic (45%), Legendary (40%), Mythic (15%)

#### Available Skins:
- **Default Matte** (Common): Classic tactical dark matte finish.
- **Carbon Fiber** (Common): Woven graphite composite texture.
- **Arctic Blizzard** (Rare): Winter camouflage with icy blue accents.
- **Cyber Neon** (Rare): Glowing cyan and magenta neon cybernetic circuits.
- **Golden Royale** (Epic): 24k polished gold metallic luster.
- **Magma Core** (Epic): Molten volcanic crust with glowing lava veins.
- **Void Walker** (Legendary): Dark matter with ultraviolet energy runes.
- **Dragon Fire** (Legendary): Serrated crimson scales and flame emissives.
- **Galaxy Nebula** (Mythic): Cosmic deep space with twinkling star constellations.

---

### 5. 🗺️ 3D Battleground Maps

1. **The Backrooms (Level 0)**:
   - Infinite yellow wallpaper maze, damp carpet, fluorescent fixtures that flicker.
   - Creepy 60Hz ambient hum and yellow sepia fog.
2. **Rivals Neon Arena** (*Featured*):
   - Roblox Rivals-style stadium with multi-tier catwalks, tactical cover boxes, ramps, and functional jump launch pads.
3. **Warehouse Rumble**:
   - Shipping containers, overhead steel walkways with stairs, and vertical sniper perches.

---

### 6. 🤖 Smart AI Bots

- Roblox blocky avatar aesthetic with torso, head, limbs, and glowing visor.
- Line of sight raycasting, dynamic patrol, tactical strafing, ducking, and burst shooting.
- Separate critical head hitbox (takes 2x damage).
- Real-time health bars above bots' heads.
- Bot respawn system keeps matches active.

---

### 7. 📜 Quests System
- Track progress for challenges like:
  - *"First Blood"* (Kill 5 Bots) ➔ **+3 Keys 🔑**
  - *"Headhunter"* (Land 3 Headshots) ➔ **+5 Keys 🔑**
  - *"Close Quarters"* (4 Shotgun Kills) ➔ **+6 Keys 🔑**
  - *"Viper Sharpshooter"* (3 Sniper Kills) ➔ **+8 Keys 🔑**
  - *"Slide & Glide"* (2 Kills while sliding) ➔ **+5 Keys 🔑**
  - *"Arena Dominator"* (15 Total Kills) ➔ **+10 Keys 🔑**
- Claim keys directly from the Quests screen to buy new guns in the Arsenal!

---

### 8. 🔊 Web Audio API Procedural Sound Engine
Zero external audio files required! Synthesizes in real time:
- Gunshots (AR, Shotgun, Sniper, SMG, Pistol, Revolver, Melee)
- Hitmarker click & Headshot chime ("DING!")
- Kill triumph chord & Gem reward chime
- Crate unboxing roll, explosion, and fanfare
- Slide friction swoosh, footsteps, jumps, and hurt sounds
- Backrooms 60Hz ambient fluorescent drone
