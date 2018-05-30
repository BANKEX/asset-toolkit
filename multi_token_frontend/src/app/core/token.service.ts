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
    $connection: ConnectionService,
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
        .switchMap(() => Observable.fromPromise(this.getTokensAndTransfers(this.serviceBusy)))
        .subscribe(tokensWithTransfers => {
          this.next(tokensWithTransfers.tokens);
          this.transfers.next(tokensWithTransfers.transfers);
        });
    });
  }

  /**
   * Returns all tokens that was sended to or from this account
   * @ {Subject<boolean>} flagman - to broadcast busy/avalable state of the function
   * @returns Promise<Token[]>
   */
  private async getTokensAndTransfers(flagman: Subject<boolean>) {
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

const exampleTransferedTokens = [
  {
    'address': '0x02a2F8482658a3DA0bBE078F3c0316e94d00a148',
    'blockNumber': 2304607,
    'transactionHash': '0x46cd9e369d651e288d7d59864bc698428c6d8ad52a4e7bc7c5de69a2a980763f',
    'transactionIndex': 32,
    'blockHash': '0xc562030bc6dd9787f8ed07bb6a430725fa098522fdcf3c2a6998410a397e71d3',
    'logIndex': 43,
    'removed': false,
    'id': 'log_39490b97',
    'returnValues': {
      '0': '1',
      '1': '0x21A1a6D233fC90e19D426C85DA5C948a6DeC2892',
      '2': '0x21De6451f9f05DdffA6D8466A70F38A9495f30EC',
      '3': '1000000000000000000',
      'tokenId': '1',
      'from': '0x21A1a6D233fC90e19D426C85DA5C948a6DeC2892',
      'to': '0x21De6451f9f05DdffA6D8466A70F38A9495f30EC',
      'value': '1000000000000000000'
    },
    'event': 'Transfer',
    'signature': '0xf2dbd98d79f00f7aff338b824931d607bfcc63d47307162470f25a055102d3b0',
    'raw': {
      'data': '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      'topics': [
        '0xf2dbd98d79f00f7aff338b824931d607bfcc63d47307162470f25a055102d3b0',
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        '0x00000000000000000000000021a1a6d233fc90e19d426c85da5c948a6dec2892',
        '0x00000000000000000000000021de6451f9f05ddffa6d8466a70f38a9495f30ec'
      ]
    }
  },
  {
    'address': '0x02a2F8482658a3DA0bBE078F3c0316e94d00a148',
    'blockNumber': 2327870,
    'transactionHash': '0x5bec6e7a35746a8492b414b675949a1c8f2e1cf1af7222a55bd4b0d1bec100c4',
    'transactionIndex': 2,
    'blockHash': '0xe2c2546f54e999f03b3228ee2f0445d6742bc7d134a7d5ebcbab141dad617197',
    'logIndex': 6,
    'removed': false,
    'id': 'log_890c37fc',
    'returnValues': {
      '0': '4',
      '1': '0x21A1a6D233fC90e19D426C85DA5C948a6DeC2892',
      '2': '0x21De6451f9f05DdffA6D8466A70F38A9495f30EC',
      '3': '1000000000000000000000000000',
      'tokenId': '4',
      'from': '0x21A1a6D233fC90e19D426C85DA5C948a6DeC2892',
      'to': '0x21De6451f9f05DdffA6D8466A70F38A9495f30EC',
      'value': '1000000000000000000000000000'
    },
    'event': 'Transfer',
    'signature': '0xf2dbd98d79f00f7aff338b824931d607bfcc63d47307162470f25a055102d3b0',
    'raw': {
      'data': '0x0000000000000000000000000000000000000000033b2e3c9fd0803ce8000000',
      'topics': [
        '0xf2dbd98d79f00f7aff338b824931d607bfcc63d47307162470f25a055102d3b0',
        '0x0000000000000000000000000000000000000000000000000000000000000004',
        '0x00000000000000000000000021a1a6d233fc90e19d426c85da5c948a6dec2892',
        '0x00000000000000000000000021de6451f9f05ddffa6d8466a70f38a9495f30ec'
      ]
    }
  },
  {
    'address': '0x02a2F8482658a3DA0bBE078F3c0316e94d00a148',
    'blockNumber': 2327928,
    'transactionHash': '0x7603e4a5e8f65f7520581b4c73e6cca47ce5ba0e63be42cc85e55b2fdb25c408',
    'transactionIndex': 20,
    'blockHash': '0x34cc77b7b417a56a6f10c52d80bc8601dfe260062f8c9febc0f23f0fdc14bac2',
    'logIndex': 23,
    'removed': false,
    'id': 'log_388d098c',
    'returnValues': {
      '0': '4',
      '1': '0x21A1a6D233fC90e19D426C85DA5C948a6DeC2892',
      '2': '0x21De6451f9f05DdffA6D8466A70F38A9495f30EC',
      '3': '1000000000000000000000000',
      'tokenId': '4',
      'from': '0x21A1a6D233fC90e19D426C85DA5C948a6DeC2892',
      'to': '0x21De6451f9f05DdffA6D8466A70F38A9495f30EC',
      'value': '1000000000000000000000000'
    },
    'event': 'Transfer',
    'signature': '0xf2dbd98d79f00f7aff338b824931d607bfcc63d47307162470f25a055102d3b0',
    'raw': {
      'data': '0x00000000000000000000000000000000000000000000d3c21bcecceda1000000',
      'topics': [
        '0xf2dbd98d79f00f7aff338b824931d607bfcc63d47307162470f25a055102d3b0',
        '0x0000000000000000000000000000000000000000000000000000000000000004',
        '0x00000000000000000000000021a1a6d233fc90e19d426c85da5c948a6dec2892',
        '0x00000000000000000000000021de6451f9f05ddffa6d8466a70f38a9495f30ec'
      ]
    }
  },
  {
    'address': '0x02a2F8482658a3DA0bBE078F3c0316e94d00a148',
    'blockNumber': 2333538,
    'transactionHash': '0x19b705c63296dca746bea3ed93ef434f677a3ae68b4d4f74080c3fb8cecec2ae',
    'transactionIndex': 7,
    'blockHash': '0xb280c32c7a3d5a2a9ef012ec72c34e58ceb69af8d665f807744d0e8e2f4f351b',
    'logIndex': 9,
    'removed': false,
    'id': 'log_82b7afa7',
    'returnValues': {
      '0': '3',
      '1': '0x21A1a6D233fC90e19D426C85DA5C948a6DeC2892',
      '2': '0x21De6451f9f05DdffA6D8466A70F38A9495f30EC',
      '3': '1000000000000000000000000',
      'tokenId': '3',
      'from': '0x21A1a6D233fC90e19D426C85DA5C948a6DeC2892',
      'to': '0x21De6451f9f05DdffA6D8466A70F38A9495f30EC',
      'value': '1000000000000000000000000'
    },
    'event': 'Transfer',
    'signature': '0xf2dbd98d79f00f7aff338b824931d607bfcc63d47307162470f25a055102d3b0',
    'raw': {
      'data': '0x00000000000000000000000000000000000000000000d3c21bcecceda1000000',
      'topics': [
        '0xf2dbd98d79f00f7aff338b824931d607bfcc63d47307162470f25a055102d3b0',
        '0x0000000000000000000000000000000000000000000000000000000000000003',
        '0x00000000000000000000000021a1a6d233fc90e19d426c85da5c948a6dec2892',
        '0x00000000000000000000000021de6451f9f05ddffa6d8466a70f38a9495f30ec'
      ]
    }
  }
];
