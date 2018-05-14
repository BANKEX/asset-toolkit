import { Component, OnInit } from '@angular/core';
import { EventService, MultitokenService, ConnectionService, FormService, UIService } from '../core';
import { LoadingOverlayService } from '../shared/services';
import { to } from 'await-to-js';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'mt-history',
  templateUrl: './history.component.pug',
})
export class HistoryComponent implements OnInit {

  public showSpinner = false;
  public sortOptions: any[];
  public sortBy;
  public tokenId;
  public transactions: any[];
  public title: string;

  // private _title = 'Click on token or dividends to see transactions history';

  public constructor(
    public $ui: UIService,
    private $connection: ConnectionService,
    private $clipboard: ClipboardService,
    private $events: EventService,
    private $form: FormService,
    private $overlay: LoadingOverlayService,
    private $mt: MultitokenService,
  ) {
    // this.title = this._title;
    $mt.transactions.subscribe((_transactions: any[]) => {
      this.transactions = _transactions;
      this.tokenId = $mt.lastToken;
      if (_transactions.length) {
        this.title = `Transactions of 0x${this.tokenId} token:`;
      }
    });
    $mt.divTransactions.subscribe((_transactions: any[]) => {
      this.transactions = _transactions.filter((item) => item.value);
      this.tokenId = $mt.lastDivToken;
      if (_transactions.length) {
        this.title = `Dividends transactions for 0x${this.tokenId} token:`;
      }
    });
    $ui.onDetailsClicked().subscribe(() => {
      this.transactions = undefined;
      this.showSpinner = true;
    })
  }

  public ngOnInit(): void {
    this.sortOptions = [
      {id: 'index', name: 'Date added', reverse: true},
      {id: 'eth', name: 'Amount', reverse: true}
    ];
    this.sortBy = this.sortOptions[0];
  }

  public copyToClipboard(_text) {
    this.$clipboard.copyFromContent(_text);
    this.$events.copyToClipboard();
  }

  public prepareValue(transaction) {
    return transaction.address
      ? this.$form.from1E18(transaction.value.toLocaleString().replace(/[-\s]/g, '')) + ' TOKEN'
      : this.$form.from1E18(String(Math.floor(transaction.value)).replace(/-/, '')) + ' ETH';
  }
}
