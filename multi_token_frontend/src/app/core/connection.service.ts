import { ActivatedRoute, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx';
import { Connection, ContractData } from '../shared/types';
import { Account, Contract, Tx } from 'web3/types';
import { to } from 'await-to-js';
import { HelperService } from '.';
import { ErrorMessageService } from '../shared/services';
import { ToastyService } from 'ng2-toasty';
import { BlockingNotificationOverlayService } from '../shared/services';
import * as Web3 from 'web3';

@Injectable()
export class ConnectionService extends BehaviorSubject<Connection> {
  /**
   * Service for Connection to Blockchain
   */
  public isRinkeby: boolean;
  public err: Subject<Error> = new Subject();
  public web3: any;
  public contract: Contract;
  public contractData: ContractData;
  public account: string;
  public networkId: number;

  private useHardcodedContractData = false;
  private balances: any;
  private Web3: any = Web3;

  public constructor(
    private $blockingNotificationOverlay: BlockingNotificationOverlayService,
    private $error: ErrorMessageService,
    private $toasty: ToastyService,
  ) {
    super(Connection.None); // set initial connection state
    this.web3 = this.checkAndInstantiateWeb3();
    // this.connect(); // now call connection start from app.component
  }

  public async connect(contractHash?: string) {
    this.next(Connection.InProcess);
    try {
      ({account: this.account, networkId: this.networkId} = await this.init(this.web3));
      this.contractData = new ContractData(contractHash, this.networkId);
      this.contract = new this.web3.eth.Contract(this.contractData.abi, this.contractData.address);
      this.next(Connection.Estableshed);
      // this.$blockingNotificationOverlay.hideOverlay();
      this.startLoops();
    } catch (e) {
      this.$blockingNotificationOverlay.setOverlayMessage(e);
      this.$blockingNotificationOverlay.showOverlay();
      this.next(Connection.None);
      // console.error(e);
    }
  }

  public getAccount = () => this.account;

  private async init(web3): Promise<{account: string, networkId: number}> {
    let account, accounts, networkId, error;
    if (!web3 || !web3.currentProvider) {
      throw new Error('No Web3 provider found');
    }
    [error, accounts] = await to(web3.eth.getAccounts());
    if (!accounts) { throw new Error('No Web3 provider found'); }
    if (!accounts[0]) { throw new Error('Web3 provider is locked'); }
    account = accounts[0];
    [error, networkId] = await to(web3.eth.net.getId());
    if (error) { throw new Error(error); }
    return {account, networkId};
  };

  private startLoops() {
    const accountInterval = setInterval(this.watchAccountChange.bind(this), 1000);
  }

  private checkAndInstantiateWeb3() {
    // tslint:disable:max-line-length
    // Checking if Web3 has been injected by the browser
    if (typeof (window as any).web3 !== 'undefined') {
      console.warn(
        'Using web3 detected from external source. If you find that your accounts don\'t appear or you have 0 MetaCoin, ensure you\'ve configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask'
      );
      // Use Mist/MetaMask's provider
      return new this.Web3((window as any).web3.currentProvider);
    } else {
      console.warn(
        'No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      return new this.Web3(new this.Web3.providers.HttpProvider('http://localhost:8545'));
    }
  }

  private watchAccountChange() {
    this.web3.eth.getAccounts((err, acc) => {
      if (err) {
        this.err.next(err);
        console.error(err.message);
        return;
      }
      if (acc[0] !== this.account) {
        // account = this.web3.eth.accounts[0];
        window.location.reload();
      }
    })
  }
}
