/** GSAP durations — seconds */
export enum AnimDuration {
  Fast      = 0.1,
  Normal    = 0.15,
  Medium    = 0.2,
  Slow      = 0.3,
  SlowFade  = 0.4,
  Entrance  = 0.65,
}

/** Durations in milliseconds (for setTimeout / Promise delays) */
export enum AnimDurationMs {
  SceneIntro      = 400,
  SpinResultPause = 550,
}

export enum AnimEase {
  Out         = 'power2.out',
  BackOut     = 'back.out(1.5)',
  BackOutHard = 'back.out(2)',
  SineIn      = 'sine.in',
  SineOut     = 'sine.out',
}
