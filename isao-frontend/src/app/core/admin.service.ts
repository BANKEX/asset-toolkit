import { Injectable } from '@angular/core';
import { ConnectionService } from './connection.service';
import { Contract, PromiEvent } from 'web3/types';
import { Connection, Stage } from './types';
import { IsaoService } from './isao.service';

@Injectable()
export class AdminService {

  public process: any = {};        // List of all currently procecced actions
  private contract: Contract;

  public constructor (
    private $connection: ConnectionService,
    private $isao: IsaoService,
  ) {
    $connection.subscribe(status => {
      if (status === Connection.Estableshed) {
        this.contract = $connection.contract;
      }
    })
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

  public connectToken(address) {
    const pEvent: PromiEvent<boolean> =
      this.contract.methods.setERC20Token(this.checkAddress(address)).send({from: this.$connection.account});
    pEvent.on('transactionHash', () => this.process.connectingToken = true);
    // pEvent.then(() => this.process.connectingToken = false);
  }

  private checkAddress(address) {
    if (!this.$connection.Web3.utils.isAddress(address)) {
      throw Error('Wrong address format!')
    } else { return String(address) }
  }
}
