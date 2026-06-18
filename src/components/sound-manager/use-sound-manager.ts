import { ASSETS } from '@/types/constants';
import { ProceduralSounds } from '@/utils/ProceduralSounds';

const PROCEDURAL_MAP: Record<string, () => void> = {
  [ASSETS.SFX_CLICK]: () => ProceduralSounds.click(),
  [ASSETS.SFX_SPIN]:  () => ProceduralSounds.spin(),
  [ASSETS.SFX_STOP]:  () => ProceduralSounds.stop(),
  [ASSETS.SFX_WIN]:   () => ProceduralSounds.win(),
};

export function useSoundManager() {
  let enabled = true;

  function init(): void {
    if (enabled) ProceduralSounds.startBgMusic();
  }

  function play(key: string): void {
    if (!enabled) return;
    PROCEDURAL_MAP[key]?.();
  }

  function toggle(): boolean {
    enabled = !enabled;
    if (enabled) {
      ProceduralSounds.unmute();
      ProceduralSounds.startBgMusic();
    } else {
      ProceduralSounds.stopBgMusic();
      ProceduralSounds.mute();
    }
    return enabled;
  }

  function destroy(): void {
    ProceduralSounds.destroy();
  }

  return { init, play, toggle, destroy };
}

export type SoundManagerCtx = ReturnType<typeof useSoundManager>;
