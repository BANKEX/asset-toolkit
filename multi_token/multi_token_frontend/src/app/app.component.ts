import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Component, AfterViewInit, Inject } from '@angular/core';
import { Connection } from './shared/types';
import { ConnectionService, EventService, FormService, MultitokenService } from './core';
import { LoadingOverlayService, ErrorMessageService } from './shared/services';
import { Observable } from 'rxjs/Observable';
import { ToastyService } from 'ng2-toasty';
import { NeatComponent } from './shared/common';
import { ClipboardService } from 'ngx-clipboard';
import { SendDividendsModalComponent } from './wallet/send-dividends-modal/send-dividends-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.pug',
})
export class AppComponent extends NeatComponent implements AfterViewInit {

  public clientAddress: string;
  public contractAddress: string;

  public constructor(
    @Inject('AppConfig') private $config,
    private $connection: ConnectionService,
    private $clipboard: ClipboardService,
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
        this.clientAddress = $connection.account.toLowerCase();
        this.contractAddress = $connection.contract.options.address.toLowerCase();
        this.$toasty.success('Connected to blockchain.');
        this.listenForEvents();
        this.$router.navigate(['../'], { queryParams: {contract: this.contractAddress}});
      }
    })
  }

  public ngAfterViewInit() {
    this.$overlay.showOverlay();
      if (window.location.href.indexOf('contract=0x') === -1) {
        this.connect();
      } else {
        this.$route.queryParams.skip(1).take(1).subscribe(params => {
          // Prevent old contract loading on network change
          if (this.$config.contracts.map(item => item.toUpperCase()).indexOf(params.contract.toUpperCase()) === -1) {
            this.connect(params.contract);
          } else {
            this.connect();
          }
        })
      }
  }

  public copyToClipboard(_text) {
    this.$clipboard.copyFromContent(_text);
    this.$events.copyToClipboard();
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
    this.$connection.connect(contract || undefined);
  }

  //#region EVENTS

  private listenForEvents() {

    // DIVIDENDS TRANSACTION

    this.$events.onTransactionAdded().takeUntil(this.ngUnsubscribe).subscribe((amount) => {
      this.$toasty.warning(`Starting dividends transaction of ${amount} ETH. </br> Please submit it in Metamask.`)
    });
    this.$events.onTransactionSubmited().takeUntil(this.ngUnsubscribe).subscribe((transaction) => {
      this.$toasty.warning(`Transaction submited! </br> Whait few minutes for confirmation...`)
    });
    this.$events.onTransactionConfirmed().takeUntil(this.ngUnsubscribe).subscribe((transaction) => {
      this.$toasty.success(`Transaction successful!`)
    });
    this.$events.onTransactionCanceled().takeUntil(this.ngUnsubscribe).subscribe((transaction) => {
      this.$toasty.error(`Transaction canceled by user.`)
    });
    this.$events.onTransactionFailed().takeUntil(this.ngUnsubscribe).subscribe((transaction) => {
      this.$toasty.error(`Transaction failed!`)
    });

    // TOKEN TRANSFERS

    this.$events.onTransferAdded().takeUntil(this.ngUnsubscribe).subscribe((amount) => {
      this.$toasty.warning(`Starting transfer of ${amount} token(s). </br> Please submit it in Metamask.`)
    });
    this.$events.onTransferSubmited().takeUntil(this.ngUnsubscribe).subscribe((transfer) => {
      this.$toasty.warning(`Transfer submited! </br> Whait few minutes for confirmation...`)
    });
    this.$events.onTransferConfirmed().takeUntil(this.ngUnsubscribe).subscribe((transfer) => {
      this.$toasty.success(`Transfer successful!`)
    });
    this.$events.onTransferCanceled().takeUntil(this.ngUnsubscribe).subscribe((transfer) => {
      this.$toasty.error(`Transfer canceled by user.`)
    });
    this.$events.onTransferFailed().takeUntil(this.ngUnsubscribe).subscribe((transfer) => {
      this.$toasty.error(`Transfer failed!`)
    });

    // TOKEN EMISSION

    this.$events.onEmissionAdded().takeUntil(this.ngUnsubscribe).subscribe((amount) => {
      this.$toasty.warning(`Starting creation of ${amount} token. </br> Please submit it in Metamask.`)
    });
    this.$events.onEmissionSubmited().takeUntil(this.ngUnsubscribe).subscribe((emission) => {
      this.$toasty.warning(`Token emission submited! </br> Whait few minutes for confirmation...`)
    });
    this.$events.onEmissionConfirmed().takeUntil(this.ngUnsubscribe).subscribe((emission) => {
      this.$toasty.success(`New token emitted successfully!`)
    });
    this.$events.onEmissionCanceled().takeUntil(this.ngUnsubscribe).subscribe((emission) => {
      this.$toasty.error(`Emission canceled by user.`)
    });
    this.$events.onEmissionFailed().takeUntil(this.ngUnsubscribe).subscribe((emission) => {
      this.$toasty.error(`Token creation failed!`)
    });

    // CLIPBOARD

    this.$events.onCopyToClipboard().takeUntil(this.ngUnsubscribe).subscribe((title) => {
      this.$toasty.info(`${title ? title : 'Address'} copied to clipboard`)
    });

    //#endregion
  }
}
