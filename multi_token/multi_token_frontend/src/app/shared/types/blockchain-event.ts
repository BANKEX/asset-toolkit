export class BlockchainEvent {
  address: string;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: 3;
  blockHash: string ;
  logIndex: number;
  removed: boolean;
  id: string;
  returnValues: any;
  event: string;
  signature: string;
  raw: {data: string, topics: string[]}
}

const exampleEvent = {
  'address': '0x02a2F8482658a3DA0bBE078F3c0316e94d00a148',
  'blockNumber': 2300294,
  'transactionHash': '0xf97965b41f82a5cd31f9bc976dc54d85c31919a23018d0e9d864d267178f0c35',
  'transactionIndex': 3,
  'blockHash': '0x7dd8467a669e12710be5d088b00801e1373fc1853efe3ba3a2c4e9f7bb191f57',
  'logIndex': 17,
  'removed': false,
  'id': 'log_b6560927',
  'returnValues': {
    '0': '1',
    '1': '0x21A1a6D233fC90e19D426C85DA5C948a6DeC2892',
    '2': '0x02A2f8482658a3Da0bBE078f3c0316E94d00A149',
    '3': '1000000000000000000',
    'tokenId': '1',
    'from': '0x21A1a6D233fC90e19D426C85DA5C948a6DeC2892',
    'to': '0x02A2f8482658a3Da0bBE078f3c0316E94d00A149',
    'value': '1000000000000000000'
  },
  'event': 'Transfer',
  'signature': '0xf2dbd98d79f00f7aff338b824931d607bfcc63d47307162470f25a055102d3b0',
  'raw': {
    'data': '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
    'topics': [
      '0xf2dbd98d79f00f7aff338b824931d607bfcc63d47307162470f25a055102d3b0',
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      '0x00000000000000000000000021a1a6d233fc90e19d426c85da5c948a6dec2892',
      '0x00000000000000000000000002a2f8482658a3da0bbe078f3c0316e94d00a149'
    ]
  }
}
