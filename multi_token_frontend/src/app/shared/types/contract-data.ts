export class ContractData {

  public address;
  public abi;

  /**
   * Returns hardcoded settings
   */
  static getData() {
    return {
    // address: '0xbabaf82adadb458777783398af05de763328ea51',
    address: '0x4b9dbfc298f6d7c63ed63dd62c1b8e4473c9e1a5',
    abi: require('../data/MultiToken.json').abi
  }}

  public constructor(_address?: string) {
    const data = ContractData.getData();
    this.address = _address || data.address;
    this.abi = data.abi;
  }
}
