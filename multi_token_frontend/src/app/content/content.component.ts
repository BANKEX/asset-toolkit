import { Component, OnInit } from '@angular/core';
import { ConnectionService } from '../core';
import { LoadingOverlayService } from '../shared/services';
import { Connection } from '../shared/types';

@Component({
  selector: 'mt-content',
  templateUrl: './content.component.pug',
})
export class ContentComponent implements OnInit {

  ngOnInit(): void { }
}
