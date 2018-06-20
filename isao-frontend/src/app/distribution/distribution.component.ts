import { Component, OnInit } from '@angular/core';
import { IsaoService } from '../core/isao.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'isao-distribution',
  templateUrl: './distribution.component.pug',
})
export class DistributionComponent implements OnInit {

  public receiveTokens = this.$isao.receiveTokens.bind(this.$isao);
  public str;
  public hasTokens: Observable<boolean>;
  public isInitialized: Observable<boolean>;

  public constructor(public $isao: IsaoService) {
    this.hasTokens = this.$isao.tokensOrderedByUser.map( x => x > 0);
    this.isInitialized = this.$isao.tokensOrderedByUser.map( x => x !== undefined);
  }

  ngOnInit(): void { }
}
