/**
 * main.js - Application entry point for RIVALS 3D
 */

import { GameEngine } from './game.js';
import { UIManager } from './ui.js';
import { sound } from './audio.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('Failed to locate game-canvas element');
    return;
  }

  // Initialize Core Game Engine
  const game = new GameEngine(canvas);

  // Initialize UI Manager
  const ui = new UIManager(game);
  game.setUI(ui);

  // Start Rendering Loop
  game.start();

  // User gesture listener to unlock Web Audio API seamlessly
  const unlockAudio = () => {
    sound.init();
    sound.resume();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  console.log('⚡ RIVALS 3D FPS Shooter initialized successfully!');
});
