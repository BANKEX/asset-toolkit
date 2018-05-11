export class ContractData {

  public address;
  public abi;

  /**
   * Returns hardcoded settings
   */
  static getData() {
    return {
    address: '0x0b8db2bd9df24a254d1793687ca32275e8018522',
    abi: require('../data/MultiToken.json').abi
  }}

  public constructor(_address?: string) {
    const data = ContractData.getData();
    this.address = _address || data.address;
    this.abi = data.abi;
  }
}
