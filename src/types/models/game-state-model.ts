export class GameStateModel {
  balance:    number;
  bet:        number;
  isSpinning: boolean;

  constructor() {
    this.balance    = 1000;
    this.bet        = 10;
    this.isSpinning = false;
  }

  get canSpin(): boolean {
    return !this.isSpinning && this.balance >= this.bet;
  }
}
