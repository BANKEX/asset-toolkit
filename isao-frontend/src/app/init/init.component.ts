import 'hammerjs';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
// import DropDownList = kendo.ui.DropDownList;
import { ErrorMessageService } from '../shared/services/error-message.service';
import { ContractInput } from '../core/types/contract-input';
import { ConnectionService, IsaoService, HelperService } from '../core';
import { TokenType } from '../core/types/contract-type.enum';

@Component({
  selector: 'isao-init',
  templateUrl: './init.component.pug',
})
export class InitComponent implements OnInit, AfterViewInit {
  @ViewChild('kendoDropDownListInstance') dropdown;
  public creating = false;
  public rPeriod = 7;
  public dPeriod = 30;
  public minimalFundSize = 150;
  public minimalDeposit = 0.1;
  public paybotAddress = 0;
  public limits = '100, 200';
  public costs = '0.1, 0.2';
  public tokenTypes = [
    {name: 'Standard ERC20 token', value: TokenType.ERC20},
    {name: 'Bankex Multitoken', value: TokenType.Multitoken}
  ];
  public selectedTokenType = this.tokenTypes[0];
  public TokenType = TokenType;
  public subtokenId = this.$helper.rnd(5);

  public constructor(
    private $connection: ConnectionService,
    private $error: ErrorMessageService,
    public $isao: IsaoService,
    public $helper: HelperService,
  ) { }

  public ngOnInit(): void { }
  public ngAfterViewInit(): void { }

  public initContract() {
    try {
      const data = new ContractInput(
        this.rPeriod,
        this.dPeriod,
        this.minimalFundSize,
        this.minimalDeposit,
        this.$connection.account,
        this.paybotAddress,
        this.limits,
        this.costs
      );
      this.creating = true;
      this.$isao.publishNewContract(data, this.selectedTokenType.value, [this.subtokenId]);
    } catch (err) { console.error(err); this.$error.addError(err.message); }
  }

  public selectionChange(value: any): void {
    // console.log('selectionChange', value);
  }
}
