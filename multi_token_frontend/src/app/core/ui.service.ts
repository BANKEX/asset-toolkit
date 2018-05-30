import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Token, OperationType } from '../shared/types';

@Injectable()
export class UIService {
  /**
  * Service for basic UI events broadcasting
  */
  private _onDetailsClicked: Subject<{token: Token, details: OperationType}> = new Subject();
  private onDetailsClickedSource = this._onDetailsClicked.asObservable().share<any>();

  public detailsClicked(token: Token, details: OperationType) {
    this._onDetailsClicked.next({token, details});
  }

  public onDetailsClicked(): Observable<{token: Token, details: OperationType}> {
    return this.onDetailsClickedSource;
  }
}
