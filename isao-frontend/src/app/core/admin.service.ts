import { Injectable } from '@angular/core';
import { ConnectionService } from './connection.service';
import { Account, Contract, Tx } from 'web3/types';
import { Connection } from './types';

@Injectable()
export class AdminService {

  private contract: Contract;

  public constructor (
    $connection: ConnectionService
  ) {
    $connection.subscribe(status => {
      if (status === Connection.Estableshed) {
        this.contract = $connection.contract;
      }
    })
  }

  public startFundRaising() {

  }
}
