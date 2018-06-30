import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LoadingOverlayService } from '../../services';
import { loadingOverlayConfig } from '../../types';

@Component({
  selector: 'bnkx-loading-overlay',
  templateUrl: 'loading-overlay.component.pug',
  styleUrls: ['loading-overlay.component.scss']
})
export class LoadingOverlayComponent implements OnInit {
  public showOverlay = true;
  public transparent = false;

  constructor(
    private $loadingOverlay: LoadingOverlayService,
    private $cdr: ChangeDetectorRef,
  ) {

  }

  public ngOnInit(): void {
    this.$loadingOverlay.onOverlayStateChanged()
      .debounceTime(200)
      .subscribe((config: loadingOverlayConfig) => {
          this.showOverlay = config.showOverlay;
          this.transparent = config.transparent;
          this.$cdr.detectChanges();
        },
        (err: Error) => {
          console.error(err.message);
        });

  }

}
