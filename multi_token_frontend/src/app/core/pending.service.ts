import { BigNumber } from 'bignumber.js';
import { ConnectionService } from './connection.service';
import { Contract, Transaction } from 'web3/types';
import { DecoderService } from './decoder.service';
import { Injectable, Inject } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { Pending, Connection, Token } from '../shared/types';
import Web3 from 'web3';

@Injectable()
export class PendingService extends Subject<Pending> {
  /**
  * Service to provide all pending events in blockchein
  */

  private contract: Contract;
  private decoder: any;
  // Block new tokens request if previos one didn't finished yet
  private serviceBusy: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private user: string;
  private web3: Web3;

  public constructor(
    @Inject('AppConfig') private $config,
    private $connection: ConnectionService,
    private $decoder: DecoderService,
  ) {
    super();
    $connection.subscribe(status => {
      if (status !== Connection.Estableshed) {return}
      this.contract = $connection.contract;
      this.user = $connection.account;
      this.web3 = $connection.web3;
      Observable
        .interval($config.intervals.pendingsFetch || 1000)
        .startWith(0)
        .withLatestFrom(this.serviceBusy)
        .filter(([interval, flag]) => !flag) // pass only when no current request
        .switchMap(() => Observable.fromPromise(this.getPendings(this.serviceBusy)))
        .subscribe(pendings => this.next(pendings));
    });
  }

  private async getPendings(flagman: Subject<boolean>) {
    flagman.next(true);
    // const transactions = testTransactions; // For testing
    const { transactions } = await this.web3.eth.getBlock('pending', true);
    const contractTransactions = transactions.filter((elem) => elem.to === this.contract.options.address);
    const pendings = new Pending;
    await Promise.all(contractTransactions.map(async (encodedTransaction) => {
      const method = this.$decoder.abi.decodeMethod(encodedTransaction.input);
      const tokenIdAttr = method.params.find(el => el.name === '_tokenId');
      const tokenId = tokenIdAttr ? tokenIdAttr.value : undefined;
      if (!tokenId) { return };
      const pending = {};
      switch (method.name) {
        case 'init':
          pendings.emissions.push({
            initiator: encodedTransaction.from,
            token: tokenId,
            value: (new BigNumber(method.params.find(el => el.name === '_value').value)).div(new BigNumber(1e+18))
          })
          break;
        case 'transfer':
          const target = method.params.find(param => param.name === '_to').value
          pendings.transfers.push({
            initiator: encodedTransaction.from,
            direction: target === this.$connection.account ? 'in' : 'out',
            token: tokenId,
            to: target,
            value: (new BigNumber(method.params.find(el => el.name === '_value').value)).div(new BigNumber(1e+18))
          })
          break;
        case 'acceptDividends':
          pendings.transactions.push({
            initiator: encodedTransaction.from,
            direction: 'in',
            token: tokenId,
            type: 'acceptence',
            value: (new BigNumber(encodedTransaction.value)).div(new BigNumber(1e+18))
          })
          break;
        case 'releaseDividendsRights':
          pendings.transactions.push({
            initiator: encodedTransaction.from,
            direction: 'out',
            token: tokenId,
            type: 'withdrawal',
            value: (new BigNumber(method.params.find(el => el.name === '_value').value)).div(new BigNumber(1e+18))
          })
          break;
      }
      return true;
    }));
    flagman.next(false);
    // console.log(pendings);
    return pendings;
  };

  // private
}

// Example data:
// tslint:disable:quotemark
// tslint:disable:max-line-length
// tslint:disable:no-var-keyword

var exampleEmissionTransaction = {
  blockHash: "0x8e2f187ef4bd40886585eaf3d5db583fb64f55d7af32bfd0fb385aa45779a35d",
  blockNumber: 2327618,
  from: "0x21A1a6D233fC90e19D426C85DA5C948a6DeC2892",
  gas: 131164,
  gasPrice: "2000000000",
  hash: "0x7339955aab43122858a6a37adcfd943733d49f3c999dc090eb7c1b18d2187f04",
  input : "0xa5843f08000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000cecb8f27f4200f3a0000000",
  nonce : 405,
  r: "0x4bcc00a7a543a2604118bcb2bbaf6aa3444e3a20280c1cf916c92695bfbd6a23",
  s: "0x752c425d1548f541a9647c75cb102637bff95a6aaf2e2bc476588d101ae6ae3a",
  to: "0x02a2F8482658a3DA0bBE078F3c0316e94d00a148",
  transactionIndex: 43,
  v: "0x2b",
  value: "0"
}

