import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfirmationResponse, Token } from '../shared/types';

@Injectable()
export class EventService {

  //#region Events sources

  // EMISSION (TOKENS)

  private _onEmissionAdded: Subject<any> = new Subject<any>();
  private onEmissionAddedSource = this._onEmissionAdded.asObservable().share<any>();

  private _onEmissionSubmited: Subject<ConfirmationResponse> = new Subject<ConfirmationResponse>();
  private onEmissionSubmitedSource = this._onEmissionSubmited.asObservable().share<ConfirmationResponse>();

  private _onEmissionConfirmed: Subject<ConfirmationResponse> = new Subject<ConfirmationResponse>();
  private onEmissionConfirmedSource = this._onEmissionConfirmed.asObservable().share<ConfirmationResponse>();

  private _onEmissionFailed: Subject<ConfirmationResponse> = new Subject<ConfirmationResponse>();
  private onEmissionFailedSource = this._onEmissionFailed.asObservable().share<ConfirmationResponse>();

  private _onEmissionCanceled: Subject<ConfirmationResponse> = new Subject<ConfirmationResponse>();
  private onEmissionCanceledSource = this._onEmissionCanceled.asObservable().share<ConfirmationResponse>();

  // TRANSFER (TOKENS)

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

  // TRANSACTION (DIVIDENDS)

  private _onTransactionAdded: Subject<any> = new Subject<any>();
  private onTransactionAddedSource = this._onTransactionAdded.asObservable().share<any>();

  private _onTransactionSubmited: Subject<ConfirmationResponse> = new Subject<ConfirmationResponse>();
  private onTransactionSubmitedSource = this._onTransactionSubmited.asObservable().share<ConfirmationResponse>();

  private _onTransactionConfirmed: Subject<ConfirmationResponse> = new Subject<ConfirmationResponse>();
  private onTransactionConfirmedSource = this._onTransactionConfirmed.asObservable().share<ConfirmationResponse>();

  private _onTransactionFailed: Subject<ConfirmationResponse> = new Subject<ConfirmationResponse>();
  private onTransactionFailedSource = this._onTransactionFailed.asObservable().share<ConfirmationResponse>();

  private _onTransactionCanceled: Subject<ConfirmationResponse> = new Subject<ConfirmationResponse>();
  private onTransactionCanceledSource = this._onTransactionCanceled.asObservable().share<ConfirmationResponse>();

  // CLIPBOARD

  private _onCopyToClipboard: Subject<string> = new Subject<string>();
  private onCopyToClipboardSource = this._onCopyToClipboard.asObservable().share<string>();

  //#endregion

  //#region Methods to emit data

  // TRANSFER (TOKENS)

  public transferAdded(amount: string): void {
    this._onTransferAdded.next(amount);
  }

  public transferSubmited(token: Token, amount: BigNumber): void {
    this._onTransferSubmited.next({internalId: 1});
  }

  public transferConfirmed(token: Token, amount: BigNumber): void {
    this._onTransferConfirmed.next(null);
  }

  public transferFailed(transfer: any): void {
    this._onTransferFailed.next({internalId: 1});
  }

  public transferCanceled(internalId: number): void {
    this._onTransferCanceled.next({internalId: 1});
  }

  // EMISSION (TOKENS)

  public emissionAdded(amount: string): void {
    this._onEmissionAdded.next(amount);
  }

  public emissionSubmited(emission: any): void {
    this._onEmissionSubmited.next({internalId: 1});
  }

  public emissionConfirmed(emission: any): void {
    this._onEmissionConfirmed.next(emission);
  }

  public emissionFailed(emission: any): void {
    this._onEmissionFailed.next({internalId: 1});
  }

  public emissionCanceled(internalId: number): void {
    this._onEmissionCanceled.next({internalId: 1});
  }

  // TRANSACTION (DIVIDENDS)

  public transactionAdded(amount: string): void {
    this._onTransactionAdded.next(amount);
  }

  public transactionSubmited(transaction: any): void {
    this._onTransactionSubmited.next({internalId: 1});
  }

  public transactionConfirmed(transaction: any): void {
    this._onTransactionConfirmed.next(transaction);
  }

  public transactionFailed(transaction: any): void {
    this._onTransactionFailed.next({internalId: 1});
  }

  public transactionCanceled(internalId: number): void {
    this._onTransactionCanceled.next({internalId: 1});
  }

  // CLIPBOARD

  public copyToClipboard(title?: string): void {
    this._onCopyToClipboard.next(title);
  }

  //#endregion

  //#region Methods to subscribe on events

  // EMISSION (TOKENS)

  public onEmissionAdded(): Observable<number>  {
    return this.onEmissionAddedSource;
  }

  public onEmissionSubmited(): Observable <ConfirmationResponse> {
    return this.onEmissionSubmitedSource;
  }

  public onEmissionConfirmed(): Observable <ConfirmationResponse> {
    return this.onEmissionConfirmedSource;
  }

  public onEmissionFailed(): Observable <ConfirmationResponse> {
    return this.onEmissionFailedSource;
  }

  public onEmissionCanceled(): Observable <ConfirmationResponse> {
    return this.onEmissionCanceledSource;
  }

  // TRANSSFER (TOKENS)

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

  // TRANSACTION (DIVIDENDS)

  public onTransactionAdded(): Observable<number>  {
    return this.onTransactionAddedSource;
  }

  public onTransactionSubmited(): Observable <ConfirmationResponse> {
    return this.onTransactionSubmitedSource;
  }

  public onTransactionConfirmed(): Observable <ConfirmationResponse> {
    return this.onTransactionConfirmedSource;
  }

  public onTransactionFailed(): Observable <ConfirmationResponse> {
    return this.onTransactionFailedSource;
  }

  public onTransactionCanceled(): Observable <ConfirmationResponse> {
    return this.onTransactionCanceledSource;
  }

  // CLIPBOARD

  public onCopyToClipboard(): Observable <string> {
    return this.onCopyToClipboardSource;
  }

  //#endregion

}
