import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { GAME_WIDTH, GAME_HEIGHT, ASSETS, REEL_COUNT, SYMBOL_SIZE, REEL_SPACING, SPIN_STAGGER } from '@/types/constants';
import { GameStateModel } from '@/types/models/game-state-model';
import { useReelComponent, ReelCtx } from '@/components/reel/use-reel-component';
import { SpinButtonComponent } from '@/components/spin-button/spin-button-component';
import { SoundManagerComponent } from '@/components/sound-manager/sound-manager-component';
import { useSpineChar, SpineCharCtx } from '@/components/spine-character/spine-character-component';
import { WinBannerComponent } from '@/components/win-banner/win-banner-component';
import { PaytableModalComponent } from '@/components/paytable-modal/paytable-modal-component';
import { drawInfoBox, addLabelValue } from '@/utils/draw-helpers';
import { gameApi, playerApi } from '@/api';
import { FontFamily, FontSize } from '@/enums/fonts';
import { UiText } from '@/enums/ui-text';
import { AnimDuration, AnimDurationMs, AnimEase } from '@/enums/animation';
import { CssColor } from '@/enums/colors';
import { ReelFrame } from '@/enums/ui-layout';

const CX = GAME_WIDTH / 2;
const FRAME_CY = Math.round(GAME_HEIGHT * 0.38);
const FRAME_W = REEL_COUNT * SYMBOL_SIZE + (REEL_COUNT - 1) * REEL_SPACING + 60;
const FRAME_H = SYMBOL_SIZE + 50;
const UI_Y = Math.round(GAME_HEIGHT * 0.72);
const HEADER_Y = Math.round(GAME_HEIGHT * 0.07);
const HELP_Y = GAME_HEIGHT - 16;

export class GameScene {
  container: PIXI.Container;

  private app: PIXI.Application;
  private reels: ReelCtx[] = [];
  private spinButton!: SpinButtonComponent;
  private soundManager!: SoundManagerComponent;
  private goblin!: SpineCharCtx;
  private balanceText!: PIXI.Text;
  private betText!: PIXI.Text;
  private betMinusBtn!: PIXI.Container;
  private betPlusBtn!: PIXI.Container;
  private winBanner!: WinBannerComponent;
  private paytableModal!: PaytableModalComponent;
  private soundBtn!: PIXI.Text;
  private balanceTl: gsap.core.Timeline | null = null;
  private sparkleTls: gsap.core.Timeline[] = [];

  private state = new GameStateModel();

  constructor(app: PIXI.Application) {
    this.app = app;
    this.container = new PIXI.Container();
  }

  create(): void {
    this.createBackground();
    this.createHeader();
    // reels go before the frame so the frame PNG renders on top
    this.createReels();
    this.createReelArea();
    this.createUI();

    this.winBanner = new WinBannerComponent(CX, FRAME_CY);
    this.container.addChild(this.winBanner.container);

    this.paytableModal = new PaytableModalComponent();
    this.container.addChild(this.paytableModal.container);

    this.createGoblin();

    this.soundManager = new SoundManagerComponent();
    this.soundManager.init();

    this.spinButton.setDisabled(true);
    void this.loadPlayerData().then(() => this.spinButton.setDisabled(false));
    this.playIntroAnimation();
  }

  private createBackground(): void {
    const bg = new PIXI.Sprite(PIXI.Assets.get(ASSETS.BG));
    bg.width  = GAME_WIDTH;
    bg.height = GAME_HEIGHT;
    this.container.addChild(bg);

    for (let i = 0; i < 20; i++) {
      const sp = new PIXI.Text({
        text: UiText.SparkleChar,
        style: new PIXI.TextStyle({ fontSize: `${8 + Math.random() * 16}px`, fill: CssColor.Gold }),
      });
      sp.x = Math.random() * GAME_WIDTH;
      sp.y = Math.random() * GAME_HEIGHT * 0.85;
      sp.alpha = 0;
      sp.anchor.set(0.5);
      this.container.addChild(sp);

      const y0 = sp.y;
      const y1 = y0 - (30 + Math.random() * 40);
      this.sparkleTls.push(
        gsap.timeline({ repeat: -1, delay: Math.random() * 4 })
          .to(sp, { alpha: 0.65, y: y1, duration: 2 + Math.random() * 2.5, ease: 'sine.inOut' })
          .to(sp, { alpha: 0,    y: y0, duration: 2 + Math.random() * 2.5, ease: 'sine.inOut' }),
      );
    }
  }

