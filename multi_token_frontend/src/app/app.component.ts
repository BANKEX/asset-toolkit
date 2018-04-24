import { Component } from '@angular/core';
import { Connection } from './shared/types';
import { ConnectionService } from './core';
import { LoadingOverlayService } from './shared/services';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.pug',
})
export class AppComponent {

  public clientAddress: string;

  public constructor(
    private $connection: ConnectionService,
    private $overlay: LoadingOverlayService,
  ) {
    $connection.subscribe((state: Connection) => {
      if (state === Connection.Estableshed) {
        $overlay.hideOverlay();
        this.clientAddress = $connection.getAccount();
      }
    })
  }
}
