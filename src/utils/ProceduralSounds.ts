/**
 * ProceduralSounds — all audio generated via Web Audio API, no MP3 files needed.
 *
 * Background music: ambient casino loop built from sine/triangle oscillators.
 * SFX: click, spin, stop, win.
 */

type ExtWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

// Background music state
let bgScheduled = false;
let bgStopFlag  = false;
let bgTimeout: ReturnType<typeof setTimeout> | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as ExtWindow).webkitAudioContext;
    ctx = new Ctor!();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(console.error);
  }
  return ctx;
}

function getMaster(): GainNode {
  getCtx();
  return masterGain!;
}

// ── Primitive helpers ────────────────────────────────────────────────────────

function tone(
  freq:      number,
  type:      OscillatorType,
  startTime: number,
  duration:  number,
  volume:    number,
  freqEnd:   number | null = null,
): void {
  const c    = getCtx();
  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(getMaster());
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  if (freqEnd !== null) {
    osc.frequency.linearRampToValueAtTime(freqEnd, startTime + duration);
  }
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

// ── Background music ─────────────────────────────────────────────────────────
//
// A looping 4-bar ambient slot-casino theme.
// Two layers:
//   1. Bass pad (triangle, slow attack) — chord roots
//   2. Melody arpeggio (sine) — bouncy casino feel
//
// Total loop length: 4 bars × 1.2 s = 4.8 s

const BPM      = 104;
const BEAT     = 60 / BPM;   // ≈ 0.577 s
const BAR      = BEAT * 4;   // ≈ 2.308 s
const LOOP_LEN = BAR * 4;    // ≈ 9.23 s

// Chord roots (bass) per bar: Cm  Ab  Eb  Bb
const BASS_NOTES = [130.81, 103.83, 155.56, 116.54];

// Melody arpeggios per bar (8th-note rhythm)
const MELODY: number[][] = [
  [261.63, 311.13, 392.00, 466.16, 392.00, 311.13, 261.63, 196.00],  // Cm arp
  [207.65, 261.63, 311.13, 392.00, 311.13, 261.63, 207.65, 155.56],  // Ab arp
  [311.13, 392.00, 466.16, 523.25, 466.16, 392.00, 311.13, 261.63],  // Eb arp
  [233.08, 293.66, 349.23, 440.00, 349.23, 293.66, 233.08, 174.61],  // Bb arp
];

function scheduleBgLoop(startAt: number): void {
  if (bgStopFlag) return;

  const c = getCtx();

  for (let bar = 0; bar < 4; bar++) {
    const barStart = startAt + bar * BAR;

    // Bass pad: whole-bar note, soft triangle
    const bassOsc  = c.createOscillator();
    const bassGain = c.createGain();
    bassOsc.type = 'triangle';
    bassOsc.frequency.value = BASS_NOTES[bar];
    bassOsc.connect(bassGain);
    bassGain.connect(getMaster());
    bassGain.gain.setValueAtTime(0, barStart);
    bassGain.gain.linearRampToValueAtTime(0.07, barStart + 0.25);
    bassGain.gain.setValueAtTime(0.07, barStart + BAR - 0.2);
    bassGain.gain.linearRampToValueAtTime(0, barStart + BAR);
    bassOsc.start(barStart);
    bassOsc.stop(barStart + BAR + 0.05);

    // Melody arpeggio: 8 × 8th notes per bar
    const notes = MELODY[bar];
    for (let n = 0; n < 8; n++) {
      const noteStart = barStart + n * (BAR / 8);
      const noteDur   = BAR / 8 * 0.75;
      const melOsc    = c.createOscillator();
      const melGain   = c.createGain();
      melOsc.type = 'sine';
      melOsc.frequency.value = notes[n];
      melOsc.connect(melGain);
      melGain.connect(getMaster());
      melGain.gain.setValueAtTime(0.0001, noteStart);
      melGain.gain.linearRampToValueAtTime(0.055, noteStart + 0.02);
      melGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDur);
      melOsc.start(noteStart);
      melOsc.stop(noteStart + noteDur + 0.02);
    }

    // Hi-hat pulse: every beat, soft noise burst
    for (let b = 0; b < 4; b++) {
      const hStart = barStart + b * BEAT;
      const buf    = c.createBuffer(1, c.sampleRate * 0.04, c.sampleRate);
      const data   = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
      const src   = c.createBufferSource();
      const hGain = c.createGain();
      src.buffer  = buf;
      src.connect(hGain);
      hGain.connect(getMaster());
      hGain.gain.setValueAtTime(0.018, hStart);
      hGain.gain.exponentialRampToValueAtTime(0.0001, hStart + 0.04);
      src.start(hStart);
    }
  }

  // Schedule next iteration slightly before this one ends
  const nextStart = startAt + LOOP_LEN;
  const delay     = (nextStart - getCtx().currentTime - 0.5) * 1000;

  bgTimeout = setTimeout(() => {
    if (!bgStopFlag) scheduleBgLoop(nextStart);
  }, Math.max(delay, 0));
}

// ── Public API ────────────────────────────────────────────────────────────────

export const ProceduralSounds = {

  startBgMusic(): void {
    bgStopFlag  = false;
    bgScheduled = true;
    const c = getCtx();
    scheduleBgLoop(c.currentTime + 0.1);
  },

  stopBgMusic(): void {
    bgStopFlag  = true;
    bgScheduled = false;
    if (bgTimeout) { clearTimeout(bgTimeout); bgTimeout = null; }
  },

  mute(): void {
    if (masterGain) masterGain.gain.value = 0;
  },

  unmute(): void {
    if (masterGain) masterGain.gain.value = 1;
    // Restart bg loop if it was running before mute
    if (bgScheduled && !bgStopFlag) {
      const c = getCtx();
      scheduleBgLoop(c.currentTime + 0.05);
    }
  },

  isBgRunning(): boolean {
    return bgScheduled && !bgStopFlag;
  },

  destroy(): void {
    this.stopBgMusic();
    if (ctx) {
      ctx.close().catch(console.error);
      ctx = null;
      masterGain = null;
    }
  },

  // ── SFX ──────────────────────────────────────────────────────────────────

  click(): void {
    const c = getCtx();
    const t = c.currentTime;
    tone(600, 'square', t,        0.08, 0.18);
    tone(900, 'sine',   t,        0.05, 0.10);
  },

  spin(): void {
    const c = getCtx();
    const t = c.currentTime;
    tone(220, 'sawtooth', t,        1.6, 0.12, 80);
    tone(330, 'sawtooth', t + 0.05, 1.5, 0.08, 60);
  },

  stop(): void {
    const c = getCtx();
    const t = c.currentTime;
    tone(350, 'sine', t, 0.25, 0.25, 180);
  },

  win(): void {
    const c = getCtx();
    const t = c.currentTime;
    // Ascending arpeggio C5 E5 G5 C6
    [523, 659, 784, 1047].forEach((freq, i) => {
      tone(freq,     'sine', t + i * 0.13, 0.35, 0.35);
      tone(freq * 2, 'sine', t + i * 0.13, 0.20, 0.08);
    });
    // Final chord
    [523, 659, 784].forEach(freq => {
      tone(freq, 'sine', t + 0.65, 0.60, 0.20);
    });
  },
};