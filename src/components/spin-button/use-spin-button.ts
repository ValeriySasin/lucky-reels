import { CssColor } from '@/enums/colors';
import { UiText } from '@/enums/ui-text';

interface ButtonColors {
  fill: number;
  stroke: number;
  textColor: string;
}

export function useSpinButton() {
  let isDisabled = false;
  let label: string = UiText.SpinLabel;

  function getColors(): ButtonColors {
    return isDisabled
      ? { fill: 0x555555, stroke: 0x333333, textColor: CssColor.BtnDisabled }
      : { fill: 0xe8a020, stroke: 0xffd700, textColor: CssColor.White };
  }

  return {
    isDisabled: () => isDisabled,
    getLabel:   () => label,
    setDisabled: (v: boolean) => { isDisabled = v; },
    setLabel:    (v: string)  => { label = v; },
    getColors,
  };
}

export type SpinButtonLogic = ReturnType<typeof useSpinButton>;
