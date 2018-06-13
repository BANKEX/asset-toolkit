import { Component, OnInit } from '@angular/core';
import { StageService, AdminService } from '../core';
import { Connection, Stage } from '../core/types';

@Component({
  selector: 'isao-admin',
  templateUrl: './admin.component.pug',
})
export class AdminComponent implements OnInit {

  public Stage = Stage;

  public constructor(
    public $stage: StageService,
    private $admin: AdminService,
  ) {
    $stage.subscribe(stage => {

    })
  }

  public ngOnInit(): void { }

  public startFunding() {

  }
}
