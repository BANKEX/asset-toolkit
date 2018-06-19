import { Component, OnInit } from '@angular/core';
import { IsaoService } from '../core/isao.service';
import 'hammerjs';
import { ErrorMessageService } from '../shared/services/error-message.service';
import { ContractInput } from '../core/types/contract-input';

@Component({
  selector: 'isao-init',
  templateUrl: './init.component.pug',
})
export class InitComponent implements OnInit {

  public creating = false;
  public rPeriod = 7;
  public dPeriod = 30;
  public minimalFundSize = 150;
  public minimalDeposit = 0.1;
  public paybotAddress = 0;
  public limits = '100, 200';
  public costs = '0.1, 0.2'

  public constructor(
    private $error: ErrorMessageService,
    public $isao: IsaoService,
  ) { }

  public ngOnInit(): void { }

  public initContract() {
    try {
      const data = new ContractInput(
        this.rPeriod,
        this.dPeriod,
        this.minimalFundSize,
        this.minimalDeposit,
        this.paybotAddress,
        this.limits,
        this.costs
      );
      this.creating = true;
      this.$isao.publishNewContract(data);
    } catch (err) { console.error(err); this.$error.addError(err.message) };
  }
}
