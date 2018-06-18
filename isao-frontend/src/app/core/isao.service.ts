import { Injectable } from '@angular/core';
import { ConnectionService } from './connection.service';
import { Connection } from './types';
import { Subject, TimeInterval, BehaviorSubject } from 'rxjs';
import { ErrorMessageService } from '../shared/services';
import { EventLog, PromiEvent, TransactionReceipt } from 'web3/types';
import { to } from 'await-to-js';

type processMap = {
  'takingMoneyBack': boolean,
  'buyingTokens': boolean
};

@Injectable()
export class IsaoService {

  public process: processMap = {
    buyingTokens: false,
    takingMoneyBack: false
  };

  public token: string;
  public rPeriod: number;
  public dPeriod: number;
  public launchTime: Date;
  public currentTime: Subject<Date> = new Subject();
  public minimalFundSize: number;
  public minimalDeposit: number;
  public stairs: BehaviorSubject<any> = new BehaviorSubject({});
  public tokensOrdered: Subject<any> = new Subject();
  public tokensOrderedByUser: Subject<any> = new Subject();
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
          methods.raisingPeriod().call().then(rSec => this.rPeriod = rSec);
          methods.distributionPeriod().call().then(dSec => this.dPeriod = dSec);
          methods.launchTimestamp().call().then(sec =>
                sec ? (() => {this.launchTime = new Date(); this.launchTime.setTime(sec * 1000)})() : undefined);
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
            if (err) { console.error(err)};
            if (!address || address === '0x0000000000000000000000000000000000000000') {
              this.token = undefined;
            } else {
              clearInterval(this.getTokenInterval);
              this.token = address;
            }
          }, 1000);

          const getBalanceInterval = setInterval(async() => {
            let error, userOrdered, totalOrdered;
            [error, totalOrdered] = await to(this.$connection.contract.methods.totalShare().call());
            if (err) { console.error(err); } else { this.tokensOrdered.next(totalOrdered / 1e18); }
            [error, userOrdered] = await to(this.$connection.contract.methods.getBalanceTokenOf($connection.account).call());
            if (err) { console.error(err); } else { this.tokensOrderedByUser.next(userOrdered / 1e18); }
          }, 2000);

        } catch (err) {
          $error.addError(err.message, 'Error fetching initial contract data. Pls double check the contract address.')
        }
      }
    });
  }

  public payToISAOContact(amount): PromiEvent<TransactionReceipt> {
    return this.$connection.web3.eth.sendTransaction({
      from: this.$connection.account,
      to: this.$connection.contract.options.address,
      value: this.w3Utils.toWei(amount, 'ether')
    });
  }

  // Be really carefull you can use that method only when the acctual contact on blockchain is in the MONEY-BACK state
  public getAllMoneyBack() {
    const pEvent = this.payToISAOContact(0);
    pEvent.on('transactionHash', () => this.process.takingMoneyBack = true);
    pEvent.then(() => this.process.takingMoneyBack = false);
  }

  public buyTokens(amount) {
    if (!amount) {
      this.$error.addError('Empty amount!');
      return;
    }

    const pEvent = this.payToISAOContact(amount);
    pEvent.on('transactionHash', () => this.process.buyingTokens = true);
    pEvent.then(() => this.process.buyingTokens = false);
  }

  public async getCurrentTime() {
    const [err, isTestContract] = await to(this.hasMethod('getTimestamp()'));
    if (err) { console.error(err.message); return Date.now(); }
    let time = new Date;
    const timestamp = isTestContract ? 1000 * await this.$connection.contract.methods.getTimestamp().call() : Date.now();
    time.setTime(timestamp);
    this.currentTime.next(time);
  }

  private async hasMethod(signature) {
    const w3 = this.$connection.web3;
    const code = await w3.eth.getCode(this.$connection.contract.options.address);
    const hash = w3.eth.abi.encodeFunctionSignature(signature);
    return code.indexOf(hash.slice(2, hash.length)) > 0;
  }
}
