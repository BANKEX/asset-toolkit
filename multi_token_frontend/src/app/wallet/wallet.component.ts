import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MultitokenService, EventService, ConnectionService, FormService } from '../core';
import { Connection } from '../shared/types';
import { TransferModalComponent } from './transfer-modal/transfer-modal.component';
import { GetDividendsModalComponent } from './get-dividends-modal/get-dividends-modal.component';
import { Multitoken } from '../shared/types/multitoken';
import { SendDividendsModalComponent } from './send-dividends-modal/send-dividends-modal.component';
@Component({
  selector: 'mt-wallet',
  templateUrl: './wallet.component.pug',
})

export class WalletComponent implements OnInit {

  public tokens: any;
  public dividends: any;
  public sortOptions: any[];
  public sortBy;
  public objectKeys = Object.keys;

  constructor(
    private $connection: ConnectionService,
    private $events: EventService,
    private $modal: NgbModal,
    private $mt: MultitokenService,
  ) {
    $mt.tokens.distinctUntilChanged().subscribe((_tokens: any) => {
      this.tokens = _tokens;
    });
    $mt.dividends.distinctUntilChanged().subscribe((_dividends: any) => {
      this.dividends = _dividends;
    });
  }

  ngOnInit(): void {
    this.sortOptions = [
      {id: 'index', name: 'Date added', reverse: true},
      {id: 'eth', name: 'Amount', reverse: true}
    ];
    this.sortBy = this.sortOptions[0];
  }

  public showTokensTransactions(tokenKey) {
    this.$mt.resetTransactionsHistory();
    this.$mt.getDetails(tokenKey);
  }

  public showDividendsTransactions(tokenKey) {
    this.$mt.resetTransactionsHistory();
    this.$mt.getDividendsDetails(tokenKey);
  }

  public openTransferModal(key: any, token): void {
    let modalInstance;
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
    modalInstance.amount = this.dividends[key];
  }

  public openDividendsModal(key: any, token): void {
    let modalInstance;
    modalInstance =	this.$modal.open(
      SendDividendsModalComponent,
      {
        size: 'lg',
        windowClass: 'modal-margin-lg'
      }).componentInstance;
    modalInstance.tokenKey = key;
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
