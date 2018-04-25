export class ContractData {

  public address;
  public abi;
  public apiAddress?;

  /**
   * Returns hardcoded settings if needed
   */
  static getData() {
    return {
    apiAddress: '',
    address: '0x075aeb00624b5fe91a003bd00667285860ad490e',
    abi: require('../_data/MultiToken.json').abi
  }}
}
