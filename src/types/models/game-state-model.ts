export interface GameStateModelData {
  balance:      number;
  bet:          number;
  betSteps:     number[];
  betStepIndex: number;
  isSpinning:   boolean;
}

export class GameStateModel {
  balance:      number;
  bet:          number;
  betSteps:     number[];
  betStepIndex: number;
  isSpinning:   boolean;

  constructor(data: Partial<GameStateModelData> = {}) {
    this.balance      = data.balance      ?? 0;
    this.bet          = data.bet          ?? 10;
    this.betSteps     = data.betSteps     ?? [1, 5, 10, 25, 50, 100];
    this.betStepIndex = data.betStepIndex ?? 2;
    this.isSpinning   = data.isSpinning   ?? false;
  }

  get canSpin(): boolean {
    return !this.isSpinning && this.balance >= this.bet;
  }
}
