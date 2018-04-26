export class Multitoken {
  public amount: number;
  public part: number;
  public pending: {to: string, value: number}[]

  public totalPending() {
    let total = 0;
    for (let item of this.pending){
      total += item.value;
    }
    return total;
  }
}
