export class Operation {
  public initiator: string;
  public direction: OperationDirection;
  public token: string;
  public to: string;
  public type: OperationType;
  public value: BigNumber;
}

export enum OperationType {
  Emission,
  Transfer,
  Transaction
}

export enum OperationDirection {
  In = 'in',
  Out = 'out'
}
