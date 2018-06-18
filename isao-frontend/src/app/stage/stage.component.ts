import { Component, OnInit } from '@angular/core';
import { StageService } from '../core/stage.service';
import { Stage } from '../core/types';

@Component({
  selector: 'isao-stage',
  templateUrl: './stage.component.pug',
})
export class StageComponent implements OnInit {

  public stage: Stage;
  public Stage = Stage;

  constructor(
    private $stage: StageService
  ) {
    $stage.subscribe(_stage => this.stage = _stage);
  }

  ngOnInit(): void { }
}
