import { Injectable } from '@angular/core';
import { ConnectionService } from './connection.service';
import { Account, Contract, Tx, PromiEvent } from 'web3/types';
import { Connection, Stage } from './types';

@Injectable()
export class AdminService {

  public process: any = {};        // List of all procecced actions
  private contract: Contract;

  public constructor (
    private $connection: ConnectionService
  ) {
    $connection.subscribe(status => {
      if (status === Connection.Estableshed) {
        this.contract = $connection.contract;
      }
    })
  }

  public startFunding() {
    const pEvent: PromiEvent<boolean> =
      this.contract.methods.setState(Stage.RAISING).send({from: this.$connection.account});
    pEvent.on('transactionHash', () => this.process.runningFunding = true);
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
