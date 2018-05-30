import { Component, OnInit } from '@angular/core';
import { EventService, MultitokenService, ConnectionService, FormService, UIService, DividendService, TokenService, PendingService } from '../core';
import { LoadingOverlayService } from '../shared/services';
import { to } from 'await-to-js';
import { ClipboardService } from 'ngx-clipboard';
import { from } from 'rxjs/observable/from';
import { Operation, OperationType, OperationDirection } from '../shared/types';
import { Observable } from 'rxjs';
import { BlockchainEvent } from '../shared/types/blockchain-event';

@Component({
  selector: 'mt-history',
  templateUrl: './history.component.pug',
})
export class HistoryComponent implements OnInit {

  public currentlyShowing: OperationType;
  public operations: Operation[];
  public pendings: Operation[] = [];
  public showSpinner = false;
  public sortOptions: any[];
  public sortBy;
  public tokenId;
  public title: string;

  public getDate = this.$mt.dateByBlockHash;

  public constructor(
    public $ui: UIService,
    private $connection: ConnectionService,
    private $clipboard: ClipboardService,
    private $dividend: DividendService,
    private $events: EventService,
    private $form: FormService,
    private $overlay: LoadingOverlayService,
    private $pending: PendingService,
    private $mt: MultitokenService,
    private $token: TokenService,
  ) {
    const historySub = $ui.onDetailsClicked()
      .do(({token, details}) => this.tokenId = token.id)
      .do(this.onHistoryShowSignalReceved.bind(this))
      .combineLatest($token.transfers, $dividend.transactions)
      .map(([{token, details}, transfers, transactions]) => {
        const source: BlockchainEvent[] = details === OperationType.Transaction
          ? transactions
          : transfers.filter(e => e.returnValues.tokenId === token.id);
        if (!source || source.length === 0) { return source }
        return (source[0].returnValues.tokenId !== this.tokenId)
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

    historySub.combineLatest($pending, $token).subscribe(([_operations, _pendings, _tokens]) => {
      if (!this.currentlyShowing) { return }
      switch (this.currentlyShowing) {
        case OperationType.Transfer:
          this.pendings = _pendings.transfers.filter((item: Operation) => item.token === this.tokenId);
        break;
        case OperationType.Transaction:
          this.pendings = _pendings.transactions.filter((item: Operation) => {
            return item.token === this.tokenId && (
              item.direction === OperationDirection.In ||
                item.token === OperationDirection.Out && (_tokens[item.token].amount as BigNumber).isGreaterThan(0)
            )
          });
        break;
        default:
          throw Error('Unknown operation type!');
      }
    this.operations = _operations ? this.pendings.concat(_operations as Operation[]) : _operations;
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
    this.currentlyShowing = details;
    this.operations = undefined;
    this.showSpinner = true;
    if (details === OperationType.Transfer) {
      this.$dividend.resetHistory();
      this.title = `Transactions of 0x${this.tokenId} token:`;
    } else if (details === OperationType.Transaction) {
      this.$dividend.emitHistory(token.id);
      this.title = `Dividends transactions for 0x${this.tokenId} token:`;
    }
  }

}
