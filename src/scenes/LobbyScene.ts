import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { GAME_WIDTH, GAME_HEIGHT, ASSETS } from '@/types/constants';
import { FontFamily, FontSize } from '@/enums/fonts';
import { CssColor } from '@/enums/colors';
import { UiText } from '@/enums/ui-text';

const CX = GAME_WIDTH / 2;
const CY = GAME_HEIGHT / 2;

export class LobbyScene {
  container: PIXI.Container;

  private pulseTl: gsap.core.Timeline | null = null;

  constructor() {
    this.container = new PIXI.Container();
    this.buildUI();
  }

  private buildUI(): void {
    const bg = new PIXI.Sprite(PIXI.Assets.get(ASSETS.BG));
    bg.width  = GAME_WIDTH;
    bg.height = GAME_HEIGHT;
    this.container.addChild(bg);

    const logo = new PIXI.Sprite(PIXI.Assets.get(ASSETS.LOGO));
    logo.anchor.set(0.5);
    logo.x = CX;
    logo.y = CY - 160;
    logo.width  = 480;
    logo.height = 160;
    this.container.addChild(logo);

    const hint = new PIXI.Text({
      text: UiText.ClickToContinue,
      style: new PIXI.TextStyle({
        fontFamily: FontFamily.Heading,
        fontSize:   FontSize.Xl,
        fill:       CssColor.Gold,
        stroke:     { color: CssColor.PurpleDark, width: 4 },
        dropShadow: { color: CssColor.Black, blur: 8, angle: Math.PI / 2, distance: 3, alpha: 0.9 },
      }),
    });
    hint.anchor.set(0.5);
    hint.x = CX;
    hint.y = CY + 60;
    this.container.addChild(hint);

    this.pulseTl = gsap.timeline({ repeat: -1, yoyo: true })
      .to(hint, { alpha: 0.2, duration: 0.9, ease: 'sine.inOut' });
  }

  waitForClick(): Promise<void> {
    return new Promise(resolve => {
      this.container.eventMode = 'static';
      this.container.cursor = 'pointer';
      this.container.once('pointerdown', () => {
        this.container.eventMode = 'none';
        resolve();
      });
    });
  }

  async hide(): Promise<void> {
    this.pulseTl?.kill();
    await new Promise<void>(r => {
      gsap.to(this.container, { alpha: 0, duration: 0.4, ease: 'power2.in', onComplete: r });
    });
  }

  destroy(): void {
    this.pulseTl?.kill();
    this.container.destroy({ children: true });
  }
}
