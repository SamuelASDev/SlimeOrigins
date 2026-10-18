import {actorSize} from './actor-sizes';
import Phaser from 'phaser';
import { spriteFiles } from './asset-paths';

export const ART_KEYS = ['slime', 'beetle', 'snake', 'wolf', 'mushroom', 'moth', 'frog', 'wisp', 'bat', 'guardian', 'serpent', 'centipede', 'armorsaurus', 'spider', 'caveBoss'] as const;

export function preloadSpriteArt(scene: Phaser.Scene) {
  for (const key of ART_KEYS) { const file = spriteFiles[key]; scene.load.atlas(key, `/assets/sprites/${file}.png`, `/assets/sprites/${file}.json`); }
}

export function registerSpriteAnimations(scene: Phaser.Scene) {
  const make = (key: string, texture: string, frames: string[], rate: number, repeat = -1) => {
    if (!scene.anims.exists(key)) scene.anims.create({ key, frames: frames.map(frame => ({ key: texture, frame })), frameRate: rate, repeat });
  };
  make('slime-idle', 'slime', ['idle-0', 'idle-1', 'idle-2', 'idle-3', 'idle-2', 'idle-1'], 5);
  make('slime-walk', 'slime', ['walk-0', 'walk-1', 'walk-2', 'walk-3', 'walk-4', 'walk-5'], 9);
  make('slime-attack', 'slime', ['attack-0', 'attack-1', 'attack-2'], 12, 0);
  make('slime-hurt', 'slime', ['hurt-0'], 5, 0);
  make('slime-happy', 'slime', ['happy-0', 'idle-0'], 3, 0);
  for (const key of ART_KEYS.filter(key => key !== 'slime')) {
    make(`${key}-idle`, key, ['0', '1'], 3);
    make(`${key}-walk`, key, ['0', '1'], 7);
    make(`${key}-attack`, key, ['2', '3', '3', '0'], 8, 0);
  }
}

export function makeActor(scene: Phaser.Scene, x: number, y: number, key: string) {
  const firstFrame = key === 'slime' ? 'idle-0' : '0';
  const sprite = scene.add.sprite(x, y, key, firstFrame).setOrigin(.5, 1);
  // Calibrate visible body size using the neutral pose, retaining one scale for all frames.
  sprite.setScale(actorSize(key).width / scene.textures.getFrame(key, firstFrame).cutWidth);
  sprite.play(`${key}-idle`);
  return sprite;
}
