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
  }
}
