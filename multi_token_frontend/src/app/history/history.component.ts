import { Component, OnInit } from '@angular/core';
import { EventService, MultitokenService, ConnectionService, FormService } from '../core';
import { LoadingOverlayService } from '../shared/services';
import { to } from 'await-to-js';

@Component({
  selector: 'mt-history',
  templateUrl: './history.component.pug',
})
export class HistoryComponent implements OnInit {

  public sortOptions: any[];
  public sortBy;
  public tokenId;
  public transactions: any[];
  public title: string;

  private _title = 'Click on token or dividends to see transactions history';

  public constructor(
    private $connection: ConnectionService,
    private $events: EventService,
    private $form: FormService,
    private $overlay: LoadingOverlayService,
    private $mt: MultitokenService,
  ) {
    this.title = this._title;
    $mt.transactions.filter(tr => tr.length > 0).subscribe((_transactions: any[]) => {
      this.transactions = _transactions;
      this.tokenId = $mt.lastToken;
      this.title = _transactions.length ? `Transactions of type ${this.tokenId} token:` : this._title;
    });
    $mt.divTransactions.filter(tr => tr.length > 0).subscribe((_transactions: any[]) => {
      this.transactions = _transactions.filter((item) => item.value);
      this.tokenId = $mt.lastDivToken;
      this.title = _transactions.length ? `Dividends transactions for type ${this.tokenId} token:` : this._title;
    });
  }

  public ngOnInit(): void {
    this.sortOptions = [
      {id: 'index', name: 'Date added', reverse: true},
      {id: 'eth', name: 'Amount', reverse: true}
    ];
    this.sortBy = this.sortOptions[0];
  }

  // TODO Нужно убрать этот костыль
  public fromWei(val) {
    val = String(Math.floor(val)).replace(/-/, '');
    return this.$connection.web3.utils.fromWei(val) + ' Eth';
  }

  public fromTokens(val) {
    val = val.toLocaleString().replace(/[-\s]/g, '');
    return this.$form.from1E18(val) + ' tokens'
  }
}