// Исходящий перевод 1 000 000 токенов с id = 3
var exampleOutgoingTransferTransaction = {
  blockHash: "0x2c06a260300c243be72bd97244f3f336ccbd441abd357edc6cf93e24f718ee42",
  blockNumber: 2327870,
  from: "0x21A1a6D233fC90e19D426C85DA5C948a6DeC2892",
  gas: 97108,
  gasPrice: "2000000000",
  hash: "0x5bec6e7a35746a8492b414b675949a1c8f2e1cf1af7222a55bd4b0d1bec100c4",
  input: "0xf8548e36000000000000000000000000000000000000000000000000000000000000000200000000000000000000000021de6451f9f05ddffa6d8466a70f38a9495f30ec00000000000000000000000000000000000000000000d3c21bcecceda1000000",
  nonce: 406,
  r: "0x141a1e9a8e836ba01ac1dbd285944e189bc55585000a675c700829d902e7e7a5",
  s: "0x7de4b2381d8c6b0fe84ac770d9d8696f3020400aa1a934b426accdf055a6d0bc",
  to: "0x02a2F8482658a3DA0bBE078F3c0316e94d00a148",
  transactionIndex: 1,
  v: "0x2b",
  value: "0",
}

// Входящий перевод 1 000 000 токенов с id = 3
var exampleIncomingTransferTransaction = {
  blockHash: "0x2c06a260300c243be72bd97244f3f336ccbd441abd357edc6cf93e24f718ee41",
  blockNumber: 2327871,
  from: "0x21de6451f9f05ddffa6d8466a70f38a9495f30ec",
  gas: 97108,
  gasPrice: "2000000000",
  hash: "0x5bec6e7a35746a8492b414b675949a1c8f2e1cf1af7222a55bd4b0d1bec100c4",
  input: "0xf8548e36000000000000000000000000000000000000000000000000000000000000000200000000000000000000000021A1a6D233fC90e19D426C85DA5C948a6DeC289200000000000000000000000000000000000000000000d3c21bcecceda1000000",
  nonce: 406,
  r: "0x141a1e9a8e836ba01ac1dbd285944e189bc55585000a675c700829d902e7e7a5",
  s: "0x7de4b2381d8c6b0fe84ac770d9d8696f3020400aa1a934b426accdf055a6d0bc",
  to: "0x02a2F8482658a3DA0bBE078F3c0316e94d00a148",
  transactionIndex: 1,
  v: "0x2b",
  value: "0",
}

var exampleDividendsAcceptTransaction = {
  blockHash: "0x60c22af7f4f6941f7165d267b389a6520bac501d2a203d02f45aa238894ade13",
  blockNumber: 2327979,
  from: "0x21A1a6D233fC90e19D426C85DA5C948a6DeC2892",
  gas: 66522,
  gasPrice: "2000000000",
  hash: "0x77fb0a5f858a04700404831f793f86f8f10cf155ccbccea8d973df7f74c0977e",
  input: "0x315804460000000000000000000000000000000000000000000000000000000000000004",
  nonce: 408,
  r: "0xc354c9ac7a61a63764cb439433d62ae984bf751cf74725b8371ba0a7ef0b25e1",
  s: "0x322e313e177e42576b8c5067dda10d8adb739c1f8da180a4801017b4a49664fb",
  to: "0x02a2F8482658a3DA0bBE078F3c0316e94d00a148",
  transactionIndex: 16,
  v: "0x2b",
  value: "100000000000000000",
}

var exampleDividendsWithdrawalTransaction = {
  blockHash: "0x0519f921d07540e1bb127086112f834fa7b4b66a2601d52f3bc3d15da38ffb7d",
  blockNumber: 2328604,
  from: "0x21A1a6D233fC90e19D426C85DA5C948a6DeC2892",
  gas: 58093,
  gasPrice: "2000000000",
  hash: "0xfa6e6497b4b9c1c9c473614508130f4f124ad179bb288cffbcb7791a0c1016bc",
  input: "0x7ba47d9a0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000058d15e0fef26c00",
  nonce: 409,
  r: "0xa9982c1c5ee051bd920f20e079defb126cddbbb13916bb1fee400d1aa7892471",
  s: "0x4014afef7dc56661676f2cc7ef9e9089f3edf4c92fb6d7c0d2fae4cf9f53c302",
  to: "0x02a2F8482658a3DA0bBE078F3c0316e94d00a148",
  transactionIndex: 160,
  v: "0x2c",
  value: "0",
}

var testTransactions = [
  exampleDividendsAcceptTransaction,
  exampleDividendsWithdrawalTransaction,
  exampleEmissionTransaction,
  exampleOutgoingTransferTransaction,
  exampleIncomingTransferTransaction,
];
