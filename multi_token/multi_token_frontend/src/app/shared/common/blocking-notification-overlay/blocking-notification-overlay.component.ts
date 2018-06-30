import { Component, OnDestroy, OnInit } from '@angular/core';
import { BlockingNotificationOverlayService } from '../../services';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'bnkx-blocking-notification-overlay',
  templateUrl: 'blocking-notification-overlay.component.pug',
  styleUrls: ['blocking-notification-overlay.component.scss']
})
export class BlockingNotificationOverlayComponent implements OnInit, OnDestroy {

  public showOverlay: boolean;
  public message: string;
  private componentDestroyed: Subject<void> = new Subject<void>();

  constructor(
    private blockingNotificationOverlayService: BlockingNotificationOverlayService
  ) {}

  public ngOnInit(): void {
    this.blockingNotificationOverlayService.onSetMessage()
      .takeUntil(this.componentDestroyed)
      .subscribe((message: string) => {
          this.message = message;
        },
        (err: Error) => {
          console.error(err);
        });

    this.blockingNotificationOverlayService.onShowOverlay()
      .subscribe((isVisible: boolean) => {
          this.showOverlay = isVisible;
        },
        (err: Error) => {
          console.error(err);
        });
  }

  public ngOnDestroy(): void {
    this.componentDestroyed.next();
  }

}
