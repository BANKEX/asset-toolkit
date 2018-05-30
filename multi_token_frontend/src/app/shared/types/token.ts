export class Token {
  id: string;
  amount: BigNumber;
  total: BigNumber;
  constructor(_id: string, _amount: BigNumber, _total: BigNumber) {
    this.id = _id;
    this.amount = _amount;
    this.total = _total;
  }
}