  private createHeader(): void {
    const title = new PIXI.Text({
      text: UiText.Title,
      style: new PIXI.TextStyle({
        fontFamily: FontFamily.Title,
        fontSize:   Math.round(GAME_HEIGHT * 0.048),
        fill:       CssColor.Gold,
        stroke:     { color: CssColor.Purple, width: 5 },
        dropShadow: { color: CssColor.ShadowDeep, blur: 16, angle: Math.PI / 2, distance: 4, alpha: 1 },
      }),
    });
    title.anchor.set(0.5);
    title.x = CX;
    title.y = HEADER_Y;
    this.container.addChild(title);

    this.soundBtn = new PIXI.Text({
      text: UiText.SoundOn,
      style: new PIXI.TextStyle({ fontSize: FontSize.Xl, fill: CssColor.White }),
    });
    this.soundBtn.anchor.set(0.5);
    this.soundBtn.x = GAME_WIDTH - 44;
    this.soundBtn.y = 22;
    this.soundBtn.eventMode = 'static';
    this.soundBtn.cursor = 'pointer';
    this.soundBtn.on('pointerdown', () => {
      const on = this.soundManager.toggle();
      this.soundBtn.text = on ? UiText.SoundOn : UiText.SoundOff;
      gsap.fromTo(this.soundBtn.scale, { x: 1.4, y: 1.4 }, { x: 1, y: 1, duration: AnimDuration.Medium });
    });
    this.container.addChild(this.soundBtn);
  }

  private createReelArea(): void {
    const glow = new PIXI.Graphics()
      .roundRect(
        CX - FRAME_W / 2 - ReelFrame.GlowPad,
        FRAME_CY - FRAME_H / 2 - ReelFrame.GlowPad,
        FRAME_W + ReelFrame.GlowPad * 2,
        FRAME_H + ReelFrame.GlowPad * 2,
        ReelFrame.GlowRadius,
      )
      .fill({ color: 0x6633ff, alpha: ReelFrame.GlowAlpha });
    this.container.addChild(glow);

    const frame = new PIXI.Sprite(PIXI.Assets.get(ASSETS.REEL_FRAME));
    frame.anchor.set(0.5);
    frame.x = CX;
    frame.y = FRAME_CY;
    frame.width  = FRAME_W;
    frame.height = FRAME_H;
    this.container.addChild(frame);
  }

  private createReels(): void {
    const totalW = REEL_COUNT * SYMBOL_SIZE + (REEL_COUNT - 1) * REEL_SPACING;
    const startX = CX - totalW / 2 + SYMBOL_SIZE / 2;

    for (let i = 0; i < REEL_COUNT; i++) {
      const x = startX + i * (SYMBOL_SIZE + REEL_SPACING);
      const reel = useReelComponent(this.app, i, x, FRAME_CY);
      this.container.addChild(reel.container);
      this.reels.push(reel);
    }
  }

