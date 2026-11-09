/**
 * audio.js - Procedural Web Audio API sound synthesis for RIVALS 3D
 * Zero external audio files required, instant loading, 100% reliable.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.isMuted = false;
    this.ambientHumNode = null;
    this.musicInterval = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 1.0;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.25;
      this.musicGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Noise Buffer Helper ---
  createNoiseBuffer(duration = 0.5) {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // --- WEAPON SHOOTING SOUNDS ---

  playShootSound(weaponType = 'ar') {
    if (!this.initialized) this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    switch (weaponType) {
      case 'shotgun': {
        // Heavy low boom + wide white noise burst
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.25);
        oscGain.gain.setValueAtTime(0.8, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.25);

        // Noise blast
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.35);
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(2500, t);
        noiseFilter.frequency.exponentialRampToValueAtTime(300, t + 0.35);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(1.0, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(t);
        noise.stop(t + 0.35);
        break;
      }

      case 'sniper': {
        // Massive concussive explosion + crack
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(20, t + 0.5);
        oscGain.gain.setValueAtTime(1.0, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.5);

        // Crack noise
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.6);
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1800, t);
        noiseFilter.Q.value = 1.2;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(1.2, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(t);
        noise.stop(t + 0.6);
        break;
      }

      case 'smg': {
        // Fast, high-pitch snappy burst
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);
        oscGain.gain.setValueAtTime(0.4, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.08);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.09);
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

        noise.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(t);
        noise.stop(t + 0.09);
        break;
      }

      case 'pistol':
      case 'revolver': {
        // Crisp pop
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(weaponType === 'revolver' ? 180 : 250, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
        oscGain.gain.setValueAtTime(weaponType === 'revolver' ? 0.7 : 0.5, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.12);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.15);
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.6, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        noise.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(t);
        noise.stop(t + 0.15);
        break;
      }

      case 'knife':
      case 'katana': {
        // High speed whoosh / swish
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.18);
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1200, t);
        noiseFilter.frequency.exponentialRampToValueAtTime(400, t + 0.18);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.6, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(t);
        noise.stop(t + 0.18);
        break;
      }

      case 'ar':
      default: {
        // Standard punchy AR shot
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
        oscGain.gain.setValueAtTime(0.6, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.12);

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.16);
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(3200, t);
        noiseFilter.frequency.exponentialRampToValueAtTime(800, t + 0.16);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.8, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(t);
        noise.stop(t + 0.16);
        break;
      }
    }
  }

  // --- HITMARKER & COMBAT SOUNDS ---

  playHitmarker(isHeadshot = false) {
    if (!this.initialized) this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    if (isHeadshot) {
      // Crisp metallic double bell "DING!"
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(2200, t);
      osc2.frequency.setValueAtTime(3300, t);

      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.25);
      osc2.stop(t + 0.25);
    } else {
      // Short crisp click/tick
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1800, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.04);
    }
  }

  playKillSound() {
    if (!this.initialized) this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Triumphant chord
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.3, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4 + idx * 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.04);
      osc.stop(t + 0.45 + idx * 0.04);
    });
  }

  playGemSound() {
    if (!this.initialized) this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(2800, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  playKeySound() {
    if (!this.initialized) this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [880, 1100, 1320];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + i * 0.06);
      gain.gain.setValueAtTime(0.3, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2 + i * 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.06);
      osc.stop(t + 0.25 + i * 0.06);
    });
  }

  playReloadSound() {
    if (!this.initialized) this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Mag drop (t + 0.05), mag insert (t + 0.4), slide rack (t + 0.8)
    const playClick = (time, pitch) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(pitch, time);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, time + 0.06);
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.06);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.06);
    };

    playClick(t, 400); // Drop
    playClick(t + 0.35, 600); // Insert
    playClick(t + 0.7, 900); // Rack
  }

  playEmptyClick() {
    if (!this.initialized) this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900, t);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.03);
  }

  playJumpSound() {
    if (!this.initialized) this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.12);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playJumpPadLaunch() {
    if (!this.initialized) this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(850, t + 0.3);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  playSlideSound() {
    if (!this.initialized) this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.4);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.4);
  }

  playHurtSound() {
    if (!this.initialized) this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.15);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // --- CRATE UNBOXING SOUNDS ---

  playCrateRoll() {
    if (!this.initialized) this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(500, t + 1.2);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 1.1);
    gain.gain.setValueAtTime(0, t + 1.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 1.2);
  }

  playCrateReveal(rarity = 'common') {
    if (!this.initialized) this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Pop explosion
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.4);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    noise.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.4);

    // Chime fanfare
    const freqs = rarity === 'legendary' || rarity === 'mythic'
      ? [523.25, 659.25, 783.99, 1046.50, 1318.51]
      : [440, 554.37, 659.25, 880];

    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + i * 0.08);

      oscGain.gain.setValueAtTime(0, t);
      oscGain.gain.setValueAtTime(0.4, t + i * 0.08);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6 + i * 0.08);

      osc.connect(oscGain);
      oscGain.connect(this.sfxGain);
      osc.start(t + i * 0.08);
      osc.stop(t + 0.7 + i * 0.08);
    });
  }

  // --- AMBIENT SOUNDS ---

  startBackroomsHum() {
    if (!this.initialized) this.init();
    this.resume();
    if (!this.ctx || this.ambientHumNode) return;

    const t = this.ctx.currentTime;
    // 60Hz fluorescent mains hum + 120Hz harmonic
    const osc60 = this.ctx.createOscillator();
    const osc120 = this.ctx.createOscillator();
    const humGain = this.ctx.createGain();

    osc60.type = 'sawtooth';
    osc60.frequency.setValueAtTime(60, t);

    osc120.type = 'sine';
    osc120.frequency.setValueAtTime(120, t);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(240, t);

    humGain.gain.setValueAtTime(0.12, t);

    osc60.connect(filter);
    osc120.connect(filter);
    filter.connect(humGain);
    humGain.connect(this.masterGain);

    osc60.start();
    osc120.start();

    this.ambientHumNode = {
      stop: () => {
        try {
          osc60.stop();
          osc120.stop();
          osc60.disconnect();
          osc120.disconnect();
        } catch (e) {}
        this.ambientHumNode = null;
      }
    };
  }

  stopBackroomsHum() {
    if (this.ambientHumNode) {
      this.ambientHumNode.stop();
    }
  }
}

export const sound = new SoundEngine();
