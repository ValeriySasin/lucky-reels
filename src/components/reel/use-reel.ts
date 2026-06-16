import { STRIPS } from '@/data/reel-strips';

export function useReel(reelIndex: number) {
  const strip = STRIPS[reelIndex % STRIPS.length];
  const len = strip.length;
  let stop = 0;

  const wrap = (i: number) => ((i % len) + len) % len;

  return {
    getStrip:        () => strip,
    getStripLength:  () => len,
    getCurrentStop:  () => stop,
    setCurrentStop:  (i: number) => { stop = wrap(i); },
    symbolAtOffset:  (offset: number) => strip[wrap(stop + offset)],
  };
}
