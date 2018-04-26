import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MultitokenService, EventService, ConnectionService } from '../core';
import { Connection } from '../shared/types';
import { TransferModalComponent } from './transfer-modal/transfer-modal.component';
import { Multitoken } from '../shared/types/multitoken';
@Component({
  selector: 'mt-wallet',
  templateUrl: './wallet.component.pug',
})

export class WalletComponent implements OnInit {

  public tokens: any;
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
  }

  ngOnInit(): void {
    this.sortOptions = [
      {id: 'index', name: 'Date added', reverse: true},
      {id: 'eth', name: 'Amount', reverse: true}
    ];
    this.sortBy = this.sortOptions[0];
  }

  public showTransactions(tokenKey) {
    this.$mt.getDetails(tokenKey);
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

  public calculatePendings(token: Multitoken) {
    Object.setPrototypeOf(token, new Multitoken());
    return token.totalPending();
  }

}