  private createUI(): void {
    const colSpacing = Math.round(GAME_WIDTH * 0.22);
    const balX = CX - colSpacing;
    const betX = CX + colSpacing;

    const panel = new PIXI.Sprite(PIXI.Assets.get(ASSETS.BOTTOM_PANEL));
    panel.width  = GAME_WIDTH;
    panel.height = 140;
    panel.x = 0;
    panel.y = UI_Y - 70;
    this.container.addChild(panel);

    const balBg = new PIXI.Graphics();
    drawInfoBox(balBg, balX, UI_Y);
    this.container.addChild(balBg);
    this.balanceText = addLabelValue(this.container, balX, UI_Y, UiText.Balance, `$${this.state.balance}`);

    const betBg = new PIXI.Graphics();
    drawInfoBox(betBg, betX, UI_Y);
    this.container.addChild(betBg);
    this.betText = addLabelValue(this.container, betX, UI_Y, UiText.Bet, `$${this.state.bet}`, CssColor.Gold);

    this.betMinusBtn = this.createBetButton(betX - 62, UI_Y + 12, '−', () => this.changeBet(-1));
    this.betPlusBtn  = this.createBetButton(betX + 62, UI_Y + 12, '+', () => this.changeBet(+1));

    this.spinButton = new SpinButtonComponent(CX, UI_Y, () => void this.onSpinClicked());
    this.container.addChild(this.spinButton.container);

    const helpText = new PIXI.Text({
      text: UiText.HelpText,
      style: new PIXI.TextStyle({ fontFamily: FontFamily.Body, fontSize: FontSize.Sm, fill: CssColor.LavenderDim }),
    });
    helpText.anchor.set(0.5, 1);
    helpText.x = CX;
    helpText.y = HELP_Y;
    this.container.addChild(helpText);

    this.createBetButton(GAME_WIDTH - 120, GAME_HEIGHT - 60, 'ℹ', () => {
      if (!this.state.isSpinning) this.paytableModal.show();
    });
  }

  private createBetButton(x: number, y: number, label: string, onClick: () => void): PIXI.Container {
    const R = 20;
    const btn = new PIXI.Container();
    btn.x = x;
    btn.y = y;

    const bg = new PIXI.Graphics();
    const redraw = (hover = false) => {
      bg.clear();
      bg.circle(2, 3, R).fill({ color: 0x000000, alpha: 0.4 });
      bg.circle(0, 0, R).fill(hover ? 0xffd700 : 0xb8860b);
      bg.circle(0, 0, R - 2).fill(hover ? 0xffd700 : 0xe8a020);
      bg.ellipse(0, -R * 0.28, R * 1.1, R * 0.55).fill({ color: 0xffffff, alpha: 0.2 });
      bg.circle(0, 0, R).stroke({ color: hover ? 0xffee88 : 0xffd700, width: 2 });
    };
    redraw();

    const txt = new PIXI.Text({
      text: label,
      style: new PIXI.TextStyle({ fontFamily: FontFamily.Heading, fontSize: FontSize.Lg, fill: CssColor.White }),
    });
    txt.anchor.set(0.5);

    const hit = new PIXI.Graphics().circle(0, 0, R + 4).fill({ color: 0xffffff, alpha: 0 });
    hit.eventMode = 'static';
    hit.cursor = 'pointer';

    btn.addChild(bg, txt, hit);
    this.container.addChild(btn);

    hit.on('pointerover',  () => redraw(true));
    hit.on('pointerout',   () => redraw(false));
    hit.on('pointerdown',  onClick);

    return btn;
  }

  private changeBet(dir: 1 | -1): void {
    if (this.state.isSpinning) return;
    const steps = this.state.betSteps;
    const next  = this.state.betStepIndex + dir;
    if (next < 0 || next >= steps.length) return;

    this.state.betStepIndex = next;
    this.state.bet = steps[next];
    this.betText.text = `$${this.state.bet}`;

    gsap.fromTo(
      this.betText.scale,
      { x: 1.3, y: 1.3 },
      { x: 1, y: 1, duration: AnimDuration.Slow, ease: AnimEase.BackOutHard },
    );

    this.syncBetBtnAlpha(next, steps.length);
  }

  private syncBetBtnAlpha(idx: number, len: number): void {
    this.betMinusBtn.alpha = idx === 0 ? 0.35 : 1;
    this.betPlusBtn.alpha  = idx === len - 1 ? 0.35 : 1;
  }

  private createGoblin(): void {
    const totalW    = REEL_COUNT * SYMBOL_SIZE + (REEL_COUNT - 1) * REEL_SPACING;
    const frameLeft = CX - totalW / 2 - 30;
    this.goblin = useSpineChar(
      this.container,
      Math.round(frameLeft / 2),
      Math.round(FRAME_CY + 60),
    );
  }

  private playIntroAnimation(): void {
    const c = this.spinButton.container;
    gsap.from(c, { y: c.y + Math.round(GAME_HEIGHT * 0.1), alpha: 0, duration: AnimDuration.Entrance, delay: 0.4, ease: AnimEase.BackOut });
  }

