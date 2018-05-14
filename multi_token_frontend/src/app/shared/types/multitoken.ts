import BigNumber from 'bignumber.js';
export class Multitoken {
  public amount: number;
  public part: number;
  public pending: {to: string, value: BigNumber}[];

  public totalPending() {
    let total = new BigNumber('0');
    for (let item of this.pending) {
      total = total.plus(item.value);
    }
    return total.toString(10);
  }
}
