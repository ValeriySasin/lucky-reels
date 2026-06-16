export function useSoundManager() {
  let enabled = true;

  return {
    isEnabled: () => enabled,
    toggle: () => {
      enabled = !enabled;
      return enabled;
    },
    setEnabled: (v: boolean) => { enabled = v; },
  };
}

export type SoundManagerLogic = ReturnType<typeof useSoundManager>;
