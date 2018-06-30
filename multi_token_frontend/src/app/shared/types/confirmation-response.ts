export interface ConfirmationResponse {
  internalId: number;
  resultIndex?: string;
  txHash?: string; // hash address of running transaction
}
