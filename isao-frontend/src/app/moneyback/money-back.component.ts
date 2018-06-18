import { Component, OnInit } from '@angular/core';
import { IsaoService } from '../core/isao.service';

@Component({
  selector: 'isao-money-back',
  templateUrl: './money-back.component.pug',
})
export class MoneyBackComponent implements OnInit {

  public refundTokens = this.$isao.refundTokens.bind(this.$isao);
  public str;

  public constructor(
    public $isao: IsaoService,
  ) { }

  ngOnInit(): void { }
}
