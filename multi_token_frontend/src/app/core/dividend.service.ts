import { BigNumber } from 'bignumber.js';
import { Injectable, Inject } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Operation, Token } from '../shared/types';
import { TokenService } from './token.service';
import { BlockchainEvent } from '../shared/types/blockchain-event';
import { Contract } from 'web3/types';
import { ConnectionService } from './connection.service';

@Injectable()
export class DividendService extends Subject<any> {
  /**
   * Service to provide all dividend transactions
   * Relies on TokenService data stream
   */

  public transactions: Subject<any[]> = new Subject();

  private contract: Contract;
  private user: string;
  private tokenId: string;

  public constructor(
    @Inject('AppConfig') private $config,
    private $token: TokenService,
    private $connection: ConnectionService,
  ) {
    super();
    setTimeout(this.init.bind(this), 100);
    $token
      .map((tokens: Token[]) => tokens.map(item => item.id))
      .subscribe(async (tokens: string[]) => {
        const balances = {};
        this.contract = $connection.contract;
        this.user = $connection.account;
        await Promise.all(tokens.map(async (tokenId) => {
          balances[tokenId] = await this.getDividendsBalance(tokenId);
          return null;
        }));
        this.next(balances);
        if (this.tokenId) { this.emitHistory(this.tokenId) }
    });
  }

  public async emitHistory(tokenId) {
    this.tokenId = tokenId;
    this.transactions.next(await this.getDividendEvents(tokenId));
  }

  public resetHistory() {
    this.tokenId = undefined;
    this.transactions.next(undefined);
  }

  /**
   * Some setup needed in the very beginning
   */
  private init() {
    this.transactions.next(undefined); // need to send emply array to run .combineLatest in components
  }

  /**
  * Returns current dividend balance for specified token
  * @param tokenId
  */
  private async getDividendsBalance(tokenId): Promise<BigNumber>  {
    const balance = await this.contract.methods.dividendsRightsOf(tokenId, this.user).call();
    return (new BigNumber(balance)).div(1e+18); // Remove 18 zeros and convert to BigNumber
  };

  private async getDividendEvents(tokenId) {
    const details = [];
    const releaseDividendsRights = await this.contract.getPastEvents(
      'ReleaseDividendsRights', { fromBlock: 0, filter: { _for: this.user, tokenId }});
    releaseDividendsRights.map(async (e) => details.push(e));
    const acceptDividends = await this.contract.getPastEvents(
      'AcceptDividends', { fromBlock: 0, filter: { tokenId }});
    await Promise.all(acceptDividends.map(async (e) => {
      const part = await this.getTokenPartOnAcceptDividendsEvent(e);
      const accept = Number(e.returnValues.value);
      e.returnValues.value = String(accept * part);
      e.returnValues.value_original = String(accept);
      if (+e.returnValues.value > 0) { details.push(e); } // filter "empty" dividends
      return null;
    }));
    return details;
  };

  private async getTokenPartOnAcceptDividendsEvent(event) {
    const tokenId = event.returnValues.tokenId;
    const blockAdded = await this.$connection.web3.eth.getBlock(event.blockHash);
    const transfersOnTokenIdFrom = await this.contract.getPastEvents(
      'Transfer', { fromBlock: 0, toBlock: blockAdded.number, filter: { from: this.user, tokenId }});
    const transfersOnTokenIdTo = await this.contract.getPastEvents(
      'Transfer', { fromBlock: 0, toBlock: blockAdded.number, filter: { to: this.user, tokenId }});
    const transfersOnTokenId = transfersOnTokenIdFrom.concat(transfersOnTokenIdTo);
    let sum = 0;
    await Promise.all(transfersOnTokenId.map(async (ev) => {
      const plus = (ev.returnValues.to === this.user) ? 1 : -1;
      const value = Number(ev.returnValues.value) * plus;
      sum += value;
      return null;
    }));
    const totalSupply = await this.contract.methods.totalSupply(tokenId).call();
    return sum / totalSupply;
  };
}
