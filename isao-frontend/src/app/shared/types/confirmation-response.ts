import { TransferContent } from './transfer-content.enum';

export interface ConfirmationResponse {
  amount?: number;              // amount ov transfered itens
  type?: TransferContent;       // what is transfered
  hash?: string;                // hash address of running transaction
}
