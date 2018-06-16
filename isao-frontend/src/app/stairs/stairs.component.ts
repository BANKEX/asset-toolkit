import { Component, OnInit } from '@angular/core';
import { IsaoService } from '../core/isao.service';
import { NeatComponent } from '../shared/common';
import 'hammerjs';

@Component({
  selector: 'isao-stairs',
  templateUrl: './stairs.component.pug',
})
export class StairsComponent extends NeatComponent implements OnInit {

  public ready = false;
  public limits: number[] = [];
  public costs: string[] = [];
  public minimal: number[] = [];
  public total: number[] = [];

  public series: any[];

  constructor(
    public $isao: IsaoService,
  ) {
    super();
    $isao.stairs.takeUntil(this.ngUnsubscribe).subscribe(stairs => {
      console.log('Subscribed to stairs...');
      Object.keys(stairs).forEach((key, index) => {
        this.limits[index] = Number(key);
        this.costs[index] = stairs[key] + ' ETH';
        this.minimal[index] = $isao.minimalFundSize;
      })
      this.redraw();
    })
    $isao.tokensOrdered.takeUntil(this.ngUnsubscribe).subscribe(_total => {
      if (this.limits.length === 0 || this.ready && _total === this.total[0]) { return } // skip redraw if nothig changed
      this.limits.forEach((key, index) => {
        this.total[index] = _total;
      })
      this.redraw();
    })
  }

  public ngOnInit(): void { }


  private redraw() {
    this.series = [{
      name: 'Funding stairs',
      data: this.limits
    }, {
      name: 'Minimum required',
      data: this.minimal
    }, {
      name: 'Total funded',
      data: this.total
    }]
    this.ready = true;
  }
}
