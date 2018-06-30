import { Account, Contract, PromiEvent, Tx, Transaction } from 'web3/types';
import { ErrorMessageService } from '../shared/services/index';
import { ConnectionService } from './connection.service';
import { Connection, Multitoken, Feature } from '../shared/types';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { to } from 'await-to-js';
import { TokenService } from './token.service';
import * as moment from 'moment';
import { PendingService } from './pending.service';
import { BigNumber } from 'bignumber.js';

@Injectable()
export class MultitokenService {

  public contractAddress: string;
  public dividends: Subject<any> = new Subject();
  public divTransactions: Subject<any[]> = new Subject();
   // {[Feature.Dividends]: false, [Feature.Emission]: false}; // initial features setup
  public lastDivToken: string;
  public lastToken: string;
  public tokens: Subject<any> = new Subject();
  public transactions: Subject<any[]> = new Subject();
  public userAddress: string;

  private fetchDataDelay = 5000;
  private balances: any;
  private contract: Contract;

  constructor(
    private $connection: ConnectionService,
    private $error: ErrorMessageService,
    private $token: TokenService,
    private $pending: PendingService,
  ) {
    $connection.subscribe(async status => {
      if (status === Connection.Estableshed) {
        this.contractAddress = $connection.contract.options.address;
        this.userAddress = $connection.account;
        this.contract = $connection.contract;
        // this.test()
      }
    })
  }

  //#region Send Methods

  public initSubTokens(tokenId, value): PromiEvent<Transaction> {
    console.log(`TokenId: ${tokenId.toString()}, Value: ${value.toString()}`)
    return this.contract.methods.init(tokenId, value).send({from: this.userAddress});
  };

  public transferTokens(tokenId, address, amount): PromiEvent<Transaction> {
    console.log(`TokenId: ${tokenId.toString()}, Address: ${address},Amount: ${amount.toString()}`)
    return this.contract.methods.transfer(tokenId, address, amount).send({from: this.userAddress});
  };

  public acceptDividends(tokenId, value): PromiEvent<Transaction> {
    console.log(`TokenId: ${tokenId.toString()}, Value: ${value.toString()}`)
    return this.contract.methods.acceptDividends(tokenId).send({from: this.userAddress, value});
  };

  public withdrawDividends(tokenId, value): PromiEvent<Transaction> {
    console.log(`TokenId: ${tokenId.toString()}, Value: ${value.toString()}`)
    return this.contract.methods.releaseDividendsRights(tokenId, value).send({from: this.userAddress});
  };

  //#endregion

  //#region Utility Methods

  /**
   * Returns time when block was mined
   * @param  {} blockHash
   */
  public async dateByBlockHash(blockHash): Promise<Date> {
    const blockAdded = await this.$connection.web3.eth.getBlock(blockHash);
    const date = blockAdded.timestamp * 1000;
    return new Date(date);
  }

  /**
   * Returns array with id's of all tokens initialized by this contract
   */
  public async getAllInitedTokenIds(): Promise<string[]> {
    const tokenType = [];
    const transfers = await this.contract.getPastEvents(
      'Transfer', { fromBlock: 0, filter: { from: '0X0000000000000000000000000000000000000000' }});
    transfers.forEach((event, index, array) => {
      const { tokenId }  = event.returnValues;
      if (tokenType.indexOf(tokenId) === -1) { tokenType.push(tokenId); }
    });
    return tokenType;
  };

  //#endregion

}
