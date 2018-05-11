export class ContractData {

  public address;
  public abi;

  /**
   * Returns hardcoded settings
   */
  static getData() {
    return {
    address: '0xbabaf82adadb458777783398af05de763328ea51',
    abi: require('../data/MultiToken.json').abi
  }}

  public constructor(_address?: string) {
    const data = ContractData.getData();
    this.address = _address || data.address;
    this.abi = data.abi;
  }
}
