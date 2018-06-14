import { BigNumber } from 'bignumber.js';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MultitokenService, EventService, ConnectionService, FormService, UIService, TokenService, PendingService, DividendService } from '../core';
import { Connection, Pending, Token, Operation, OperationDirection, OperationType, Feature } from '../shared/types';
import { TransferModalComponent } from './transfer-modal/transfer-modal.component';
import { GetDividendsModalComponent } from './get-dividends-modal/get-dividends-modal.component';
import { Multitoken } from '../shared/types/multitoken';
import { SendDividendsModalComponent } from './send-dividends-modal/send-dividends-modal.component';
import { AddTokenModalComponent } from './add-token-modal/add-token-modal.component';
import { ClipboardService } from 'ngx-clipboard';
@Component({
  selector: 'mt-wallet',
  templateUrl: './wallet.component.pug',
})

export class WalletComponent implements OnInit {

  public connected = false;
  public dividends: any;
  public empty = false;
  public Feature = Feature; // expose enum to the view
  public contractFeatures: any;
  public objectKeys = Object.keys;
  public pending: Pending;
  public pendings: any;    //  formatted version of pendigs
  public sortOptions: any[];
  public sortBy;
  public tokens: any;

  constructor(
    public $form: FormService,
    private $connection: ConnectionService,
    private $clipboard: ClipboardService,
    private $dividend: DividendService,
    private $events: EventService,
    private $modal: NgbModal,
    private $mt: MultitokenService,
    private $pending: PendingService,
    private $token: TokenService,
    private $ui: UIService,
  ) {
    $token.subscribe((_tokens: any) => {
      this.empty = Object.keys(_tokens).length === 0 ? true : false;
      this.contractFeatures = $connection.features;
      this.tokens = _tokens;
    });
    $pending.subscribe((_pending) => {
      this.pending = _pending;
      this.pendings = this.formatPendings(this.pending);
    });
    $dividend.subscribe((_dividends: any) => {
      this.dividends = _dividends;
    });
  }

  public ngOnInit(): void {
    this.sortOptions = [
      {id: 'index', name: 'Date added', reverse: true},
      {id: 'eth', name: 'Amount', reverse: true}
    ];
    this.sortBy = this.sortOptions[0];
  }

  public isRinkeby = () => this.$connection.networkId === 4;

  public avalableTokens(token: Token) {
    if (!this.pending || this.pending.transfers.length === 0) { return token.amount; }
    let pendingAmount = new BigNumber('0');
    for (let transfer of this.pending.transfers) {
      // take only specified token transfers from this account
      if (transfer.token === token.id && transfer.to !== this.$connection.account) {
        pendingAmount = pendingAmount.plus(transfer.value);
      }
    }
    return token.amount.minus(pendingAmount);
  }

  public avalableDividends(token: Token) {
    if (!this.pending || this.pending.transactions.length === 0) { return token.amount; }
    let pendingAmount = new BigNumber('0');
    for (let transaction of this.pending.transactions) {
      if (transaction.token === token.id && transaction.type === 'withdrawal') {
        pendingAmount = pendingAmount.plus(transaction.value);
      }
    }
    return token.amount.minus(pendingAmount);

  }

  public copyToClipboard(_text) {
    this.$clipboard.copyFromContent(_text);
    this.$events.copyToClipboard();
  }

  public showTokensTransactions(token: Token) {
    this.$ui.detailsClicked(token, OperationType.Transfer);
  }

  public showDividendsTransactions(token: Token) {
    this.$ui.detailsClicked(token, OperationType.Transaction);
  }

  public openTransferModal(token): void {
    let modalInstance;
    const avalable = this.avalableTokens(token);
    if (avalable.isLessThan(0)) { throw Error('Negativ tokem amount. Please report a bug!') }
    modalInstance =	this.$modal.open(
      TransferModalComponent,
      {
        size: 'lg',
        windowClass: 'modal-margin-lg'
      }).componentInstance;
    modalInstance.token = token;
    modalInstance.avalable = avalable;
  }

  public openWithdrawModal(token: Token): void {
    let modalInstance;
    if (this.dividends[token.id] === '0') { return; }
    modalInstance =	this.$modal.open(
      GetDividendsModalComponent,
      {
        size: 'lg',
        windowClass: 'modal-margin-lg'
      }).componentInstance;
    modalInstance.tokenKey = token.id;
    modalInstance.avalable = this.dividends[token.id];
  }

  public openAddDividendsModal(token?: Token): void {
    let modalInstance;
    modalInstance =	this.$modal.open(
      SendDividendsModalComponent,
      {
        size: 'lg',
        windowClass: 'modal-margin-lg'
      }).componentInstance;
    modalInstance.tokenKey = token ? token.id : token;
  }

  public openAddTokenModal(): void {
    let modalInstance;
    modalInstance =	this.$modal.open(
      AddTokenModalComponent,
      {
        size: 'lg',
        windowClass: 'modal-margin-lg'
      }).componentInstance;
  }

  /**
   * Format pendings for future use
   * @param  {Pending} pendings
   */
  private formatPendings(pendings: Pending) {
    let emissions = [];
    const transactions = {in: {}, out: {}};
    const transfers = {in: {}, out: {}};
    pendings.transactions.forEach((operation: Operation) => {
      if (operation.direction === OperationDirection.In) {
        if (!transactions.in[operation.token]) {
          transactions.in[operation.token] = operation.value
        } else {
          transactions.in[operation.token] = transactions.in[operation.token].plus(operation.value)
        }
      } else if (operation.direction === OperationDirection.Out) {
        if (!transactions.out[operation.token]) {
          transactions.out[operation.token] = operation.value
        } else {
          transactions.out[operation.token] = transactions.out[operation.token].plus(operation.value)
        }
      }
    });
    pendings.transfers.forEach((operation: Operation) => {
      if (operation.direction === OperationDirection.In) {
        if (!transfers.in[operation.token]) {
          transfers.in[operation.token] = operation.value
        } else {
          transfers.in[operation.token] = transfers.in[operation.token].plus(operation.value)
        }
      } else if (operation.direction === OperationDirection.Out) {
        if (!transfers.out[operation.token]) {
          transfers.out[operation.token] = operation.value
        } else {
          transfers.out[operation.token] = transfers.out[operation.token].plus(operation.value)
        }
      }
    });
    emissions = pendings.emissions.filter((item) => item.initiator === this.$connection.account)
    return {transfers, transactions, emissions};
  }

}
