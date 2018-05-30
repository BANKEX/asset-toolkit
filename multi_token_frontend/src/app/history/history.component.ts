import { Component, OnInit } from '@angular/core';
import { EventService, MultitokenService, ConnectionService, FormService, UIService, DividendService, TokenService } from '../core';
import { LoadingOverlayService } from '../shared/services';
import { to } from 'await-to-js';
import { ClipboardService } from 'ngx-clipboard';
import { Details } from '../shared/types/details.enum';
import { from } from 'rxjs/observable/from';
import { Operation, OperationType, OperationDirection } from '../shared/types';
import { Observable } from 'rxjs';
import { BlockchainEvent } from '../shared/types/blockchain-event';

@Component({
  selector: 'mt-history',
  templateUrl: './history.component.pug',
})
export class HistoryComponent implements OnInit {

  public showSpinner = false;
  public sortOptions: any[];
  public sortBy;
  public tokenId;
  public operations: Operation[];
  public title: string;

  public getDate = this.$mt.dateByBlockHash;

  // private _title = 'Click on token or dividends to see transactions history';

  public constructor(
    public $ui: UIService,
    private $connection: ConnectionService,
    private $clipboard: ClipboardService,
    private $events: EventService,
    private $form: FormService,
    private $overlay: LoadingOverlayService,
    private $mt: MultitokenService,
    private $dividend: DividendService,
    private $token: TokenService,
  ) {
    const sub = $ui.onDetailsClicked()
      .do(this.onHistoryShowSignalReceved.bind(this))
      .combineLatest($token.transfers, $dividend.transactions)
      .map(([{token, details}, transfers, transactions]) => {
        const source: BlockchainEvent[] = details === Details.Transactions
          ? transactions
          : transfers.filter(e => e.returnValues.tokenId === token.id);
        if (!source || source.length === 0) { return source }
        return (source[0].returnValues.tokenId !== token.id)
          ? undefined // to filter old values that comes from 'combineLatest'
          : source.reduce((result, item) => {
            result.push(Operation.fromBlockchainEvent(item, $connection.account))
            return result;
          }, [])
      })
      .switchMap(operations => {
        return operations ? Observable.fromPromise(Promise.all(operations.map(async (operation): Promise<Operation> => {
          operation.date = await this.getDate(operation.blockHash);
          return operation;
        }))) : Observable.of(operations); // had to pass initial undefined value somehow...
      })
      sub.subscribe((_operations: any[]) => {
        this.operations = _operations as Operation[];
    });
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

  public getDirectionTitle(operation: Operation) {
    if (operation.type === OperationType.Transfer) {
      return operation.direction === OperationDirection.In ? 'Incoming transaction' : 'Outgoing transaction'
    } else if (operation.type === OperationType.Transaction) {
      return operation.direction === OperationDirection.In ? 'Receipt of dividends' : 'Dividends withdrawal'
    }
  }

  public prepareValue(operation: Operation) {
    const value = operation.value.toString();
    return operation.type === OperationType.Transfer ? value + ' TOKEN' : value + ' ETH';
  }

  private onHistoryShowSignalReceved({token, details}) {
    this.tokenId = token.id;
    this.operations = undefined;
    this.showSpinner = true;
    if (details === Details.Transfers) {
      this.$dividend.stopEmitHistory();
      this.title = `Transactions of 0x${this.tokenId} token:`;
    } else if (details === Details.Transactions) {
      this.$dividend.startEmitHistory(token.id);
      this.title = `Dividends transactions for 0x${this.tokenId} token:`;
    }
  }

}
