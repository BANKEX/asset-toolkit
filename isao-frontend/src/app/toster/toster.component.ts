import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IsaoService } from '../core/isao.service';
import { NeatComponent } from '../shared/common';
import 'hammerjs';
import { Stage } from '../core/types';
import { StageService, EventService } from '../core';
import { ToastyService } from 'ng2-toasty';
import { ConfirmationResponse } from '../shared/types';
import { TokenType } from '../core/types/contract-type.enum';
import { TransferContent } from '../shared/types/transfer-content.enum';

@Component({
  selector: 'isao-toster-message',
  templateUrl: './toster.component.pug',
})
export class TosterComponent implements OnInit {

  public ready = true;

  constructor(
    public $isao: IsaoService,
    public $stage: StageService,
    private $events: EventService,
    private $toasty: ToastyService,
  ) {
    this.listenForEvents();
  }
  public ngOnInit() {
  }

  private listenForEvents() {


    // Deployment

    this.$events.onDeployAdded().subscribe((type: TokenType) => {
      this.$toasty.warning({
        title: `Confirmation required.`,
        msg: `Starting deployment of ISAO contract with ${type === TokenType.ERC20 ? 'new ERC20 token' : 'multitoken'} connected.`
      });
    });
    this.$events.onDeployCanceled().subscribe((type: TokenType) => {
      this.$toasty.error({msg: `Deployment canceled by user.`, title: `Failed!`});
    });
    this.$events.onDeploySubmited().subscribe((hash) => {
      this.$toasty.warning({
        title: `Deployment submited.`,
        msg: `Please whait few minutes for confirmation.`
      });
    });
    this.$events.onDeployConfirmed().subscribe((hash) => {
      this.$toasty.success({msg: `ISAO contract deployed.` , title: `Success!`});
    });
    this.$events.onDeployFailed().subscribe(({msg, hash}) => {
      this.$toasty.error({msg: 'Please check the error message in browser console.', title: `Failed!`});
      console.info(`Failed transaction hash: ${hash}`);
    });

    // Transfer

    this.$events.onTransferAdded().subscribe((tx) => {
      let target = this.getTarget(tx);
      this.$toasty.warning({
        title: `Confirmation required.`,
        msg: `Starting transfer ${(tx.amount ? 'of ' + tx.amount : '') + target }`
      });
    });
    this.$events.onTransferCanceled().subscribe((transfer: ConfirmationResponse) => {
      this.$toasty.error({msg: `Transfer canceled by user.`, title: `Failed!`});
    });
    this.$events.onTransferSubmited().subscribe((transfer: ConfirmationResponse) => {
      this.$toasty.warning({
        title: `Transfer submited.`,
        msg: `Please whait few minutes for confirmation.`
      });
    });
    this.$events.onTransferConfirmed().subscribe((transfer: ConfirmationResponse) => {
      this.$toasty.success({msg: `Transfer compleded. Wait a few seconds until the data is updated.` , title: `Success!`});
    });
    this.$events.onTransferFailed().subscribe(({msg, transfer}) => {
      this.$toasty.error({msg: 'Please check the error message in browser console.', title: `Failed!`});
      console.info(`Failed transaction hash: ${transfer.hash}`);
    });

    // Clipboard
    this.$events.onCopyToClipboard().subscribe((title) => {
      this.$toasty.info(`${title ? title : 'Address'} copied to clipboard`);
    });
    // Connection
    this.$events.onConnectedToBlockchain().subscribe((title) => {
      this.$toasty.success(`${title ? title : 'Connected to blockchain'}`);
    });

    //#endregion
  }

  private getTarget(tx: ConfirmationResponse) {
    if (tx.type === TransferContent.ETHER) {
      return ' ETH';
    } else if (tx.type === TransferContent.TOKEN) {
      return ' token';
    } else {
      return ' ...';
    }
  }

}
