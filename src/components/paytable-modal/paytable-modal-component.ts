import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { GAME_WIDTH, GAME_HEIGHT } from '@/types/constants';
import { PAYTABLE } from '@/types/models/paytable-row-model';
import { FontFamily, FontSize } from '@/enums/fonts';
import { CssColor } from '@/enums/colors';
import { AnimEase } from '@/enums/animation';

const CX = GAME_WIDTH / 2;
const MW = 700;
const MH = 560;

export class PaytableModalComponent {
  container: PIXI.Container;

  constructor() {
    this.container = new PIXI.Container();
    this.container.x = CX;
    this.container.y = GAME_HEIGHT / 2;
    this.container.visible = false;
    this.container.alpha = 0;
    this.container.zIndex = 100;

    const overlay = new PIXI.Graphics()
      .rect(-GAME_WIDTH / 2, -GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT)
      .fill({ color: 0x000000, alpha: 0.7 });
    overlay.eventMode = 'static';

    const panel = new PIXI.Graphics()
      .roundRect(-MW / 2, -MH / 2, MW, MH, 20)
      .fill(0x06021a)
      .stroke({ color: 0xffd700, width: 3 });

    const title = new PIXI.Text({
      text: 'PAYTABLE',
      style: new PIXI.TextStyle({
        fontFamily: FontFamily.Title, fontSize: FontSize.Xxl,
        fill: CssColor.Gold, stroke: { color: CssColor.Purple, width: 3 },
      }),
    });
    title.anchor.set(0.5);
    title.y = -MH / 2 + 40;

    this.container.addChild(overlay, panel, title);

    // rows
    const rowY0 = -MH / 2 + 110;
    const rowH = 76;

    PAYTABLE.forEach((row, i) => {
      const ry = rowY0 + i * rowH;
      const sym = row.symbols[0];

      for (let j = 0; j < 3; j++) {
        const img = new PIXI.Sprite(PIXI.Texture.from(`${sym}_idle_0`));
        img.anchor.set(0.5);
        img.width = img.height = 56;
        img.x = -280 + j * 70;
        img.y = ry;
        this.container.addChild(img);
      }

      const makeLabel = (text: string, x: number, fill: string) => {
        const t = new PIXI.Text({ text, style: new PIXI.TextStyle({ fontFamily: FontFamily.Heading, fontSize: FontSize.Lg, fill }) });
        t.anchor.set(0, 0.5);
        t.x = x;
        t.y = ry;
        this.container.addChild(t);
      };

      makeLabel('× 3', -100, CssColor.White);
      makeLabel(`×${row.multiplier} BET`, 120, CssColor.Gold);
      makeLabel(row.label, 290, CssColor.GoldLight);

      if (i < PAYTABLE.length - 1) {
        const ln = new PIXI.Graphics()
          .moveTo(-MW / 2 + 30, ry + rowH / 2)
          .lineTo(MW / 2 - 30, ry + rowH / 2)
          .stroke({ color: 0xffd700, width: 1, alpha: 0.25 });
        this.container.addChild(ln);
      }
    });

    // close button
    const closeBg = new PIXI.Graphics()
      .roundRect(-80, -20, 160, 40, 8)
      .fill(0x441100)
      .stroke({ color: 0xffd700, width: 1 });
    closeBg.y = MH / 2 - 40;

    const closeTxt = new PIXI.Text({
      text: '✕  CLOSE',
      style: new PIXI.TextStyle({ fontFamily: FontFamily.Heading, fontSize: FontSize.Xl, fill: CssColor.White }),
    });
    closeTxt.anchor.set(0.5);
    closeTxt.y = MH / 2 - 40;

    const closeHit = new PIXI.Graphics().roundRect(-80, -20, 160, 40, 8).fill({ color: 0xffffff, alpha: 0 });
    closeHit.y = MH / 2 - 40;
    closeHit.eventMode = 'static';
    closeHit.cursor = 'pointer';
    closeHit.on('pointerover', () => { closeTxt.style.fill = CssColor.Gold;  });
    closeHit.on('pointerout',  () => { closeTxt.style.fill = CssColor.White; });
    closeHit.on('pointerdown', () => this.hide());

    this.container.addChild(closeBg, closeTxt, closeHit);
  }

  show(): void {
    this.container.visible = true;
    gsap.to(this.container, { alpha: 1, duration: 0.25, ease: AnimEase.SineOut });
  }

  hide(): void {
    gsap.to(this.container, {
      alpha: 0, duration: 0.2, ease: AnimEase.SineIn,
      onComplete: () => { this.container.visible = false; },
    });
  }
}
