import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Stage, Connection } from './types';
import { ConnectionService } from './connection.service';
import to from 'await-to-js';
import { Observable } from 'rxjs';

@Injectable()
export class StageService extends BehaviorSubject<Stage> {
  /**
   * Service for managing Application Stages
   */
  constructor (
    @Inject('AppConfig') private $config,
    private $connection: ConnectionService
  ) {
    super(Stage.DEFAULT);
    $connection.subscribe(async(state: Connection) => {
      if (state === Connection.Estableshed) {
        Observable
          .interval($config.intervals.stageFetch || 1000)
          .startWith(0)
          .switchMap(() => Observable.fromPromise(this.getStateValue()))
          .subscribe(stage => this.next(stage));
      }
    })
  }

  private async getStateValue() {
    const [err, stage] = await to(this.$connection.contract.methods.getState().call());
    return +stage;
  }
}
