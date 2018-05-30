import { BigNumber } from 'bignumber.js';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService, EventService, MultitokenService, ConnectionService } from '../../core';
import { LoadingOverlayService, ErrorMessageService } from '../../shared/services';
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
  @Input() public avalable: BigNumber;
  @Output() public transferred: EventEmitter<string> = new EventEmitter<string>();
  @ViewChildren('focus') public focus;

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
  get amount() { return this.form.get('amount'); }

  public ngOnInit() {
    this.toBN = this.$connection.web3.utils.toBN;
    this.initForm();
    // this.$mt.tokens.take(1).subscribe(_tokens => {
    //   this.tokens = _tokens;
    //   this.form.controls['tokenKey'].setValue(this.objectKeys(_tokens)[0], {onlySelf: true});
    //   // this.$cdr.detectChanges();
    // })
  }

  ngAfterViewInit() {
    this.focus.first.nativeElement.focus();
  }

  public async getDividends(_tokenKey?, _amount?) {
    let err, result;
    const amount = _amount ? this.toBN(_amount) : this.$form.toWei(this.form.value.amount);
    this.$events.transactionAdded(this.form.value.amount);
    this.$overlay.showOverlay(true);
    try {
      const event = this.$mt.withdrawDividends(this.toBN(this.tokenKey), amount);
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

  public fromWei(value) {
    return this.$form.fromWei(value);
  }

  private initForm() {
    this.form = this.$fb.group({
      amount: [this.avalable ? this.avalable.toNumber() : '', [
        Validators.required,
        Validators.min(0),
        Validators.max(this.avalable.toNumber()),
        this.$form.forbiddenValidator('0'),
        Validators.pattern(/(^\d+(\.\d+)?$)/)]
      ]
    });
  }
}
