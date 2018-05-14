import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService, EventService, MultitokenService, ConnectionService } from '../../core';
import { LoadingOverlayService, ErrorMessageService } from '../../shared/services';
import { BigNumber } from 'bignumber.js';
import { to } from 'await-to-js';
import { NeatComponent } from '../../shared/common/index';

@Component({
  selector: 'mt-send-dividends-modal',
  templateUrl: 'send-dividends-modal.component.pug',
  styles: [`
    select.tokens {
      display: inline;
      vertical-align: initial;
      font-size: 18px;
      cursor: pointer;
      margin-left: 10px !important;
    }
  `]
})

export class SendDividendsModalComponent implements AfterViewInit, OnInit {

  @Input() public tokenKey: number;
  @Output() public transferred: EventEmitter<string> = new EventEmitter<string>();
  @ViewChildren('focus') public focus;

  public amountMin = 0;
  public form: FormGroup;
  public initialDataReady = false;
  public objectKeys = Object.keys;
  public toBN: any;
  public tokens: string[] = [];

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
    this.$mt.getAllInitedTokenIds().then(_ids => {
      this.initialDataReady = true;
      this.tokens = _ids;
      this.initForm();
    });
  }

  ngAfterViewInit() {
  }

  public async sendDividends() {
    let err, result;
    const amount = this.form.value.amount;
    const tokenType = this.$form.remove0x(this.form.value.tokenKey);
    const amountBN = this.$form.toWei(amount);
    this.$events.transactionAdded(amount);
    this.$overlay.showOverlay(true);
    try {
      const event = this.$mt.acceptDividends(this.toBN(tokenType), amountBN);
      event.on('transactionHash', (hash) => {
        this.$activeModal.close();
        this.$overlay.hideOverlay();
        this.$events.transactionSubmited(null);
      });
      [err, result] = await to(event);
      // }
      if (err) {
        if (err.message.indexOf('User denied') > 0) {
          this.$events.transactionCanceled(undefined);
        } else {
          this.$events.transactionFailed(undefined);
        }
      } else {
        this.closeModal();
        this.$events.transactionConfirmed(undefined);
        this.transferred.emit(amount);
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
      tokenKey: [this.tokenKey ? this.$form.add0x(this.tokenKey) : '', [
        Validators.required,
        Validators.pattern(/^0x[1-9](\d+)?$/m),
        this.$form.tokenExistsValidator(this.tokens)
      ]],
      amount: ['', [
        Validators.required,
        Validators.min(this.amountMin),
        this.$form.forbiddenValidator('0'),
        Validators.pattern(/(^\d+(\.\d+)?$)/)]
      ]
    });
    setTimeout(() => { this.focus.first.nativeElement.focus(); }, 100)
  }
}
