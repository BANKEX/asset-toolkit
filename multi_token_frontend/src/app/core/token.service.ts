import { BigNumber } from 'bignumber.js';
import { Injectable, Inject } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { Token, Connection } from '../shared/types';
import { ConnectionService } from './connection.service';
import { Contract } from 'web3/types';
import Web3 from 'web3';

@Injectable()
export class TokenService extends Subject<any[]> {
  /**
   * Provides array of tokens related with user address
  */

  public transfers: Subject<any[]> = new Subject();

  private contract: Contract;
  // Block new tokens request if previos one didn't finished yet
  private serviceBusy: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private user: string;
  private web3: Web3;

  public constructor(
    @Inject('AppConfig') private $config,
    $connection: ConnectionService
  ) {
    super();
    $connection.subscribe(status => {
      if (status !== Connection.Estableshed) {return}
      this.contract = $connection.contract;
      this.user = $connection.account;
      this.web3 = $connection.web3;
      Observable
        .interval($config.intervals.tokenFetch || 1000)
        .startWith(0)
        .withLatestFrom(this.serviceBusy)
        .filter(([interval, flag]) => !flag) // pass only when no pending requests
        .switchMap(() => Observable.fromPromise(this.getTokens(this.serviceBusy)))
        .subscribe(tokensWithTransfers => {
          this.next(tokensWithTransfers.tokens);
          this.transfers.next(tokensWithTransfers.tokens);
        });
    });
  }

  /**
   * Returns all tokens that was sended to or from this account
   * @ {Subject<boolean>} flagman - to broadcast busy/avalable state of the function
   * @returns Promise<Token[]>
   */
  private async getTokens(flagman: Subject<boolean>) {
    flagman.next(true);
    const [from, to] = await Promise.all([
      this.contract.getPastEvents('Transfer', { fromBlock: 0, filter: { from: this.user }}),
      this.contract.getPastEvents('Transfer', { fromBlock: 0, filter: { to: this.user }})
    ])
    const transferedTokens = from.concat(to);
    const uniqueTokens = [];
    transferedTokens.forEach(token => {
      if (!uniqueTokens.find(item => item.returnValues.tokenId === token.returnValues.tokenId)) {
        uniqueTokens.push(token)}
    })
    const tokens = await Promise.all(uniqueTokens.map(async (transaction) => {
      const [amount, total] = await Promise.all([
        this.contract.methods.balanceOf(transaction.returnValues.tokenId, this.user).call(),
        this.contract.methods.totalSupply(transaction.returnValues.tokenId).call()
      ])
      return new Token(
        transaction.returnValues.tokenId,
        new BigNumber(this.web3.utils.fromWei(amount, 'ether')),
        new BigNumber(this.web3.utils.fromWei(total, 'ether'))
      );
    }));
    flagman.next(false);
    // console.log(tokens)
    return {tokens, transfers: transferedTokens};
  };
}
