import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfirmationResponse } from '../shared/types';
import { TokenType } from './types/contract-type.enum';

@Injectable()
export class EventService {

  //#region Private event sources

  // Deploy

  private _onDeployAdded: Subject<TokenType> = new Subject<TokenType>();
  private onDeployAddedSource = this._onDeployAdded.asObservable().share<TokenType>();

  private _onDeployCanceled: Subject<TokenType> = new Subject<TokenType>();
  private onDeployCanceledSource = this._onDeployCanceled.asObservable().share<TokenType>();

  private _onDeploySubmited: Subject<String> = new Subject<String>();
  private onDeploySubmitedSource = this._onDeploySubmited.asObservable().share<String>();

  private _onDeployConfirmed: Subject<String> = new Subject<String>();
  private onDeployConfirmedSource = this._onDeployConfirmed.asObservable().share<String>();

  private _onDeployFailed: Subject<{msg: string, hash: string}> = new Subject<any>();
  private onDeployFailedSource = this._onDeployFailed.asObservable().share<{msg: string, hash: string}>();

  // Transfer

  private _onTransferAdded: Subject<any> = new Subject<any>();
  private onTransferAddedSource = this._onTransferAdded.asObservable().share<any>();

  private _onTransferCanceled: Subject<ConfirmationResponse> = new Subject<ConfirmationResponse>();
  private onTransferCanceledSource = this._onTransferCanceled.asObservable().share<ConfirmationResponse>();

  private _onTransferSubmited: Subject<ConfirmationResponse> = new Subject<ConfirmationResponse>();
  private onTransferSubmitedSource = this._onTransferSubmited.asObservable().share<ConfirmationResponse>();

  private _onTransferConfirmed: Subject<ConfirmationResponse> = new Subject<ConfirmationResponse>();
  private onTransferConfirmedSource = this._onTransferConfirmed.asObservable().share<ConfirmationResponse>();

  private _onTransferFailed: Subject<any> = new Subject<{msg: string, transfer: ConfirmationResponse}>();
  private onTransferFailedSource = this._onTransferFailed.asObservable().share<any>();

  // Clipboard

  private _onCopyToClipboard: Subject<string> = new Subject<string>();
  private onCopyToClipboardSource = this._onCopyToClipboard.asObservable().share<string>();

  // Connection

  private _onConnectedToBlockchain: Subject<string> = new Subject<string>();
  private onConnectedToBlockchainSource = this._onConnectedToBlockchain.asObservable().share<string>();

  //#endregion

  //#region Public Methods

  // DEPLOY CONTRACT

  public deployAdded(tokenType: TokenType) { this._onDeployAdded.next(tokenType); }
  public onDeployAdded(): Observable<TokenType> { return this.onDeployAddedSource; }

  public deployCanceled(tokenType: TokenType) { this._onDeployCanceled.next(tokenType); }
  public onDeployCanceled(): Observable <TokenType> { return this.onDeployCanceledSource; }

  public deploySubmited(hash: String) { this._onDeploySubmited.next(hash); }
  public onDeploySubmited(): Observable <String> { return this.onDeploySubmitedSource; }

  public deployConfirmed(hash: String) { this._onDeployConfirmed.next(hash); }
  public onDeployConfirmed(): Observable <String> { return this.onDeployConfirmedSource; }

  public deployFailed(msg: string, hash: string) { this._onDeployFailed.next({msg, hash}); }
  public onDeployFailed(): Observable <{msg: string, hash: string}> { return this.onDeployFailedSource; }

  // TOKEN TRANSACTION

  public transferAdded(transfer: ConfirmationResponse) { this._onTransferAdded.next(transfer); }
  public onTransferAdded(): Observable<ConfirmationResponse>  { return this.onTransferAddedSource; }

  public transferSubmited(transfer: ConfirmationResponse) { this._onTransferSubmited.next(transfer); }
  public onTransferSubmited(): Observable <ConfirmationResponse> { return this.onTransferSubmitedSource; }

  public transferConfirmed(transfer: ConfirmationResponse) { this._onTransferConfirmed.next(transfer); }
  public onTransferConfirmed(): Observable <ConfirmationResponse> { return this.onTransferConfirmedSource; }

  public transferFailed(msg: string, transfer: ConfirmationResponse) { this._onTransferFailed.next({msg, transfer}); }
  public onTransferFailed(): Observable <{msg: string, transfer: ConfirmationResponse}> { return this.onTransferFailedSource; }

  public transferCanceled(transfer: ConfirmationResponse) { this._onTransferCanceled.next(transfer); }
  public onTransferCanceled(): Observable <ConfirmationResponse> { return this.onTransferCanceledSource; }

  // CLIPBOARD

  public copyToClipboard(title?: string): void { this._onCopyToClipboard.next(title); }
  public onCopyToClipboard(): Observable <string> { return this.onCopyToClipboardSource; }

  // CONNECTION

  public connectedToBlockchain(title?: string): void { this._onConnectedToBlockchain.next(title); }
  public onConnectedToBlockchain(): Observable <string> { return this.onConnectedToBlockchainSource; }

  //#endregion
}
