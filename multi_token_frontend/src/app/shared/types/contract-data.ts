export class ContractData {

  public address;
  public abi;

  /**
   * Returns hardcoded settings
   */
  static getData() {
    return {
    // address: '0xbabaf82adadb458777783398af05de763328ea51',
    address: '0x02a2f8482658a3da0bbe078f3c0316e94d00a148',
    abi: require('../data/MultiToken.json').abi
  }}

  public constructor(_address?: string) {
    const data = ContractData.getData();
    this.address = _address || data.address;
    this.abi = data.abi;
  }
}
