import { Injectable, Inject } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Operation } from '../shared/types';
import { TokenService } from './token.service';

@Injectable()
export class TransactionService extends Subject<Operation> {
  /**
   * Service to provide all dividend transactions
   * Needs TokenService to get tokens from
   */

  private tokenSubscription: Subscription;

  public constructor(
    @Inject('AppConfig') private $config,
    $token: TokenService,
  ) {
    super();
    this.tokenSubscription = $token.pipe(

    ).subscribe();
  }
}
