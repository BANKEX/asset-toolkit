pragma solidity ^0.4.23;

import "./ISAOTest.sol";
import "../../libs/token/ERC20/ERC20.sol";


contract ERC20Test is ERC20 {

  string public name = "ISAO Token";
  string public symbol = "ISAOT";
  uint8 public decimals = 18;
  
  function mint(address _for, uint _value) public returns (bool) {
    require(totalSupply_==0);
    totalSupply_ = _value;
    balances[_for] = _value;
    emit Transfer(address(0), _for, _value);
    return true;
  }
}

contract ISAOTest2 is ISAOTest {
  uint8 constant ST_RAISING = 0x01;
  constructor(uint _raisingPeriod, 
              uint _distributionPeriod, 
              uint _minimalFundSize,
              uint[] _limits, 
              uint[] _costs,
              uint _minimalDeposit,
              address _adminAddress,
              address _paybotAddress) public ISAOTest(_raisingPeriod, _distributionPeriod,
              _minimalFundSize, _limits, _costs, _minimalDeposit, _adminAddress, _paybotAddress
              ) {
  }
  function init (address _tokenAddress) public returns(bool) {
      require(tokenAddress==address(0));
      tokenAddress=_tokenAddress;
      initialState_ = ST_RAISING;
      launchTimestamp = getTimestamp_();
      return true;
  }
}

/// @notice  This factory is not legacy, but it is ganache-compatible. Do not write in-constructor factories for production!
contract ISAOTestFactory {
  uint8 constant ST_RAISING = 0x01;
  address public isaoAddress;
  address public erc20Address;

  constructor(uint _raisingPeriod, 
              uint _distributionPeriod, 
              uint _minimalFundSize,
              uint[] _limits, 
              uint[] _costs,
              uint _minimalDeposit,
              address _adminAddress,
              address _paybotAddress) public {
                  
    erc20Address = new ERC20Test();
    isaoAddress = new ISAOTest2(_raisingPeriod, _distributionPeriod, 
      _minimalFundSize, _limits, _costs, _minimalDeposit, _adminAddress, _paybotAddress);
    ISAOTest2(isaoAddress).init(erc20Address);
    ERC20Test(erc20Address).mint(isaoAddress, _limits[_limits.length-1]);

  }
}