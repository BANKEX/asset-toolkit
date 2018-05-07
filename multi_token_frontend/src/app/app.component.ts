import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Component, AfterViewInit } from '@angular/core';
import { Connection } from './shared/types';
import { ConnectionService, EventService, FormService, MultitokenService } from './core';
import { LoadingOverlayService, ErrorMessageService } from './shared/services';
import { Observable } from 'rxjs/Observable';
import { ToastyService } from 'ng2-toasty';
import { NeatComponent } from './shared/common';
import { SendDividendsModalComponent } from './wallet/send-dividends-modal/send-dividends-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.pug',
})
export class AppComponent extends NeatComponent implements AfterViewInit {

  public clientAddress: string;
  public ownerAddress: string;
  public contractAddress: string;

  public constructor(
    private $connection: ConnectionService,
    private $events: EventService,
    private $error: ErrorMessageService,
    private $form: FormService,
    private $modal: NgbModal,
    private $mt: MultitokenService,
    private $overlay: LoadingOverlayService,
    private $route: ActivatedRoute,
    private $router: Router,
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
        this.$mt.getOwner().then(address => this.ownerAddress = address)
          .catch(e => $error.addError('Check if you entered it right', 'Wrong contract address', ));
      }
    })
  }

  public ngAfterViewInit() {
    this.$overlay.showOverlay();
      if (window.location.href.indexOf('contract=0x') === -1) {
        this.connect();
      } else {
        this.$route.queryParams.skip(1).take(1).subscribe(params => {
          this.connect(params.contract);
        })
      }
    Observable.timer(1000).subscribe(() => {
      this.$overlay.hideOverlay();
    });
  }

  public showDividendsModal() {
    let modalInstance;
    modalInstance =	this.$modal.open(
      SendDividendsModalComponent,
      {
        size: 'lg',
        windowClass: 'modal-margin-lg'
      }).componentInstance;
  }

  private connect(contract?: string) {
    this.$connection.connect(contract || undefined); // this  will change value of this.$connection.contractData.address
    this.$router.navigate(['../'], { queryParams: {contract: this.$connection.contractData.address}});
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
