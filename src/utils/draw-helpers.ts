import * as PIXI from 'pixi.js';
import { UiBox } from '@/enums/ui-layout';
import { FontFamily, FontSize } from '@/enums/fonts';
import { CssColor } from '@/enums/colors';

export function drawInfoBox(
  g: PIXI.Graphics,
  cx: number,
  cy: number,
  w: number = UiBox.Width,
  h: number = UiBox.Height,
  r: number = UiBox.Radius,
): void {
  // Drop shadow
  g.roundRect(cx - w / 2 + 3, cy - h / 2 + 4, w, h, r)
   .fill({ color: 0x000000, alpha: 0.5 });

  // Dark body
  g.roundRect(cx - w / 2, cy - h / 2, w, h, r)
   .fill({ color: 0x06021a, alpha: UiBox.FillAlpha });

  // Top inner highlight
  g.roundRect(cx - w / 2 + 2, cy - h / 2 + 2, w - 4, h * 0.42, r - 2)
   .fill({ color: 0xffffff, alpha: 0.05 });

  // Outer gold border
  g.roundRect(cx - w / 2, cy - h / 2, w, h, r)
   .stroke({ color: 0xffd700, width: UiBox.BorderWidth, alpha: UiBox.BorderAlpha });

  // Inner accent line
  g.roundRect(cx - w / 2 + 3, cy - h / 2 + 3, w - 6, h - 6, r - 2)
   .stroke({ color: 0xffee44, width: 1, alpha: 0.3 });
}

export function addLabelValue(
  parent: PIXI.Container,
  cx: number,
  cy: number,
  label: string,
  value: string,
  valueColor: string = CssColor.Gold,
): PIXI.Text {
  const labelText = new PIXI.Text({
    text: label,
    style: new PIXI.TextStyle({
      fontFamily: FontFamily.Label,
      fontSize:   FontSize.Xs,
      fill:       CssColor.LavenderUI,
      letterSpacing: 2,
    }),
  });
  labelText.anchor.set(0.5);
  labelText.x = cx;
  labelText.y = cy - 12;
  parent.addChild(labelText);

  const valueText = new PIXI.Text({
    text: value,
    style: new PIXI.TextStyle({
      fontFamily: FontFamily.Heading,
      fontSize:   FontSize.Xl,
      fill:       valueColor,
    }),
  });
  valueText.anchor.set(0.5);
  valueText.x = cx;
  valueText.y = cy + 14;
  parent.addChild(valueText);

  return valueText;
}