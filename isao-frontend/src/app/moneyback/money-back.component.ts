import { Component, OnInit } from '@angular/core';
import { IsaoService } from '../core/isao.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'isao-money-back',
  templateUrl: './money-back.component.pug',
})
export class MoneyBackComponent {
  public str: string;
  hasTokens$: Observable<boolean>;
  isInitialized$: Observable<boolean>;

  constructor(public $isao: IsaoService) {
    this.hasTokens$ = this.$isao.tokensOrderedByUser.map( x => x > 0);
    this.isInitialized$ = this.$isao.tokensOrderedByUser.map( x => x !== undefined);
  }
}
