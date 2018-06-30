import { Component, Input, ChangeDetectorRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'mt-tab',
  templateUrl: 'tab.component.pug'
})
export class TabComponent implements AfterViewInit {
  @Input() title;
  @Input() active = false;

  constructor (private $cdr: ChangeDetectorRef) {}
  ngAfterViewInit() {
    this.$cdr.detectChanges();
  }
}
