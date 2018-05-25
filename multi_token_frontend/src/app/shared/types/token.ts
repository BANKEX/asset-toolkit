export class Token {
  id: number;
  amount: BigNumber;
  total: BigNumber;
  constructor(_id: number, _amount: BigNumber, _total: BigNumber) {
    this.id = _id;
    this.amount = _amount;
    this.total = _total;
  }
}
