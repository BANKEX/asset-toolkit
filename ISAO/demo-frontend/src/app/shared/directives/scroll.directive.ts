import { Directive, AfterViewInit, ElementRef, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/exhaustMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/startWith';

interface ScrollPosition {
  sH: number;
  sT: number;
  cH: number;
};

const DEFAULT_SCROLL_POSITION: ScrollPosition = {
  sH: 0,
  sT: 0,
  cH: 0
};

@Directive({
  selector: '[appInfiniteScroller]'
})
export class InfiniteScrollerDirective implements AfterViewInit {

  @Input() public scrollCallback: any;
  @Input() public immediateCallback = false;
  @Input() public scrollPercent = 90;

  private scrollEvent$;
  private userScrolledDown$;
  private requestStream$;
  private requestOnScroll$;

  constructor(private elm: ElementRef) { }

  ngAfterViewInit() {
    this.registerScrollEvent();
    this.streamScrollEvents();
    this.requestCallbackOnScroll();
  }

  private registerScrollEvent() {
    this.scrollEvent$ = Observable.fromEvent(this.elm.nativeElement, 'scroll');
  }

  private streamScrollEvents() {
    this.userScrolledDown$ = this.scrollEvent$
      .map((e: any): ScrollPosition => ({
        sH: e.target.scrollHeight,
        sT: e.target.scrollTop,
        cH: e.target.clientHeight
      }))
      .pairwise()
      .filter(positions => this.isUserScrollingDown(positions) && this.isScrollExpectedPercent(positions[1]))
  }

  private requestCallbackOnScroll() {
    this.requestOnScroll$ = this.userScrolledDown$;
    if (this.immediateCallback) {
      this.requestOnScroll$ = this.requestOnScroll$
        .startWith([DEFAULT_SCROLL_POSITION, DEFAULT_SCROLL_POSITION]);
    }
    this.requestOnScroll$
      .exhaustMap((ev) => Observable.interval(2000).take(1))
      // tslint:disable-next-line:no-unused-expression
      .subscribe(() => { this.scrollCallback && this.scrollCallback() });
  }

  private isUserScrollingDown = (positions) => {
    return positions[0].sT < positions[1].sT;
  }

  private isScrollExpectedPercent = (position) => {
    return ((position.sT + position.cH) / position.sH) > (this.scrollPercent / 100);
  }
}
