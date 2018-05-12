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
  public initialDataReady = false;
  public objectKeys = Object.keys;
  public toBN: any;
  public tokenKey: any;
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
      this.tokens = _ids;
      this.initForm();
      this.initialDataReady = true;
    });
  }

  ngAfterViewInit() {
  }

  public async createToken() {
    let err, result;
    const amount = this.$form.to1E18(this.form.value.amount);
    const tokenType = this.toBN(this.$form.remove0x(this.form.value.tokenKey));
    this.$events.transferAdded(null);
    this.$overlay.showOverlay(true);
    try {
      const event = this.$mt.initSubTokens(tokenType, amount);
      event.on('transactionHash', (hash) => {
        this.$activeModal.close();
        this.$overlay.hideOverlay();
        this.$events.transferSubmited(null);
      });
      [err, result] = await to(event);
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
      tokenKey: ['', [
        Validators.required,
        Validators.pattern(/^0x[1-9](\d+)?$/m),
        this.$form.tokenNotExistsValidator(this.tokens)
      ]],
      amount: ['', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d+)?$/m),
        this.$form.rangeValidator()
      ]],
    });
    setTimeout(() => { this.focus.first.nativeElement.focus(); }, 1000)
  }
}
