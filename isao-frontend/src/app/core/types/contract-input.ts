// import * as Web3 from 'web3';
const Web3 = require('web3');

export class ContractInput {

  public rPeriod;
  public dPeriod;
  public minimalFundSize;
  public minimalDeposit;
  public adminAddress;
  public paybotAddress;
  public limits;
  public costs;

  constructor(rPeriod, dPeriod, minimalFundSize, minimalDeposit, adminAddress, paybotAddress, limits, costs) {
    if (!this.isPositiveNumber(rPeriod)) { throw Error('Wrong rising period!'); }
    if (!this.isPositiveNumber(dPeriod)) { throw Error('Wrong distribution period!'); }
    if (!this.isPositiveNumber(minimalFundSize)) { throw Error('Wrong funds value!'); }
    if (!this.isPositiveNumber(minimalDeposit)) { throw Error('Wrong deposit value!'); }
    const web3 = new Web3();
    const tbn = v => web3.utils.toBN(v);
    const tw = v => tbn(v * 1e18);
    const day = tbn(86400);
    this.rPeriod = day.mul(tbn(rPeriod));
    this.dPeriod = day.mul(tbn(dPeriod));
    this.minimalFundSize = tw(minimalFundSize);
    this.minimalDeposit = tw(minimalDeposit);
    this.adminAddress = adminAddress;
    this.paybotAddress = paybotAddress;
    this.limits = limits.split(',').map((el) => tw(el.trim()));
    this.costs = costs.split(',').map((el) => tw(el.trim()));
    this.limits.forEach(el => { if (!this.isPositiveNumber(el)) { throw Error('Error in limits!'); } });
    this.costs.forEach(el => { if (!this.isPositiveNumber(el)) { throw Error('Error in costs!'); } });
    if (this.limits.length === 0 || this.costs.length === 0 || this.limits.length !== this.costs.length) {
      throw Error('Limits and costs arrays should be not empty and the same size!');
    }
  }

  private isPositiveNumber(val) {
    return !(!val || isNaN(Number(val)) || val < 0);
  }
}
