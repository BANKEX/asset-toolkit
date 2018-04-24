import {
  Injectable
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class EventService {

  //#region Events sources

  // triggered when any transaction submited - emit hash address of the transaction
  private _onTransactionSubmited: Subject <string> = new Subject<string>();
  private onTransactionSubmitedSource = this._onTransactionSubmited.asObservable().share<string>();

  //#endregion

  //#region Methods to emit data

  public transactionSubmited(txHash: string): void {
    this._onTransactionSubmited.next(txHash);
  }


  //#endregion

  //#region Methods to subscribe on events

  public onTransactionSubmited(): Observable <string> {
    return this.onTransactionSubmitedSource;
  }

  //#endregion

}
