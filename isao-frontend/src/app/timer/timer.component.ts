import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IsaoService } from '../core/isao.service';
import { NeatComponent } from '../shared/common';
import 'hammerjs';
import { Stage } from '../core/types';
import { StageService } from '../core';

@Component({
  selector: 'isao-timer',
  templateUrl: './timer.component.pug',
})
export class TimerComponent extends NeatComponent implements OnInit {

  public ready = false;
  public series: any[];
  public currentTime: Date;
  public launchTime: Date;
  public stage: Stage;
  public passed: number;  // time passed in percents
  public left: number;    // time left in milliseconds
  public value: number;   // value for gauge
  public range: number;   // period of current stage
  public Math = Math;

  constructor(
    public $isao: IsaoService,
    public $stage: StageService,
  ) {
    super();
    $stage.take(1).subscribe(_stage => this.stage = _stage);

    // TODO: cleanup no need NeatComponent here
    $isao.currentTime.takeUntil(this.ngUnsubscribe).subscribe(time => {
      if (!this.stage) { console.error('No stage info yet!'); return; }
      this.ready = false;
      this.launchTime = this.$isao.launchTime;
      this.currentTime = time;
      this.range = this.stage === Stage.RAISING ? $isao.rPeriod * 1000 : $isao.dPeriod * 1000;
      this.passed = this.currentTime.getTime() - this.launchTime.getTime();
      this.left = this.launchTime.getTime() + this.range - this.currentTime.getTime();
      this.value = Math.floor(100 * this.passed / this.range);
      console.log(this.value);
      this.ready = true;
    });
  }

  ngOnInit() {
    this.$isao.getCurrentTime();
  }

  public dateFromTimestamp(timestamp) {
    const date = new Date();
    date.setTime(timestamp);
    return date;
  }
}
