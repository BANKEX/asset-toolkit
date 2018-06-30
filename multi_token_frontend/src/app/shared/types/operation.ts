import { BigNumber } from 'bignumber.js';
import { BlockchainEvent } from './blockchain-event';

export class Operation {
  public blockHash: string;
  public date: Date;  // have to be setted up after separately
  public direction: OperationDirection;
  public initiator: string;
  public token: string;
  public to: string;
  public type: OperationType;
  public value: BigNumber;
  public transactionHash: string;

  public static fromBlockchainEvent(event: BlockchainEvent, selfAddress?: string): Operation {
    const o = new Operation();
    o.blockHash = event.blockHash;
    o.token = event.returnValues.tokenId;
    o.transactionHash = event.transactionHash;
    o.value = (new BigNumber(event.returnValues.value)).div(1e+18);
    if (event.event === 'Transfer') {
      o.type = OperationType.Transfer;
      o.initiator = event.returnValues.from;
      o.to = event.returnValues.to ? event.returnValues.to : undefined;
      o.direction = !selfAddress ? undefined : selfAddress === o.initiator ? OperationDirection.Out : OperationDirection.In;
    } else if (event.event === 'ReleaseDividendsRights' || event.event === 'AcceptDividends') {
      o.type = OperationType.Transaction;
      o.initiator = undefined;
      o.to = undefined;
      o.direction = event.event === 'ReleaseDividendsRights' ? OperationDirection.Out : OperationDirection.In;
    } else {
      o.type = OperationType.Emission;
    }
    return o;
  }
}

export enum OperationType {
  Emission = 1,
  Transfer,
  Transaction
}

export enum OperationDirection {
  In = 'in',
  Out = 'out'
}
