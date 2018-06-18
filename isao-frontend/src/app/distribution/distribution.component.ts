import { Component, OnInit } from '@angular/core';
import { IsaoService } from '../core/isao.service';

@Component({
  selector: 'isao-distribution',
  templateUrl: './distribution.component.pug',
})
export class DistributionComponent implements OnInit {

  public receiveTokens = this.$isao.receiveTokens.bind(this.$isao);
  public str;

  public constructor(
    public $isao: IsaoService
  ) { }

  ngOnInit(): void { }
}
