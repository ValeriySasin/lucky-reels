import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { FontFamily, FontSize } from '@/enums/fonts';
import { CssColor } from '@/enums/colors';
import { SpinBtn } from '@/enums/ui-layout';
import { AnimDuration } from '@/enums/animation';
import { UiText } from '@/enums/ui-text';

interface ButtonColors {
  fill:      number;
  stroke:    number;
  textColor: string;
}

function getColors(disabled: boolean): ButtonColors {
  return disabled
    ? { fill: 0x555555, stroke: 0x333333, textColor: CssColor.BtnDisabled }
    : { fill: 0xe8a020, stroke: 0xffd700, textColor: CssColor.White };
}

function drawButton(bg: PIXI.Graphics, disabled: boolean): void {
  bg.clear();
  const { fill, stroke } = getColors(disabled);
  const R = SpinBtn.R;

  if (disabled) {
    bg
      .circle(3, 4, R).fill({ color: 0x000000, alpha: SpinBtn.ShadowAlpha })
      .circle(0, 0, R).fill(0x333333)
      .ellipse(0, -R * 0.3, R * 1.2, R * 0.7).fill({ color: 0x444444, alpha: 0.3 })
      .circle(0, 0, R).stroke({ color: 0x555555, width: SpinBtn.BorderWidth, alpha: 0.8 });
    return;
  }

  bg
    .circle(0, 0, SpinBtn.RingR).fill({ color: 0xffd700, alpha: 0.12 })
    .circle(0, 0, SpinBtn.RingR).stroke({ color: 0xffd700, width: 2, alpha: 0.3 })
    .circle(3, 5, R).fill({ color: 0x000000, alpha: SpinBtn.ShadowAlpha })
    .circle(0, 0, R).fill(0xaa6600)
    .circle(0, 0, R - 3).fill(fill)
    .ellipse(0, -R * 0.32, R * 1.2, R * 0.65).fill({ color: 0xffffff, alpha: SpinBtn.HighlightA })
    .circle(0, 0, R).stroke({ color: stroke, width: SpinBtn.BorderWidth })
    .circle(0, 0, R - 7).stroke({ color: 0xffee44, width: 1.5, alpha: 0.35 });
}

export function useSpinButton(x: number, y: number, onClick: () => void) {
  let disabled = false;
  let labelStr: string = UiText.SpinLabel;

  const container = new PIXI.Container();
  container.x = x;
  container.y = y;

  const bg = new PIXI.Graphics();
  drawButton(bg, disabled);
  container.addChild(bg);

  const label = new PIXI.Text({
    text: labelStr,
    style: new PIXI.TextStyle({
      fontFamily: FontFamily.Heading,
      fontSize:   FontSize.Xl,
      fill:       CssColor.White,
      stroke:     { color: CssColor.Black, width: 3 },
    }),
  });
  label.anchor.set(0.5);
  container.addChild(label);

  const hit = new PIXI.Graphics()
    .circle(0, 0, SpinBtn.HitR)
    .fill({ color: 0xffffff, alpha: 0 });
  hit.eventMode = 'static';
  hit.cursor    = 'pointer';
  container.addChild(hit);

  hit.on('pointerover', () => {
    if (!disabled) gsap.to(container.scale, { x: 1.07, y: 1.07, duration: AnimDuration.Normal });
  });
  hit.on('pointerout', () => {
    gsap.to(container.scale, { x: 1, y: 1, duration: AnimDuration.Normal });
  });
  hit.on('pointerdown', () => {
    if (!disabled) gsap.to(container.scale, { x: 0.93, y: 0.93, duration: AnimDuration.Fast });
  });
  hit.on('pointerup', () => {
    if (!disabled) {
      gsap.to(container.scale, { x: 1, y: 1, duration: AnimDuration.Fast });
      onClick();
    }
  });

  function setDisabled(value: boolean): void {
    disabled = value;
    drawButton(bg, disabled);
    label.style.fill = getColors(disabled).textColor;
  }

  function setLabel(text: string): void {
    labelStr = text;
    label.text = text;
  }

  function destroy(): void {
    gsap.killTweensOf(container);
    gsap.killTweensOf(container.scale);
    hit.removeAllListeners();
    container.destroy({ children: true });
  }

  return { container, setDisabled, setLabel, destroy };
}

export type SpinButtonCtx = ReturnType<typeof useSpinButton>;
