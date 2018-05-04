export class ContractData {

  public address;
  public abi;

  /**
   * Returns hardcoded settings
   */
  static getData() {
    return {
    address: '0xcdb7c2da74c11280eb3f63fbcf5ac6d484029797',
    abi: require('../data/MultiVendingToken.json').abi
  }}

  public constructor(_address?: string) {
    const data = ContractData.getData();
    this.address = _address || data.address;
    this.abi = data.abi;
  }
}
