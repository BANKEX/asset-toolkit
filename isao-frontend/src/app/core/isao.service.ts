import { Injectable, Inject } from '@angular/core';
import { ConnectionService } from './connection.service';
import { Connection, Stage } from './types';
import { Subject, TimeInterval, BehaviorSubject } from 'rxjs';
import { ErrorMessageService } from '../shared/services';
import { to } from 'await-to-js';
import { StageService } from './stage.service';
import { TransactionReceipt, Contract, PromiEvent, TransactionObject } from 'web3/types';
import { ContractInput } from './types/contract-input';

type processMap = {
  'takingAllMoneyBack': boolean,
  'buyingTokens': boolean,
  'refundingPartOfTokens': boolean,
  'receivingTokens': boolean,
  'creatingContract': boolean
};

@Injectable()
export class IsaoService {

  public process: processMap = {
    buyingTokens: false,
    takingAllMoneyBack: false,
    refundingPartOfTokens: false,
    receivingTokens: false,
    creatingContract: false
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
  public tokensOrderedByUser: BehaviorSubject<number> = new BehaviorSubject(null);

  public w3Utils: any;

  constructor (
    @Inject('AppConfig') private $config,
    private $connection: ConnectionService,
    private $error: ErrorMessageService,
    private $stage: StageService,
  ) {
    $connection.subscribe(async(status) => {
      this.from = {from: this.$connection.account};
      if (status === Connection.Estableshed && this.$connection.contract) {
        const methods = $connection.contract.methods;
        this.w3Utils = $connection.web3.utils;
        this.adjustLaunchTime();
        $stage.subscribe(stage => { if (stage === Stage.RAISING) { this.adjustLaunchTime(); }});
        try {
          methods.raisingPeriod().call().then(rSec => this.rPeriod = rSec);
          methods.distributionPeriod().call().then(dSec => this.dPeriod = dSec);
          methods.minimalFundSize().call().then(size => this.minimalFundSize = size / 1e18);
          methods.minimalDeposit().call().then(size => this.minimalDeposit = size / 1e18);

          const [err, events] = await to($connection.contract.getPastEvents('CostStairs', {fromBlock: 0, filter: {}}));
            if (err) {throw Error(err.message); }
            if (events.length !== 1) { throw Error('CostStairs array length = ' + events.length); }
            const stairs = {};
            const costs = events[0].returnValues.costs;
            const limits = events[0].returnValues.limits;
            if (costs.length !== limits.length || costs.length < 1) { throw Error(`Wrong costs/limits length`); }
            limits.forEach((limit, i) => stairs[limit / 1e18] = costs[i] / 1e18);
            this.stairs.next(stairs);
          this.getTokenInterval = setInterval(async() => {
            const [error, address] = await to(this.$connection.contract.methods.tokenAddress().call());
            if (err) { console.error(err); }
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
          $error.addError(err.message, 'Error fetching initial contract data. Pls double check the contract address.');
        }
      }
    });
  }

  private from: any;
  private getTokenInterval;

  public publishNewContract(i: ContractInput) {
    const args =
      [i.rPeriod, i.dPeriod, i.minimalFundSize, i.limits, i.costs, i.minimalDeposit, i.adminAddress, i.paybotAddress];
    let factory: Contract = new this.$connection.web3.eth.Contract(this.$config.factoryAbi);
    const transaction: TransactionObject<Contract> = factory.deploy({data: this.$config.factoryCode, arguments: args});
    const pEvent: PromiEvent<any> = transaction.send({from: this.$connection.account});
    pEvent.on('transactionHash', (hash) => this.process.creatingContract = true);
    pEvent.then(async(_contract: Contract) => {
      factory = _contract;
      const isaoAddress = await factory.methods.isaoAddress().call();
      await this.$connection.connect(isaoAddress);
      console.log('Factory Contract Address: ', _contract.options.address);
      console.log('ISAO Contract Address: ', isaoAddress);
    });
  }

  public payToISAOContact(amount): PromiEvent<TransactionReceipt> {
    return this.$connection.web3.eth.sendTransaction({
      from: this.$connection.account,
      to: this.$connection.contract.options.address,
      value: this.w3Utils.toWei(amount, 'ether')
    });
  }

  // Be really careful you can use that method only when the actual contact on blockchain is in the MONEY-BACK state
  public getAllMoneyBack() {
    const pEvent = this.payToISAOContact('0');
    pEvent.on('transactionHash', () => this.process.takingAllMoneyBack = true);
    pEvent.then(() => this.process.takingAllMoneyBack = false);
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

  public receiveTokens(amount) {
    if (!amount) { this.$error.addError('Empty amount!'); return; }
    if (+amount > this.tokensOrderedByUser.value) { this.$error.addError('Too much!'); return; }
    const pEvent = this.$connection.contract.methods.releaseToken(amount * 1e18).send(this.from);
    pEvent.on('transactionHash', () => this.process.receivingTokens = true);
    pEvent.then(() => this.process.receivingTokens = false);
  }

  public refundTokens(amount) {
    if (!amount) { this.$error.addError('Empty amount!'); return; }
    if (+amount > this.tokensOrderedByUser.value) { this.$error.addError('Too much!'); return; }
    const pEvent = this.$connection.contract.methods.refundShare(amount * 1e18).send(this.from);
    pEvent.on('transactionHash', () => this.process.refundingPartOfTokens = true);
    pEvent.then(() => this.process.refundingPartOfTokens = false);
  }

  public async getCurrentTime() {
    const [err, isTestContract] = await to(this.hasMethod('getTimestamp()'));
    if (err) { console.error(err.message); return Date.now(); }
    let time = new Date;
    const timestamp = isTestContract ? 1000 * await this.$connection.contract.methods.getTimestamp().call() : Date.now();
    time.setTime(timestamp);
    this.currentTime.next(time);
  }

  public adjustLaunchTime() {
    this.$connection.contract.methods.launchTimestamp().call().then(sec => {
      if (!+sec) { return undefined; } // not yet set
      this.launchTime = new Date();
      this.launchTime.setTime(sec * 1000);
    });
  }

  private async hasMethod(signature) {
    const w3 = this.$connection.web3;
    const code = await w3.eth.getCode(this.$connection.contract.options.address);
    const hash = w3.eth.abi.encodeFunctionSignature(signature);
    return code.indexOf(hash.slice(2, hash.length)) > 0;
  }
}
