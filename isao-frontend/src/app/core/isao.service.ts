import { Injectable } from '@angular/core';
import { ConnectionService } from './connection.service';
import { Connection } from './types';
import { Subject, TimeInterval } from 'rxjs';
import { ErrorMessageService } from '../shared/services';
import { EventLog } from 'web3/types';
import { to } from 'await-to-js';

@Injectable()
export class IsaoService {

  public process: any = {};
  public token: string;
  public rPeriod: number;
  public dPeriod: number;
  public launchTime: Date;
  public minimalFundSize: number;
  public minimalDeposit: number;
  public stairs: Subject<any> = new Subject();
  public w3Utils: any;

  private from: any;
  private getTokenInterval;

  public constructor (
    private $connection: ConnectionService,
    private $error: ErrorMessageService
  ) {
    $connection.subscribe(async(status) => {
      this.from = {from: this.$connection.account};
      if (status === Connection.Estableshed) {
        const methods = $connection.contract.methods;
        this.w3Utils = $connection.web3.utils;
        try {
          methods.raisingPeriod().call().then(rSec => this.rPeriod = rSec / 3600 / 24);
          methods.distributionPeriod().call().then(dSec => this.dPeriod = dSec / 3600 / 24);
          methods.launchTimestamp().call().then(sec =>
            Number(sec) ? (() => {this.launchTime = new Date(); this.launchTime.setDate(sec * 1000)})() : undefined);
          methods.minimalFundSize().call().then(size => this.minimalFundSize = size / 1e18);
          methods.minimalDeposit().call().then(size => this.minimalDeposit = size / 1e18);
          const [err, events] = await to($connection.contract.getPastEvents('CostStairs', {fromBlock: 0, filter: {}}))
            if (err) {throw Error(err.message)}
            if (events.length !== 1) { throw Error('CostStairs array length = ' + events.length); }
            const stairs = {};
            const costs = events[0].returnValues.costs;
            const limits = events[0].returnValues.limits;
            if (costs.length !== limits.length || costs.length < 1) { throw Error(`Wrong costs/limits length`); }
            limits.forEach((limit, i) => stairs[limit / 1e18] = costs[i] / 1e18);
            this.stairs.next(stairs);
          this.getTokenInterval = setInterval(async() => {
            const [error, address] = await to(this.$connection.contract.methods.tokenAddress().call());
            console.log(address);
            if (err) { console.error(err)};
            if (!address || address === '0x0000000000000000000000000000000000000000') {
              this.token = undefined;
            } else {
              clearInterval(this.getTokenInterval);
              this.token = address;
            }
          }, 1000);
        } catch (err) {
          $error.addError(err.message, 'Error fetching initial contract data. Pls double check the contract address.')
        }
      }
    })
  }

  public buyTokens(amount) {
    if (!amount) { this.$error.addError('Empty amount!'); return }
    const pEvent = this.$connection.web3.eth.sendTransaction({
      from: this.$connection.account, 
      to: this.$connection.contract.options.address, 
      value:this.w3Utils.toWei(amount, "ether")
    });
    // const pEvent = this.$connection.contract.methods.buyShare(this.token, amount * 1e18).send(this.from);
    pEvent.on('transactionHash', () => this.process.buyingTokens = true);
    pEvent.then(() => this.process.buyingTokens = false);
  }

}
