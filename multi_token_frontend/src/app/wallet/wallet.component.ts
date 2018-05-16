import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MultitokenService, EventService, ConnectionService, FormService, UIService } from '../core';
import { Connection } from '../shared/types';
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

  public avalableTokensCount = this.$mt.avalableTokensCount;
  public connected = false;
  public empty = false;
  public tokens: any;
  public dividends: any;
  public sortOptions: any[];
  public sortBy;
  public objectKeys = Object.keys;

  constructor(
    public $form: FormService,
    private $connection: ConnectionService,
    private $clipboard: ClipboardService,
    private $events: EventService,
    private $modal: NgbModal,
    private $mt: MultitokenService,
    private $ui: UIService,
  ) {
    $mt.tokens.distinctUntilChanged().subscribe((_tokens: any) => {
      if (Object.keys(_tokens).length !== 0) {
        this.tokens = _tokens;
        this.empty = false;
      } else {
        this.empty = true;
      }
    });
    $mt.dividends.distinctUntilChanged().subscribe((_dividends: any) => {
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

  public copyToClipboard(_text) {
    this.$clipboard.copyFromContent(_text);
    this.$events.copyToClipboard();
  }

  public showTokensTransactions(tokenKey) {
    this.$mt.resetTransactionsHistory();
    this.$mt.getDetails(tokenKey);
    this.$ui.detailsClicked();
  }

  public showDividendsTransactions(tokenKey) {
    this.$mt.resetTransactionsHistory();
    this.$mt.getDividendsDetails(tokenKey);
    this.$ui.detailsClicked();
  }

  public openTransferModal(key: any, token): void {
    let modalInstance;
    if (this.avalableTokensCount(token) === 0) { return; }
    if (+this.avalableTokensCount(token) < 0) { throw Error('Negativ tokem amount. Please report a bug!') }
    modalInstance =	this.$modal.open(
      TransferModalComponent,
      {
        size: 'lg',
        windowClass: 'modal-margin-lg'
      }).componentInstance;
    modalInstance.transaction = {key, token};
  }

  public openWithdrawModal(key: any, token): void {
    let modalInstance;
    if (this.dividends[key] === '0') { return; }
    modalInstance =	this.$modal.open(
      GetDividendsModalComponent,
      {
        size: 'lg',
        windowClass: 'modal-margin-lg'
      }).componentInstance;
    modalInstance.tokenKey = key;
    modalInstance.avalable = this.dividends[key];
  }

  public openDividendsModal(key?: string, token?: any): void {
    let modalInstance;
    modalInstance =	this.$modal.open(
      SendDividendsModalComponent,
      {
        size: 'lg',
        windowClass: 'modal-margin-lg'
      }).componentInstance;
    modalInstance.tokenKey = key;
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

  public calculatePendings(token: Multitoken) {
    Object.setPrototypeOf(token, new Multitoken());
    return token.totalPending();
  }

  public onTabChanged() {
    this.$mt.resetTransactionsHistory();
  }

  public fromWei(val) {
    return this.$connection.web3.utils.fromWei(val);
  }

}
