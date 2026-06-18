import * as PIXI from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { ASSETS } from '@/types/constants';

export function useSpineChar(parent: PIXI.Container, x: number, y: number) {
  const container = new PIXI.Container();
  container.position.set(x, y);

  const ch = Spine.from({ skeleton: ASSETS.SPINE_SKEL, atlas: ASSETS.SPINE_ATLAS });
  ch.scale.set(0.45);

  // after jump — return to idle automatically
  const listener: Parameters<typeof ch.state.addListener>[0] = {
    complete: (e) => {
      if (e.animation?.name === 'jump') idle();
    },
  };
  ch.state.addListener(listener);

  container.addChild(ch);
  parent.addChild(container);

  function spin()    { ch.state.setAnimation(0, 'run',  true);  }
  function win()     { ch.state.setAnimation(0, 'jump', false); }
  function idle()    { ch.state.setAnimation(0, 'idle', true);  }
  function destroy() {
    ch.state.removeListener(listener);
    container.destroy({ children: true });
  }

  idle();

  return { spin, win, idle, destroy };
}

export type SpineCharCtx = ReturnType<typeof useSpineChar>;