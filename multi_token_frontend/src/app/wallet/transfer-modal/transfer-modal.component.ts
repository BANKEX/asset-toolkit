import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService, EventService, MultitokenService } from '../../core';
import { LoadingOverlayService, ErrorMessageService } from '../../shared/services';
import { BigNumber } from 'bignumber.js';
import { to } from 'await-to-js';
import { Multitoken } from '../../shared/types/multitoken';

@Component({
  selector: 'pl-transfer-modal',
  templateUrl: 'transfer-modal.component.pug'
})

export class TransferModalComponent implements OnInit, AfterViewInit {

  @Output() public transferred: EventEmitter<string> = new EventEmitter<string>();
  @Input() public transaction: any;
  @ViewChildren('value') public value;

  public transferForm: FormGroup;

  constructor(
    private $activeModal: NgbActiveModal,
    private $events: EventService,
    private $error: ErrorMessageService,
    private $fb: FormBuilder,
    private $form: FormService,
    private $overlay: LoadingOverlayService,
    private $mt: MultitokenService,
  ) {

  }
  get address() { return this.transferForm.get('walletAddress'); }
  get amount() { return this.transferForm.get('amount'); }

  public ngOnInit() {
    Object.setPrototypeOf(this.transaction.token, new Multitoken());
    this.transaction.max = +this.transaction.token.amount - this.transaction.token.totalPending();
    this.initForm();
  }

  ngAfterViewInit() {
    this.value.first.nativeElement.focus();
  }

  public async transfer() {
    let err, result;
    const amount = this.transferForm.value.amount;
    const destination = this.transferForm.value.walletAddress;
    const amountBN = this.$form.toWei(amount);
    this.$events.transferAdded(amount);
    this.$overlay.showOverlay(true);
    try {
      // Object.setPrototypeOf(this.transaction, new PlasmaDepositImp());
      // if (amountBN.eq(this.transaction.bn)) {
        const balance = await this.$mt.getTokenBalance(this.transaction.key);
        const event = this.$mt.sendTokens(this.transaction.key, destination, amount);
        if (+balance < +amount) { throw new Error('not enough tokens'); }
        event.on('transactionHash', (hash) => {
          this.$activeModal.close();
          this.$overlay.hideOverlay();
          this.$events.transferSubmited(this.transaction);
        });
        [err, result] = await to(event);
      // }
      if (err) {
        if (err.message.indexOf('User denied') > 0) {
          this.$events.transferCanceled(this.transaction.blockNumber);
        } else {
          this.$events.transferFailed(this.transaction);
        }
      } else {
        this.closeModal();
        this.$events.transferConfirmed(this.transaction);
        this.transferred.emit(amount);
      }
      this.$overlay.hideOverlay();

    } catch (err) {
      alert('OH NO!!!!');
    }
  }

  public closeModal() {
    this.$activeModal.close();
  }

  private initForm() {
    this.transferForm = this.$fb.group({
      amount: [this.transaction.eth, [
        Validators.required,
        Validators.min(1),
        Validators.max(this.transaction.max),
        Validators.pattern(/^\d?/)]
      ],
      walletAddress: ['', [
        Validators.required,
        this.$form.walletAddressValidator()
      ]
    ]});
  }
}