  private async loadPlayerData(): Promise<void> {
    try {
      const [profileRes, configRes] = await Promise.all([
        playerApi.getProfile(),
        gameApi.getConfig(),
      ]);
      this.state.balance = profileRes.data.balance;

      const cfg   = configRes.data;
      const steps = cfg.betSteps?.length ? cfg.betSteps : this.state.betSteps;
      this.state.betSteps = steps;

      const clamped = Math.min(Math.max(this.state.bet, cfg.betMin), cfg.betMax);
      let idx = steps.indexOf(clamped);
      if (idx < 0) idx = steps.findIndex(s => s >= cfg.betMin);
      if (idx < 0) idx = 0;
      this.state.betStepIndex = idx;
      this.state.bet = steps[idx];

      this.betText.text = `$${this.state.bet}`;
      this.syncBetBtnAlpha(this.state.betStepIndex, steps.length);
      this.updateBalance();
    } catch (e) {
      console.error('loadPlayerData failed', e);
      const errTxt = new PIXI.Text({
        text: '⚠ connection error',
        style: new PIXI.TextStyle({ fontFamily: FontFamily.Body, fontSize: FontSize.Sm, fill: CssColor.ErrorRed }),
      });
      errTxt.anchor.set(0.5);
      errTxt.x = CX;
      errTxt.y = UI_Y - 60;
      errTxt.zIndex = 50;
      this.container.addChild(errTxt);
    }
  }

  private async onSpinClicked(): Promise<void> {
    if (!this.state.canSpin) return;

    this.state.isSpinning = true;
    this.spinButton.setDisabled(true);
    this.spinButton.setLabel(UiText.SpinLoading);
    this.soundManager.play(ASSETS.SFX_CLICK);
    this.winBanner.hide();

    this.state.balance -= this.state.bet;
    this.updateBalance();

    let result;
    try {
      result = (await gameApi.spin({ bet: this.state.bet, sessionId: 'mock-session' })).data;
    } catch (e) {
      console.error('spin failed', e);
      this.state.balance += this.state.bet;
      this.updateBalance();
      this.state.isSpinning = false;
      this.spinButton.setDisabled(false);
      this.spinButton.setLabel(UiText.SpinLabel);
      return;
    }

    this.soundManager.play(ASSETS.SFX_SPIN);
    this.goblin.spin();

    await Promise.all(
      this.reels.map((reel, i) =>
        reel.spin(result.stopIndices[i] ?? 0, i * SPIN_STAGGER)
          .then(() => {
            if (result.isWin) {
              reel.playWinAnimation();
              this.soundManager.play(ASSETS.SFX_WIN);
            }
          }),
      ),
    );

    this.soundManager.play(ASSETS.SFX_STOP);
    await new Promise<void>(r => setTimeout(r, AnimDurationMs.SpinResultPause));

    this.state.balance = result.newBalance;

    if (result.isWin) {
      this.goblin.win();
      await this.winBanner.show(result.winAmount, result.winLabel);
    } else {
      this.updateBalance();
      this.goblin.idle();
    }

    this.state.isSpinning = false;
    this.spinButton.setDisabled(false);
    this.spinButton.setLabel(UiText.SpinLabel);
  }

  private updateBalance(): void {
    this.balanceText.text = `$${this.state.balance}`;
    this.balanceTl?.kill();
    this.balanceTl = gsap.timeline()
      .to(this.balanceText.scale, { x: 1.3, y: 1.3, duration: AnimDuration.Normal })
      .to(this.balanceText.scale, { x: 1,   y: 1,   duration: AnimDuration.Slow, ease: AnimEase.BackOutHard });
  }

  destroy(): void {
    this.sparkleTls.forEach(tl => tl.kill());
    this.sparkleTls = [];
    this.winBanner.destroy();
    this.balanceTl?.kill();
    this.balanceTl = null;
    this.reels.forEach(r => r.destroy());
    this.spinButton.destroy();
    this.goblin.destroy();
    this.soundManager.destroy();
    this.container.destroy({ children: true });
  }
}
