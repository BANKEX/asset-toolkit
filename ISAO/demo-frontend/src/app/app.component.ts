import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Component, AfterViewInit, Inject } from '@angular/core';
import { Connection, Stage } from './core/types';
import { ConnectionService, EventService, FormService, StageService } from './core';
import { LoadingOverlayService, ErrorMessageService } from './shared/services';
import { Observable } from 'rxjs/Observable';
import { ToastyService } from 'ng2-toasty';
import { NeatComponent } from './shared/common';
import { ClipboardService } from 'ngx-clipboard';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.pug',
})
export class AppComponent extends NeatComponent implements AfterViewInit {

  public clientAddress: string;
  public contractAddress: string;
  public Stage = Stage;

  public constructor(
    @Inject('AppConfig') private $config,
    private $connection: ConnectionService,
    private $clipboard: ClipboardService,
    private $error: ErrorMessageService,
    private $events: EventService,
    private $form: FormService,
    private $modal: NgbModal,
    private $overlay: LoadingOverlayService,
    private $route: ActivatedRoute,
    private $router: Router,
    public $stage: StageService,
  ) {
    super();
    $connection.subscribe((state: Connection) => {
      if (state === Connection.Estableshed) {
        $overlay.hideOverlay();
        this.clientAddress = $connection.account.toLowerCase();
        if ($connection.contract) {
          this.contractAddress = $connection.contract.options.address.toLowerCase();
          this.$events.connectedToBlockchain();
        } else {
          this.contractAddress = 'not set';
        }
        this.$router.navigate(['../'], { queryParams: {contract: this.contractAddress}});
      }
    });
  }

  public ngAfterViewInit() {
    this.$overlay.showOverlay();
      if (window.location.href.indexOf('contract=0x') === -1) {
        this.connect();
      } else {
        this.$route.queryParams.skip(1).take(1).subscribe(params => {
          // Prevent old contract loading on network change
          if (Object.keys(this.$config.contracts).map(key =>
                this.$config.contracts[key].toUpperCase().indexOf(params.contract.toUpperCase()) === -1)) {
            this.connect(params.contract);
          } else {
            this.connect();
          }
        });
      }
  }

  public copyToClipboard(_text) {
    this.$clipboard.copyFromContent(_text);
    this.$events.copyToClipboard();
  }

  private connect(contract?: string) {
    this.$connection.connect(contract || undefined);
  }

  //#region EVENTS

}
