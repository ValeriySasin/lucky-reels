import * as PIXI from 'pixi.js';
import '@esotericsoftware/spine-pixi-v8';
import { GAME_WIDTH, GAME_HEIGHT } from './types/constants';
import { PreloadScene } from './scenes/PreloadScene';
import { LobbyScene } from './scenes/LobbyScene';
import { GameScene } from './scenes/GameScene';

async function start(): Promise<void> {
  const app = new PIXI.Application();

  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: 0x1a0a2e,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  const container = document.getElementById('game-container');
  if (!container) {
    console.error('No #game-container element found');
    return;
  }

  const canvas = app.canvas;
  canvas.style.display = 'block';
  canvas.style.position = 'absolute';
  container.appendChild(canvas);

  function resize(): void {
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const scale = Math.min(winW / GAME_WIDTH, winH / GAME_HEIGHT);
    const w = Math.round(GAME_WIDTH * scale);
    const h = Math.round(GAME_HEIGHT * scale);
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.style.left = `${Math.round((winW - w) / 2)}px`;
    canvas.style.top  = `${Math.round((winH - h) / 2)}px`;
  }

  resize();
  window.addEventListener('resize', resize);

  const preload = new PreloadScene();
  app.stage.addChild(preload.container);

  await preload.load();
  preload.destroy();

  const lobby = new LobbyScene();
  app.stage.addChild(lobby.container);
  await lobby.waitForClick();
  await lobby.hide();
  lobby.destroy();

  const game = new GameScene(app);
  app.stage.addChild(game.container);
  game.create();

  if (process.env.NODE_ENV === 'development') {
    (window as unknown as { pixiApp: PIXI.Application }).pixiApp = app;
  }
}

start().catch(err => console.error('Failed to start:', err));
