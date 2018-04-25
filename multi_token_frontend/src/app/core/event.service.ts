import {
  Injectable
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfirmationResponse } from '../shared/types';

@Injectable()
export class EventService {

  //#region Events sources

  // TRANSFER

  private _onTransferAdded: Subject<any> = new Subject<any>();
  private onTransferAddedSource = this._onTransferAdded.asObservable().share<any>();

  private _onTransferSubmited: Subject<ConfirmationResponse> = new Subject<ConfirmationResponse>();
  private onTransferSubmitedSource = this._onTransferSubmited.asObservable().share<ConfirmationResponse>();

  private _onTransferConfirmed: Subject<ConfirmationResponse> = new Subject<ConfirmationResponse>();
  private onTransferConfirmedSource = this._onTransferConfirmed.asObservable().share<ConfirmationResponse>();

  private _onTransferFailed: Subject<ConfirmationResponse> = new Subject<ConfirmationResponse>();
  private onTransferFailedSource = this._onTransferFailed.asObservable().share<ConfirmationResponse>();

  private _onTransferCanceled: Subject<ConfirmationResponse> = new Subject<ConfirmationResponse>();
  private onTransferCanceledSource = this._onTransferCanceled.asObservable().share<ConfirmationResponse>();

  //#endregion

  //#region Methods to emit data

 // TRANSFER

 public transferAdded(amount: string): void {
  this._onTransferAdded.next(amount);
}

public transferSubmited(transfer: any): void {
  this._onTransferSubmited.next({internalId: 1});
}

public transferConfirmed(transfer: any): void {
  this._onTransferConfirmed.next(transfer);
}

public transferFailed(transfer: any): void {
  this._onTransferFailed.next({internalId: 1});
}

public transferCanceled(internalId: number): void {
  this._onTransferCanceled.next({internalId: 1});
}

  //#endregion

  //#region Methods to subscribe on events

  // TRANSSFER

  public onTransferAdded(): Observable<number>  {
    return this.onTransferAddedSource;
  }

  public onTransferSubmited(): Observable <ConfirmationResponse> {
    return this.onTransferSubmitedSource;
  }

  public onTransferConfirmed(): Observable <ConfirmationResponse> {
    return this.onTransferConfirmedSource;
  }

  public onTransferFailed(): Observable <ConfirmationResponse> {
    return this.onTransferFailedSource;
  }

  public onTransferCanceled(): Observable <ConfirmationResponse> {
    return this.onTransferCanceledSource;
  }

  //#endregion

}
