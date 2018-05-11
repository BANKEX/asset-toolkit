import { ContentComponent } from './content/content.component';
import { WalletComponent } from './wallet/wallet.component';
import { HistoryComponent } from './history/history.component';
import { TransferModalComponent } from './wallet/transfer-modal/transfer-modal.component';
import { SendDividendsModalComponent } from './wallet/send-dividends-modal/send-dividends-modal.component';
import { TabsComponent, TabComponent } from './tabs';
import { GetDividendsModalComponent } from './wallet/get-dividends-modal/get-dividends-modal.component';
import { AddTokenModalComponent } from './wallet/add-token-modal/add-token-modal.component';

export const APP_DECLARATIONS = [
  AddTokenModalComponent,
  ContentComponent,
  GetDividendsModalComponent,
  HistoryComponent,
  SendDividendsModalComponent,
  TabComponent,
  TabsComponent,
  TransferModalComponent,
  WalletComponent,
];
