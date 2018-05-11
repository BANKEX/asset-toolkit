import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { ValidatorFn, AbstractControl } from '@angular/forms';

@Injectable()
export class FormService {

  public web3 = new Web3;
  public utils = this.web3.utils;

  constructor(
  ) {
  }

  public  walletAddressValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
      const isAddress = this.web3.utils.isAddress(control.value);
      const error = {};
      error['validAddress'] = {value: control.value}
      return !control.value || isAddress ? null : error;
    };
  }

  public toWei(value) {
    const utils = this.web3.utils;
    return utils.toBN(utils.toWei(value, 'ether'));
  }

  public fromWei(value) {
    const utils = this.web3.utils;
    return utils.fromWei(String(value), 'ether');
  }

  public to1E18(value) {
    return this.utils.toWei(value, 'ether');
  }

  public from1E18(value) {
    return this.utils.fromWei(value, 'ether');
  }
}

