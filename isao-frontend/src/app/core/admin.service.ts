import { Injectable } from '@angular/core';
import { ConnectionService } from './connection.service';
import { Contract, PromiEvent } from 'web3/types';
import { Connection, Stage } from './types';
import { IsaoService } from './isao.service';

type processMap = {
  'runningFunding': boolean,
  'runningDistribution': boolean,
  'runningMoneyback': boolean,
  // 'closingISAO': boolean, // No need that, todo: speak with @ig and delete
  'connectingToken': boolean,
  'runningTimeInc': boolean
};

@Injectable()
export class AdminService {

  // List of all currently processed actions
  public process: processMap = {
    'runningFunding': false,
    'runningDistribution': false,
    'runningMoneyback': false,
    // 'closingISAO': false, // No need that, todo: speak with @ig and delete
    'connectingToken': false,
    'runningTimeInc': false,
  };

  private contract: Contract;

  public constructor (
    private $connection: ConnectionService,
    private $isao: IsaoService,
  ) {
    $connection.subscribe(status => {
      if (status === Connection.Estableshed) {
        this.contract = $connection.contract;
      }
    });
  }

  public incTimestamp(hours) {
    const pEvent: PromiEvent<boolean> =
      this.contract.methods.incTimestamp(hours * 3600).send({from: this.$connection.account});

    pEvent.on('transactionHash', () => this.process.runningTimeInc = true);
    pEvent.then(() => {
      this.process.runningTimeInc = false;
      this.$isao.getCurrentTime();
    });
  }

  public startFunding() {
    const pEvent: PromiEvent<boolean> =
      this.contract.methods.setState(Stage.RAISING).send({from: this.$connection.account});

    pEvent.on('transactionHash', () => this.process.runningFunding = true);
    // pEvent.then(() => this.process.runningFunding = false);
  }

  public startDistribution() {
    const pEvent: PromiEvent<boolean> =
      this.contract.methods.setState(Stage.TOKEN_DISTRIBUTION).send({from: this.$connection.account});

    pEvent.on('transactionHash', () => this.process.runningDistribution = true);
    // pEvent.then(() => this.process.runningFunding = false);
  }

  public startMoneyback() {
    const pEvent: PromiEvent<boolean> =
      this.contract.methods.setState(Stage.MONEY_BACK).send({from: this.$connection.account});
    pEvent.on('transactionHash', () => this.process.runningMoneyback = true);
    // pEvent.then(() => this.process.runningFunding = false);
  }

  // todo: speak to @ig about manual closing of ISAO probably we no need that
  // public closeISAO() {
  //   const pEvent: PromiEvent<boolean> =
  //     this.contract.methods.setState(Stage.FUND_DEPRECATED).send({from: this.$connection.account});
  //   pEvent.on('transactionHash', () => this.process.closingISAO = true);
  // }

  public connectToken(address) {
    const pEvent: PromiEvent<boolean> =
      this.contract.methods.setERC20Token(this.checkAddress(address)).send({from: this.$connection.account});

    pEvent.on('transactionHash', () => this.process.connectingToken = true);
  }

  private checkAddress(address) {
    if (!this.$connection.Web3.utils.isAddress(address)) {
      throw Error('Wrong address format!');
    } else { return String(address); }
  }
}
