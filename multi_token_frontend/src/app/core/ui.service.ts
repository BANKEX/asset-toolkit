import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Token } from '../shared/types';
import { Details } from '../shared/types/details.enum';

@Injectable()
export class UIService {
  /**
  * Service for basic UI events broadcasting
  */
  private _onDetailsClicked: Subject<{token: Token, details: Details}> = new Subject();
  private onDetailsClickedSource = this._onDetailsClicked.asObservable().share<any>();

  public detailsClicked(token: Token, details: Details) {
    this._onDetailsClicked.next({token, details});
  }

  public onDetailsClicked(): Observable<{token: Token, details: Details}> {
    return this.onDetailsClickedSource;
  }
}
