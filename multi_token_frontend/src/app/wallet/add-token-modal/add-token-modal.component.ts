import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService, EventService, MultitokenService, ConnectionService } from '../../core';
import { LoadingOverlayService, ErrorMessageService } from '../../shared/services';
import { BigNumber } from 'bignumber.js';
import { to } from 'await-to-js';
import { NeatComponent } from '../../shared/common/index';

@Component({
  selector: 'mt-add-token-modal',
  templateUrl: 'add-token-modal.component.pug',
})

export class AddTokenModalComponent implements AfterViewInit, OnInit {

  @Output() public added: EventEmitter<string> = new EventEmitter<string>();
  @ViewChildren('focus') public focus;

  public form: FormGroup;
  public tokenKey: any;
  public tokens: any;
  public objectKeys = Object.keys;
  public toBN: any;

  constructor(
    private $activeModal: NgbActiveModal,
    private $cdr: ChangeDetectorRef,
    private $connection: ConnectionService,
    private $events: EventService,
    private $error: ErrorMessageService,
    private $fb: FormBuilder,
    private $form: FormService,
    private $overlay: LoadingOverlayService,
    private $mt: MultitokenService,
  ) {
  }
  get token() { return this.form.get('tokenKey'); }
  get amount() { return this.form.get('amount'); }

  public ngOnInit() {
    this.toBN = this.$connection.web3.utils.toBN;
    this.initForm();
    // this.$mt.tokens.take(1).subscribe(_tokens => {
    //   this.tokens = _tokens;
    //   this.form.controls['tokenKey'].setValue(this.objectKeys(_tokens)[0], {onlySelf: true});
    //   this.$cdr.detectChanges();
    //
    // })
  }

  ngAfterViewInit() {
    this.focus.first.nativeElement.focus();
  }

  public async createToken() {
    let err, result;
    const amount = this.form.value.amount;
    const tokenType = this.form.value.tokenKey;
    const amountBN = this.$form.toWei(amount);
    this.$events.transferAdded(amount);
    this.$overlay.showOverlay(true);
    try {
      // Object.setPrototypeOf(this.transaction, new PlasmaDepositImp());
      // if (amountBN.eq(this.transaction.bn)) {
        // const balance = await this.$mt.getTokenBalance(this.transaction.key);
      const event = this.$mt.initSubTokens(this.toBN(tokenType), this.toBN(amount));
      event.on('transactionHash', (hash) => {
        this.$activeModal.close();
        this.$overlay.hideOverlay();
        this.$events.transferSubmited(null);
      });
      [err, result] = await to(event);
      // }
      if (err) {
        if (err.message.indexOf('User denied') > 0) {
          this.$events.transferCanceled(undefined);
        } else {
          this.$events.transferFailed(undefined);
        }
      } else {
        this.closeModal();
        this.$events.transferConfirmed(undefined);
        this.added.emit();
      }
      this.$overlay.hideOverlay();

    } catch (err) {
      alert('OH NO!!!!');
      console.error(err);
    }
  }

  public closeModal() {
    this.$activeModal.close();
  }

  private initForm() {
    this.form = this.$fb.group({
      amount: ['', [
        Validators.required,
        Validators.min(1),
        Validators.pattern(/^\d/)]
      ],
      tokenKey: ['', [
        Validators.required,
        Validators.pattern(/^\d/)
      ]
    ]});
  }
}
