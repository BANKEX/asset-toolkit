import { Component, OnInit } from '@angular/core';
import { IsaoService } from '../core/isao.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'isao-raising',
  templateUrl: './raising.component.pug',
})
export class RaisingComponent implements OnInit {

  public buyTokens = this.$isao.buyTokens.bind(this.$isao);
  public str;
  public hasTokens: Observable<boolean>;
  public isInitialized: Observable<boolean>;
  public oldValue;

  public constructor(public $isao: IsaoService) {
    this.hasTokens = this.$isao.tokensOrderedByUser.map( x => x > 0);
    this.isInitialized = this.$isao.tokensOrderedByUser.map( x => x !== undefined);
  }

  ngOnInit(): void { }
}
