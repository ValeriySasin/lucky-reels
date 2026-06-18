import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { ASSETS } from '@/types/constants';
import { FontFamily, FontSize } from '@/enums/fonts';
import { CssColor } from '@/enums/colors';
import { AnimDuration, AnimEase } from '@/enums/animation';

export function useWinBanner(x: number, y: number) {
  const container = new PIXI.Container();
  container.x = x;
  container.y = y;
  container.alpha = 0;

  let tl: gsap.core.Timeline | null = null;
  let resolve: (() => void) | null = null;

  const bg = new PIXI.Sprite(PIXI.Assets.get(ASSETS.WIN_BANNER));
  bg.anchor.set(0.5);
  bg.width  = 480;
  bg.height = 110;
  container.addChild(bg);

  const winLabelText = new PIXI.Text({
    text: '',
    style: new PIXI.TextStyle({
      fontFamily: FontFamily.Heading,
      fontSize:   FontSize.Xxl,
      fill:       CssColor.WinTextDark,
      stroke:     { color: CssColor.White, width: 3 },
    }),
  });
  winLabelText.anchor.set(0.5);
  winLabelText.y = -18;

  const winText = new PIXI.Text({
    text: '',
    style: new PIXI.TextStyle({
      fontFamily: FontFamily.Heading,
      fontSize:   FontSize.Lg,
      fill:       CssColor.WinTextDark,
    }),
  });
  winText.anchor.set(0.5);
  winText.y = 26;

  container.addChild(winLabelText, winText);

  function show(amount: number, winLabel = 'WIN'): Promise<void> {
    return new Promise(res => {
      resolve = res;
      winLabelText.text = winLabel;
      winText.text      = `+$${amount}`;
      container.alpha   = 0;

      gsap.killTweensOf(container);
      gsap.killTweensOf(container.scale);
      tl?.kill();
      tl = gsap.timeline({ onComplete: () => { tl = null; } })
        .to(container, { alpha: 1, duration: AnimDuration.Slow, ease: AnimEase.Out })
        .fromTo(container.scale,
          { x: 0.5, y: 0.5 },
          { x: 1,   y: 1,   duration: AnimDuration.SlowFade, ease: AnimEase.BackOutHard }, '<')
        .to(container, { alpha: 0, duration: AnimDuration.SlowFade, delay: 2.2 })
        .call(() => { resolve?.(); resolve = null; });
    });
  }

  function hide(): void {
    resolve?.();
    resolve = null;
    tl?.kill();
    tl = null;
    gsap.killTweensOf(container);
    gsap.to(container, { alpha: 0, duration: 0.15 });
  }

  function destroy(): void {
    resolve?.();
    resolve = null;
    tl?.kill();
    tl = null;
    gsap.killTweensOf(container);
    gsap.killTweensOf(container.scale);
    container.destroy({ children: true });
  }

  return { container, show, hide, destroy };
}

export type WinBannerCtx = ReturnType<typeof useWinBanner>;
