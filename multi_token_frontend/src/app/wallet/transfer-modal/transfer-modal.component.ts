import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService, EventService, MultitokenService } from '../../core';
import { LoadingOverlayService, ErrorMessageService } from '../../shared/services';
import { BigNumber } from 'bignumber.js';
import { to } from 'await-to-js';
import { Multitoken } from '../../shared/types/multitoken';
import { Token } from '../../shared/types';

@Component({
  selector: 'mt-transfer-modal',
  templateUrl: 'transfer-modal.component.pug'
})

export class TransferModalComponent implements OnInit, AfterViewInit {

  @Output() public transferred: EventEmitter<string> = new EventEmitter<string>();
  @Input() public token: Token;
  @Input() public avalable: BigNumber;
  @ViewChildren('focus') public focus;

  public transferForm: FormGroup;
  public avalableTokens: number;
  public tokenKey: string;

  constructor(
    public $form: FormService,
    private $activeModal: NgbActiveModal,
    private $events: EventService,
    private $error: ErrorMessageService,
    private $fb: FormBuilder,
    private $overlay: LoadingOverlayService,
    private $mt: MultitokenService,
  ) {

  }
  get address() { return this.transferForm.get('walletAddress'); }
  get amount() { return this.transferForm.get('amount'); }

  public ngOnInit() {
    this.avalableTokens = +this.avalable.toString();
    this.initForm();
  }

  ngAfterViewInit() {
    this.focus.first.nativeElement.focus();
  }

  public async transfer() {
    let err, result;
    const amount = new BigNumber(this.transferForm.value.amount);
    const destination = this.transferForm.value.walletAddress;
    this.$events.transferAdded(this.transferForm.value.amount);
    this.$overlay.showOverlay(true);
    try {
        const balance = this.token.amount;
        const event = this.$mt.transferTokens(this.token.id, destination, amount.multipliedBy(1e+18));
        if (balance.isLessThan(new BigNumber(amount))) { throw new Error('not enough tokens'); }
        event.on('transactionHash', (hash) => {
          this.$activeModal.close();
          this.$overlay.hideOverlay();
          this.$events.transferSubmited(this.token, amount);
        });
        [err, result] = await to(event);
      if (err) {
        if (err.message.indexOf('User denied') > 0) {
          this.$events.transferCanceled(null);
        } else {
          this.$events.transferFailed(null);
        }
      } else {
        this.closeModal();
        this.$events.transferConfirmed(this.token, amount);
        this.transferred.emit(amount.toString());
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
      amount: ['', [
        Validators.required,
        // Validators.min(1),
        Validators.max(this.avalableTokens),
        Validators.pattern(/^\d+(\.\d+)?$/)]
      ],
      walletAddress: ['', [
        Validators.required,
        this.$form.forbiddenValidator(this.$mt.userAddress),
        this.$form.forbiddenValidator(this.$mt.contractAddress),
        this.$form.walletAddressValidator(),
      ]
    ]});
  }
}
