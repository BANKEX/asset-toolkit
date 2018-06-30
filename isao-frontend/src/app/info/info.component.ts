import { Component, OnInit } from '@angular/core';
import { IsaoService } from '../core/isao.service';
import 'hammerjs';

@Component({
  selector: 'isao-info',
  templateUrl: './info.component.pug',
})
export class InfoComponent implements OnInit {


  constructor(
    public $isao: IsaoService
  ) { }

  ngOnInit(): void { }
}
