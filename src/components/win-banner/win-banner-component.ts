import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { ASSETS } from '@/types/constants';
import { FontFamily, FontSize } from '@/enums/fonts';
import { CssColor } from '@/enums/colors';
import { AnimDuration, AnimEase } from '@/enums/animation';

export class WinBannerComponent {
  container: PIXI.Container;
  private winText: PIXI.Text;
  private winLabelText: PIXI.Text;
  private tl: gsap.core.Timeline | null = null;
  private resolve: (() => void) | null = null;

  constructor(x: number, y: number) {
    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;
    this.container.alpha = 0;

    const bg = new PIXI.Sprite(PIXI.Assets.get(ASSETS.WIN_BANNER));
    bg.anchor.set(0.5);
    bg.width  = 480;
    bg.height = 110;
    this.container.addChild(bg);

    this.winLabelText = new PIXI.Text({
      text: '',
      style: new PIXI.TextStyle({
        fontFamily: FontFamily.Heading, fontSize: FontSize.Xxl,
        fill: CssColor.WinTextDark, stroke: { color: CssColor.White, width: 3 },
      }),
    });
    this.winLabelText.anchor.set(0.5);
    this.winLabelText.y = -18;

    this.winText = new PIXI.Text({
      text: '',
      style: new PIXI.TextStyle({ fontFamily: FontFamily.Heading, fontSize: FontSize.Lg, fill: CssColor.WinTextDark }),
    });
    this.winText.anchor.set(0.5);
    this.winText.y = 26;

    this.container.addChild(this.winLabelText, this.winText);
  }

  show(amount: number, label = 'WIN'): Promise<void> {
    return new Promise(resolve => {
      this.resolve = resolve;
      this.winLabelText.text = label;
      this.winText.text = `+$${amount}`;
      this.container.alpha = 0;

      gsap.killTweensOf(this.container);
      gsap.killTweensOf(this.container.scale);
      this.tl?.kill();
      this.tl = gsap.timeline({ onComplete: () => { this.tl = null; } })
        .to(this.container, { alpha: 1, duration: AnimDuration.Slow, ease: AnimEase.Out })
        .fromTo(this.container.scale,
          { x: 0.5, y: 0.5 },
          { x: 1, y: 1, duration: AnimDuration.SlowFade, ease: AnimEase.BackOutHard }, '<')
        .to(this.container, { alpha: 0, duration: AnimDuration.SlowFade, delay: 2.2 })
        .call(() => { this.resolve?.(); this.resolve = null; });
    });
  }

  hide(): void {
    this.resolve?.();
    this.resolve = null;
    this.tl?.kill();
    this.tl = null;
    gsap.killTweensOf(this.container);
    gsap.to(this.container, { alpha: 0, duration: 0.15 });
  }

  destroy(): void {
    this.resolve?.();
    this.resolve = null;
    this.tl?.kill();
    this.tl = null;
    gsap.killTweensOf(this.container);
    gsap.killTweensOf(this.container.scale);
    this.container.destroy({ children: true });
  }
}