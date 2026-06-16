import * as PIXI from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT, ASSETS } from '@/types/constants';
import { FontFamily, FontSize } from '@/enums/fonts';
import { CssColor } from '@/enums/colors';
import { UiText } from '@/enums/ui-text';
import { AnimDurationMs } from '@/enums/animation';

const CX = GAME_WIDTH / 2;
const CY = GAME_HEIGHT / 2;

const BAR_W = 400;
const BAR_H = 28;

const MANIFEST: Array<{ alias: string; src: string }> = [
  { alias: ASSETS.SPINE_ATLAS,  src: 'assets/spine/spineboy.atlas'   },
  { alias: ASSETS.SPINE_SKEL,   src: 'assets/spine/spineboy.json'    },
  { alias: ASSETS.BG,           src: 'assets/background.png'         },
  { alias: ASSETS.REEL_FRAME,   src: 'assets/reel_frame.png'         },
  { alias: ASSETS.SYMBOL_ATLAS, src: 'assets/symbols/symbols.json'   },
  { alias: ASSETS.LOGO,         src: 'assets/ui/logo.png'            },
  { alias: ASSETS.WIN_BANNER,   src: 'assets/ui/win_banner.png'      },
  { alias: ASSETS.PARTICLE,     src: 'assets/ui/particle.png'        },
  { alias: ASSETS.BOTTOM_PANEL, src: 'assets/ui/bottom_panel.png'    },
  { alias: ASSETS.SPIN_BUTTON,  src: 'assets/ui/spin_button.png'     },
];

export class PreloadScene {
  container: PIXI.Container;
  private barFill: PIXI.Graphics;
  private pctText: PIXI.Text;

  constructor() {
    this.container = new PIXI.Container();
    const { barFill, pctText } = this.buildUI();
    this.barFill = barFill;
    this.pctText = pctText;
  }

  private buildUI(): { barFill: PIXI.Graphics; pctText: PIXI.Text } {
    const bg = new PIXI.Graphics().rect(0, 0, GAME_WIDTH, GAME_HEIGHT).fill(0x1a0a2e);
    this.container.addChild(bg);

    const stars = new PIXI.Graphics();
    for (let i = 0; i < 60; i++) {
      stars
        .circle(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT, Math.random() * 2 + 0.5)
        .fill({ color: 0xffffff, alpha: Math.random() * 0.7 + 0.3 });
    }
    this.container.addChild(stars);

    const title = new PIXI.Text({
      text: UiText.TitleShort,
      style: new PIXI.TextStyle({
        fontFamily: FontFamily.Heading,
        fontSize:   FontSize.Hero,
        fill:       CssColor.Gold,
        stroke:     { color: CssColor.PurpleDark, width: 8 },
        dropShadow: { color: CssColor.Black, blur: 8, angle: Math.PI / 4, distance: 4, alpha: 1 },
      }),
    });
    title.anchor.set(0.5);
    title.x = CX;
    title.y = CY - 180;
    this.container.addChild(title);

    const loadingText = new PIXI.Text({
      text: UiText.Loading,
      style: new PIXI.TextStyle({ fontFamily: FontFamily.Body, fontSize: FontSize.Md, fill: CssColor.LavenderHint }),
    });
    loadingText.anchor.set(0.5);
    loadingText.x = CX;
    loadingText.y = CY - 120;
    this.container.addChild(loadingText);

    const barBg = new PIXI.Graphics()
      .roundRect(CX - BAR_W / 2 - 10, CY - 20, BAR_W + 20, BAR_H + 12, 20)
      .fill({ color: 0x000000, alpha: 0.6 })
      .stroke({ color: 0x6633aa, width: 2 });
    this.container.addChild(barBg);

    const barFill = new PIXI.Graphics();
    this.container.addChild(barFill);

    const pctText = new PIXI.Text({
      text: '0%',
      style: new PIXI.TextStyle({ fontFamily: FontFamily.Body, fontSize: FontSize.Md, fill: CssColor.LavenderUI }),
    });
    pctText.anchor.set(0.5);
    pctText.x = CX;
    pctText.y = CY + 40;
    this.container.addChild(pctText);

    return { barFill, pctText };
  }

  private updateBar(v: number): void {
    this.barFill.clear();
    const w = BAR_W * v;
    if (w > 0) this.barFill.roundRect(CX - BAR_W / 2, CY - BAR_H / 2, w, BAR_H, BAR_H / 2).fill(0x9933ff);
    this.pctText.text = `${Math.floor(v * 100)}%`;
  }

  async load(): Promise<void> {
    PIXI.Assets.add(MANIFEST);

    await PIXI.Assets.load(MANIFEST.map(e => e.alias), (p: number) => this.updateBar(p));

    this.updateBar(1);
    await new Promise<void>(r => setTimeout(r, AnimDurationMs.SceneIntro));
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}