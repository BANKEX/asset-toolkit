import { Component, AfterViewInit } from '@angular/core';
import { Connection } from './shared/types';
import { ConnectionService, EventService } from './core';
import { LoadingOverlayService } from './shared/services';
import { Observable } from 'rxjs/Observable';
import { ToastyService } from 'ng2-toasty';
import { NeatComponent } from './shared/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.pug',
})
export class AppComponent extends NeatComponent implements AfterViewInit {

  public clientAddress: string;
  public contractAddress: string;

  public constructor(
    private $connection: ConnectionService,
    private $overlay: LoadingOverlayService,
    private $events: EventService,
    private $toasty: ToastyService,
  ) {
    super();
    $connection.subscribe((state: Connection) => {
      if (state === Connection.Estableshed) {
        $overlay.hideOverlay();
        this.clientAddress = $connection.account;
        this.contractAddress = $connection.contractData.address;
        this.$toasty.success('Connected to blockchain.');
        this.listenForEvents();
      }
    })
  }

  public ngAfterViewInit() {
    this.$overlay.showOverlay();
    Observable.timer(1000).subscribe(() => {
      this.$overlay.hideOverlay();
    });
  }

  private listenForEvents() {
    this.$events.onTransferAdded().takeUntil(this.ngUnsubscribe).subscribe((amount) => {
      this.$toasty.warning(`Starting transaction of ${amount} token(s). </br> Please submit it in Metamask.`)
    });
    this.$events.onTransferSubmited().takeUntil(this.ngUnsubscribe).subscribe((deposit) => {
      this.$toasty.warning(`Transfer submited! </br> Whait a bit for confirmation...`)
    });
    this.$events.onTransferConfirmed().takeUntil(this.ngUnsubscribe).subscribe((deposit) => {
      this.$toasty.success(`Transfer successful!`)
    });
    this.$events.onTransferCanceled().takeUntil(this.ngUnsubscribe).subscribe((deposit) => {
      this.$toasty.error(`Transfer canceled by user.`)
    });
    this.$events.onTransferFailed().takeUntil(this.ngUnsubscribe).subscribe((deposit) => {
      this.$toasty.error(`Transfer failed!`)
    });
  }
}
