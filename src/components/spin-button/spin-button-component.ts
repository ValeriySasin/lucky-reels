import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { useSpinButton, SpinButtonLogic } from './use-spin-button';
import { FontFamily, FontSize } from '@/enums/fonts';
import { CssColor } from '@/enums/colors';
import { SpinBtn } from '@/enums/ui-layout';
import { AnimDuration } from '@/enums/animation';

export class SpinButtonComponent {
  container: PIXI.Container;
  private bg:    PIXI.Graphics;
  private label: PIXI.Text;
  private hit:   PIXI.Graphics;
  private logic: SpinButtonLogic;
  private cb: () => void;

  constructor(x: number, y: number, onClick: () => void) {
    this.cb = onClick;
    this.logic     = useSpinButton();
    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;

    this.bg = new PIXI.Graphics();
    this.drawButton();
    this.container.addChild(this.bg);

    this.label = new PIXI.Text({
      text: this.logic.getLabel(),
      style: new PIXI.TextStyle({
        fontFamily: FontFamily.Heading,
        fontSize:   FontSize.Xl,
        fill:       CssColor.White,
        stroke:     { color: CssColor.Black, width: 3 },
      }),
    });
    this.label.anchor.set(0.5);
    this.container.addChild(this.label);

    this.hit = this.setupInteractivity();
  }

  private setupInteractivity(): PIXI.Graphics {
    const R = SpinBtn.HitR;
    const hit = new PIXI.Graphics()
      .circle(0, 0, R)
      .fill({ color: 0xffffff, alpha: 0 });
    hit.eventMode = 'static';
    hit.cursor    = 'pointer';
    this.container.addChild(hit);

    hit.on('pointerover', () => {
      if (!this.logic.isDisabled()) {
        gsap.to(this.container.scale, { x: 1.07, y: 1.07, duration: AnimDuration.Normal });
      }
    });

    hit.on('pointerout', () => {
      gsap.to(this.container.scale, { x: 1, y: 1, duration: AnimDuration.Normal });
    });

    hit.on('pointerdown', () => {
      if (!this.logic.isDisabled()) {
        gsap.to(this.container.scale, { x: 0.93, y: 0.93, duration: AnimDuration.Fast });
      }
    });

    hit.on('pointerup', () => {
      if (!this.logic.isDisabled()) {
        gsap.to(this.container.scale, { x: 1, y: 1, duration: AnimDuration.Fast });
        this.cb();
      }
    });

    return hit;
  }

  private drawButton(): void {
    this.bg.clear();
    const { fill, stroke } = this.logic.getColors();
    const R = SpinBtn.R;

    if (this.logic.isDisabled()) {
      this.bg
        .circle(3, 4, R).fill({ color: 0x000000, alpha: SpinBtn.ShadowAlpha })
        .circle(0, 0, R).fill(0x333333)
        .ellipse(0, -R * 0.3, R * 1.2, R * 0.7).fill({ color: 0x444444, alpha: 0.3 })
        .circle(0, 0, R).stroke({ color: 0x555555, width: SpinBtn.BorderWidth, alpha: 0.8 });
      return;
    }

    // Outer glow ring
    this.bg
      .circle(0, 0, SpinBtn.RingR).fill({ color: 0xffd700, alpha: 0.12 })
      .circle(0, 0, SpinBtn.RingR).stroke({ color: 0xffd700, width: 2, alpha: 0.3 });

    // Drop shadow
    this.bg.circle(3, 5, R).fill({ color: 0x000000, alpha: SpinBtn.ShadowAlpha });

    // Outer ring
    this.bg.circle(0, 0, R).fill(0xaa6600);

    // Main body
    this.bg.circle(0, 0, R - 3).fill(fill);

    // Top highlight
    this.bg.ellipse(0, -R * 0.32, R * 1.2, R * 0.65).fill({ color: 0xffffff, alpha: SpinBtn.HighlightA });

    // Gold border
    this.bg.circle(0, 0, R).stroke({ color: stroke, width: SpinBtn.BorderWidth });

    // Inner accent ring
    this.bg.circle(0, 0, R - 7).stroke({ color: 0xffee44, width: 1.5, alpha: 0.35 });
  }

  setDisabled(disabled: boolean): void {
    this.logic.setDisabled(disabled);
    this.drawButton();
    this.label.style.fill = this.logic.getColors().textColor;
  }

  setLabel(text: string): void {
    this.logic.setLabel(text);
    this.label.text = text;
  }

  destroy(): void {
    gsap.killTweensOf(this.container);
    gsap.killTweensOf(this.container.scale);
    this.hit.removeAllListeners();
    this.container.destroy({ children: true });
  }
}