export class ContractData {

  public address;
  public abi;

  /**
   * Returns hardcoded settings
   */
  static getData() {
    return {
    // address: '0xbabaf82adadb458777783398af05de763328ea51',
    address: [
      'none',
      '0xc124b6ef86917d79d7dbdb6c53dd176a5d33ee5e',   // Mainnet
      'Morden',
      'Ropsten',
      '0x02a2f8482658a3da0bbe078f3c0316e94d00a148',   // Rinkeby
    ],
    abi: require('../data/MultiToken.json').abi
  }}

  public constructor(_address?: string, _networkId?: number) {
    const data = ContractData.getData();
    this.address = _address || data.address[_networkId] || data.address[4];
    this.abi = data.abi;
  }
}
