import { Component, OnInit } from '@angular/core';
import { IsaoService } from '../core/isao.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'isao-money-back',
  templateUrl: './money-back.component.pug',
})
export class MoneyBackComponent {
  tokens$ = this.$isao.tokensOrderedByUser.publishReplay(1).refCount();
  hasTokens$ = this.tokens$.startWith(false).map( x => x > 0);
  isInitialized$ = Observable.concat(
    Observable.of(false),
    this.tokens$.map(x => true)
  );

  constructor(public $isao: IsaoService) {
  }
}
