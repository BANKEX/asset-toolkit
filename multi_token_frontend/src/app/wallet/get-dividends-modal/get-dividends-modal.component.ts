import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService, EventService, MultitokenService, ConnectionService } from '../../core';
import { LoadingOverlayService, ErrorMessageService } from '../../shared/services';
import { BigNumber } from 'bignumber.js';
import { to } from 'await-to-js';
import { NeatComponent } from '../../shared/common/index';

@Component({
  selector: 'mt-get-dividends-modal',
  templateUrl: 'get-dividends-modal.component.pug',
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

export class GetDividendsModalComponent implements AfterViewInit, OnInit{

  @Input() public tokenKey: number;
  @Input() public amount: string;
  @Output() public transferred: EventEmitter<string> = new EventEmitter<string>();
  @ViewChildren('value') public value;

  public form: FormGroup;
  public tokens: any;
  public objectKeys = Object.keys;
  public toBN: any;

  constructor(
    private $activeModal: NgbActiveModal,
    // private $cdr: ChangeDetectorRef,
    private $connection: ConnectionService,
    private $events: EventService,
    private $error: ErrorMessageService,
    private $fb: FormBuilder,
    private $form: FormService,
    private $overlay: LoadingOverlayService,
    private $mt: MultitokenService,
  ) {
  }
  // get token() { return this.form.get('tokenKey'); }
  // get amount() { return this.form.get('amount'); }

  public ngOnInit() {
    this.toBN = this.$connection.web3.utils.toBN;
    this.initForm();
    this.$mt.tokens.take(1).subscribe(_tokens => {
      this.tokens = _tokens;
      this.form.controls['tokenKey'].setValue(this.objectKeys(_tokens)[0], {onlySelf: true});
      // this.$cdr.detectChanges();
    })
  }

  ngAfterViewInit() {
    // this.value.first.nativeElement.focus();
  }

  public async getDividends(_tokenKey?, _amount?) {
    let err, result;
    const amount = _amount ? _amount : this.form.value.amount;
    const tokenType = _tokenKey ? _tokenKey : this.form.value.tokenKey;
    const amountBN = this.$form.toWei(amount);
    this.$events.transferAdded(amount);
    this.$overlay.showOverlay(true);
    try {
      // Object.setPrototypeOf(this.transaction, new PlasmaDepositImp());
      // if (amountBN.eq(this.transaction.bn)) {
        // const balance = await this.$mt.getTokenBalance(this.transaction.key);
      const event = this.$mt.withdrawDividends(this.toBN(tokenType), this.toBN(amount));
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

  public fromWei(value) {
    return this.$form.fromWei(value);
  }

  private initForm() {
    this.form = this.$fb.group({
      amount: [this.amount ? this.amount : '1', [
        Validators.required,
        Validators.min(0.001),
        Validators.pattern(/^\d+(\.\d+)?$/)]
      ],
      tokenKey: [this.tokenKey ? +this.tokenKey : '', [
        Validators.required,
      ]
    ]});
  }
}
