import { Component, OnInit } from '@angular/core';
import { IsaoService } from '../core/isao.service';

@Component({
  selector: 'isao-raising',
  templateUrl: './raising.component.pug',
})
export class RaisingComponent implements OnInit {

  public buyTokens = this.$isao.buyTokens.bind(this.$isao);

  public constructor(
    public $isao: IsaoService
  ) { }

  ngOnInit(): void { }
}
