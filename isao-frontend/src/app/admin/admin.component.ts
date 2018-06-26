import { Component, OnInit } from '@angular/core';
import { StageService, AdminService, ConnectionService } from '../core';
import { Connection, Stage } from '../core/types';
import { IsaoService } from '../core/isao.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'isao-admin',
  templateUrl: './admin.component.pug',
})
export class AdminComponent {

  public Stage = Stage;
  public connectToken = this.$admin.connectToken.bind(this.$admin);
  public incTimestamp = this.$admin.incTimestamp.bind(this.$admin);
  public timeLeft$: Observable<number>;

  public constructor(
    public $stage: StageService,
    public $admin: AdminService,
    public $isao: IsaoService,
    private $connection: ConnectionService,
  ) {

    this.timeLeft$ = $connection.switchMap((connection) => {
      this.$isao.getCurrentTime();
      return $isao.currentTime.map(time => {
        console.log(time);
        const range = $isao.dPeriod * 1000;
        const launchTime = this.$isao.launchTime;
        const timeLeft = launchTime.getTime() + range - time.getTime();
        return Math.floor(timeLeft / 3600000);
      });
    });

    $stage.subscribe(stage => {
    });
  }

}
