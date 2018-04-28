import {
  ConnectionService,
  HelperService,
  EventService,
} from '.';
import { Account, Contract, PromiEvent, Tx, Transaction } from 'web3/types';
import { Connection } from '../shared/types';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ErrorMessageService } from '../shared/services/index';
import { to } from 'await-to-js';
import * as moment from 'moment';

@Injectable()
export class MultitokenService {

  public lastToken: string;
  public transactions: Subject<any[]> = new Subject();
  public tokens: Subject<any> = new Subject();

  private fetchDataDelay = 50000;
  private userAddress: string;
  private contractAddress: string;
  private balances: any;
  private contract: Contract;

  constructor(
    private $connection: ConnectionService,
    private $error: ErrorMessageService,
    private $events: EventService,
    private $helper: HelperService,
  ) {
    $connection.subscribe(status => {
      if (status === Connection.Estableshed) {
        this.contractAddress = $connection.contractData.address;
        this.userAddress = $connection.account;
        this.contract = $connection.contract;
        this.startLoops();
      }
    })
  }

  public getBalance = async (tokenId) => {
    const amount = await this.contract.methods.balanceOf(tokenId, this.userAddress).call();
    const totalSupply = await this.contract.methods.totalSupply(tokenId).call();
    const part = Math.round(amount / totalSupply * 100);
    const pending = {};
    return { amount, part, pending };
  };

  public async getBalances () {
    const cells = [];
    const balances = {};
    const transferedCellsFrom = await this.contract.getPastEvents('Transfer', { fromBlock: 0, filter: { from: this.userAddress }});
    const transferedCellsTo = await this.contract.getPastEvents('Transfer', { fromBlock: 0, filter: { to: this.userAddress }});
    const transferedCells = transferedCellsFrom.concat(transferedCellsTo);
    transferedCells.forEach((event, index, array) => {
      const { tokenId }  = event.returnValues;
      if (cells.indexOf(tokenId) === -1) { cells.push(tokenId); }
    });
    const pendings = await this.getPendings();
    await Promise.all(cells.map(async (tokenId) => {
      balances[tokenId] = await this.getBalance(tokenId);
      balances[tokenId].pending = pendings[tokenId] || [];

      return null;
    }));
    this.tokens.next(balances);
  };

  public sendTokens (tokenId, address, amount): PromiEvent<Transaction> {
      return this.contract.methods.transfer(tokenId, address, amount).send({from: this.userAddress});
    // this.balances[tokenId].pending[transactionHash] = -amount;
  };

  public getTokenBalance(tokenId): Promise<string> {
    return this.contract.methods.balanceOf(tokenId, this.userAddress).call();
  }

  public getDetails = async (tokenId) => {
    const transfersOnTokenIdFrom =
      await this.contract.getPastEvents('Transfer', { fromBlock: 0, filter: { from: this.userAddress, tokenId }});
    const transfersOnTokenIdTo =
      await this.contract.getPastEvents('Transfer', { fromBlock: 0, filter: { to: this.userAddress, tokenId }});
    const transfersOnTokenId = transfersOnTokenIdFrom.concat(transfersOnTokenIdTo);
    const pendings = await this.getPendings();
    const details = await Promise.all(transfersOnTokenId.map(async (ev) => {
      const blockAdded = await this.$connection.web3.eth.getBlock(ev.blockHash);
      const date = blockAdded.timestamp * 1000;
      const plus = (ev.returnValues.to === this.userAddress);
      const address = (plus) ? ev.returnValues.from : ev.returnValues.to;
      const value = Number((plus) ? ev.returnValues.value : -ev.returnValues.value);
      return { address, date, value };
    }));
    if (pendings[tokenId]) {
      pendings[tokenId].forEach((elem) => {
        const pend = {
          address: elem.address,
          value: -elem.value,
          date: 0,
        };
        details.push(pend);
      });
    }
    this.lastToken = tokenId; // should assign before brodcasting transactions!
    this.transactions.next(details);
  };

  public getOwner() {
    return this.contract.methods.owner().call();
  }

  private getPendings = async () => {
    const { transactions } = await this.$connection.web3.eth.getBlock('pending', true);
    const userTransactions = transactions.filter((elem) => (elem.from === this.userAddress));
    const pendings = {};
    await Promise.all(userTransactions.map(async (elem) => {
      const transaction = await this.$connection.web3.eth.getTransaction(elem.hash);
      const tokenId = this.$connection.web3.utils.hexToNumber(transaction.input.slice(-192, -128));
      const pending = {
        address: transaction.input.slice(-128, -64).replace(/^0*/, '0x'),
        value: this.$connection.web3.utils.hexToNumber(transaction.input.slice(-64))
      };
      if (!Array.isArray(pendings[tokenId])) {
        pendings[tokenId] = [];
      }
      pendings[tokenId].push(pending);
      return null;
    }));
    return pendings;
  };


  private startLoops() {
    this.getBalances();
    setInterval(this.getBalances.bind(this), this.fetchDataDelay);
    setInterval(() => {
      if (this.lastToken) {
        this.getDetails(this.lastToken)
      }
    }, this.fetchDataDelay)

/*
    this.contract.events.Transfer({
      fromBlock: 'latest',
      filter: { from: this.userAddress }
    }).on('data', async (event) => {
      // const { tokenId } = event.returnValues;
      // this.balances[tokenId] = await this.getBalance(tokenId);
      this.getBalances();
    });

    this.contract.events.Transfer({
      fromBlock: 'latest',
      filter: { to: this.userAddress }
    }).on('data', async (event) => {
      // const { tokenId } = event.returnValues;
      // this.balances[tokenId] = await this.getBalance(tokenId);
      this.getBalances();
    });
*/
  }
}
