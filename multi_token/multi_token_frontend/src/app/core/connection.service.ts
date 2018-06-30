import { ActivatedRoute, Router } from '@angular/router';
import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx';
import { Connection, Feature } from '../shared/types';
import { Account, Contract, Tx } from 'web3/types';
import { to } from 'await-to-js';
import { ErrorMessageService } from '../shared/services';
import { ToastyService } from 'ng2-toasty';
import { BlockingNotificationOverlayService } from '../shared/services';
import * as Web3 from 'web3';
const abiDecoder = require('abi-decoder'); // NodeJS

@Injectable()
export class ConnectionService extends BehaviorSubject<Connection> {

  /**
   * Service for managing connection to Blockchain
   */

  public account: string;   // user address
  public contract: Contract;
  public decoder: any;      // instance of Abi-Decoder
  public err: Subject<Error> = new Subject();
  public features: any;
  public networkId: number;
  public web3: any;         // setted up instance of Web3

  private balances: any;
  private Web3: any = Web3;

  public constructor(
    @Inject('AppConfig') private $config,
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
      this.decoder = abiDecoder.addABI(this.$config.abi);
      ({account: this.account, networkId: this.networkId} = await this.init(this.web3));
      this.contract = new this.web3.eth.Contract(this.$config.abi, contractHash || this.$config.contracts[this.networkId]);
      this.features = await this.getContractFeatures();
      this.next(Connection.Estableshed);
      // this.$blockingNotificationOverlay.hideOverlay();
      this.startLoops();
    } catch (e) {
      this.$blockingNotificationOverlay.setOverlayMessage(e);
      this.$blockingNotificationOverlay.showOverlay();
      this.next(Connection.None);
    }
  }

  public getAccount = () => this.account;

  private async init(web3): Promise<{account: string, networkId: number}> {
    let account, accounts, networkId, error;
    if (!web3 || !web3.currentProvider) {
      throw new Error('No Web3 provider found');
    }
    [error, accounts] = await to(web3.eth.getAccounts());
    if (!accounts) { throw new Error('No Web3 provider found. Have you installed Metamask?'); }
    if (!accounts[0]) { throw new Error('Metamask is locked!'); }
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
      return new this.Web3((window as any).web3.currentProvider);
    } else {
      console.warn('No web3 detected. Falling back to http://localhost:8545.');
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

  //#region Contract features detection

  private async hasMethod(contract, signature) {
    const w3 = this.web3;
    const code = await w3.eth.getCode(contract);
    let hash = w3.eth.abi.encodeFunctionSignature(signature);
    return code.indexOf('578063' + hash.slice(2, hash.length)) > 0;
  }

  private async getContractFeatures() {
    const interfaces = this.getInterfaces();
    const features = {};
    // tslint:disable-next-line:forin
    for (let key in interfaces) {
      const arr = await Promise.all(interfaces[key].map(item => this.hasMethod(this.contract.options.address, item)));
      features[key] = arr.reduce((result, item) => result && item, true); // all signatures must be presented
    }
    return features;
  }

  private getInterfaces() {
    const features = {};
    features[Feature.Dividends] = [
      'dividendsRightsOf(uint256,address)',
      'releaseDividendsRights(uint256,uint256)'
    ];
    features[Feature.Emission] = [
      'init(uint256,uint256)'
    ]
    return features;
  }

  //#endregion
}
