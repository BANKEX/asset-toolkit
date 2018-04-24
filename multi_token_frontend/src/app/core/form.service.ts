import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { ValidatorFn, AbstractControl } from '@angular/forms';

@Injectable()
export class FormService {

  public web3 = new Web3;

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

  public toWei(val) {
    const utils = this.web3.utils;
    return utils.toBN(utils.toWei(val, 'ether'))
  }
}
