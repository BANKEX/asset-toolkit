import { Component, OnInit } from '@angular/core';
import { EventService, MultitokenService } from '../core';
import { LoadingOverlayService } from '../shared/services';
import { to } from 'await-to-js';

@Component({
  selector: 'mt-history',
  templateUrl: './history.component.pug',
})
export class HistoryComponent implements OnInit {

  public transactions: any[];
  public sortOptions: any[];
  public sortBy;

  public constructor(
    private $events: EventService,
    private $overlay: LoadingOverlayService,
    private $mt: MultitokenService,
  ) {
    $mt.transactions.subscribe((_transactions: any[]) => {
      this.transactions = _transactions;
    });
  }

  public ngOnInit(): void {
    this.sortOptions = [
      {id: 'index', name: 'Date added', reverse: true},
      {id: 'eth', name: 'Amount', reverse: true}
    ];
    this.sortBy = this.sortOptions[0];
  }
}
