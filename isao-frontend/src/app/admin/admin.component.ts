import { Component, OnInit } from '@angular/core';
import { StageService, AdminService } from '../core';
import { Connection, Stage } from '../core/types';
import { IsaoService } from '../core/isao.service';

@Component({
  selector: 'isao-admin',
  templateUrl: './admin.component.pug',
})
export class AdminComponent implements OnInit {

  public Stage = Stage;
  public connectToken = this.$admin.connectToken.bind(this.$admin);
  public incTimestamp = this.$admin.incTimestamp.bind(this.$admin);

  public constructor(
    public $stage: StageService,
    public $admin: AdminService,
    public $isao: IsaoService,
  ) {
    $stage.subscribe(stage => {

    });
  }

  public ngOnInit(): void { }


}
