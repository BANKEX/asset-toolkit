import { Component, OnInit } from '@angular/core';
import { IsaoService } from '../core/isao.service';
import 'hammerjs';

@Component({
  selector: 'isao-info',
  templateUrl: './info.component.pug',
})
export class InfoComponent implements OnInit {

  public ready;
  public limits: number[] = [];
  public costs: string[] = [];
  public minimal: number[] = [];

  constructor(
    public $isao: IsaoService
  ) {
    $isao.stairs.subscribe(stairs => {
      const keys = Object.keys(stairs);
      keys.forEach((key, index) => {
        this.limits[index] = Number(key);
        this.costs[index] = stairs[key] + ' ETH';
        this.minimal[index] = $isao.minimalFundSize;
      })
      this.ready = true;
    })
  }
  ngOnInit(): void { }
}
