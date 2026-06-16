import { ASSETS } from '@/types/constants';
import { useSoundManager, SoundManagerLogic } from './use-sound-manager';
import { ProceduralSounds } from '@/utils/ProceduralSounds';

const PROCEDURAL_MAP: Record<string, () => void> = {
  [ASSETS.SFX_CLICK]: () => ProceduralSounds.click(),
  [ASSETS.SFX_SPIN]:  () => ProceduralSounds.spin(),
  [ASSETS.SFX_STOP]:  () => ProceduralSounds.stop(),
  [ASSETS.SFX_WIN]:   () => ProceduralSounds.win(),
};

export class SoundManagerComponent {
  private logic: SoundManagerLogic;

  constructor() {
    this.logic = useSoundManager();
  }

  init(): void {
    if (this.logic.isEnabled()) {
      ProceduralSounds.startBgMusic();
    }
  }

  play(key: string): void {
    if (!this.logic.isEnabled()) return;
    if (PROCEDURAL_MAP[key]) {
      PROCEDURAL_MAP[key]();
    }
  }

  toggle(): boolean {
    const enabled = this.logic.toggle();
    if (enabled) {
      ProceduralSounds.unmute();
    } else {
      ProceduralSounds.mute();
      ProceduralSounds.stopBgMusic();
    }
    return enabled;
  }

  destroy(): void {
    ProceduralSounds.destroy();
  }
}
