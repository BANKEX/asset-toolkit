import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UIService {
  /**
  * Service for basic UI events broadcasting
  */
  private _onDetailsClicked: Subject<any> = new Subject();
  private onDetailsClickedSource = this._onDetailsClicked.asObservable().share<any>();

  public detailsClicked() {
    this._onDetailsClicked.next(true);
  }

  public onDetailsClicked(): Observable<boolean> {
    return this.onDetailsClickedSource;
  }
}
