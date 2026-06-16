export const GAME_WIDTH  = 1920;
export const GAME_HEIGHT = 1080;

export const REEL_COUNT   = 3;
export const SYMBOL_SIZE  = 200;
export const REEL_SPACING = 30;
export const SPIN_STAGGER = 300; // ms between reels stopping

export const ASSETS = {
  SPINE_SKEL:   'spineboy-skel',
  SPINE_ATLAS:  'spineboy-atlas',
  BG:           'background',
  REEL_FRAME:   'reel_frame',
  SYMBOL_ATLAS: 'symbol_atlas',
  LOGO:         'logo',
  WIN_BANNER:   'win_banner',
  PARTICLE:     'particle',
  BOTTOM_PANEL: 'bottom_panel',
  SPIN_BUTTON:  'spin_button',
  SFX_WIN:      'sfx_win',
  SFX_SPIN:     'sfx_spin',
  SFX_STOP:     'sfx_stop',
  SFX_CLICK:    'sfx_click',
} as const;
