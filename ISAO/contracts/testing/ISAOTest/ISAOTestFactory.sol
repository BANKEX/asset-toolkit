pragma solidity ^0.4.23;

import "./ISAOTest.sol";
import "../../libs/token/ERC20/ERC20.sol";


contract ERC20Test is ERC20 {

  string public name = "ISAO Token";
  string public symbol = "ISAOT";
  uint8 public decimals = 18;


  constructor(address _owner, uint _totalSupply) public {
    totalSupply_ = _totalSupply;
    balances[_owner] = _totalSupply;
    emit Transfer(address(0), _owner, _totalSupply);
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
              address _paybotAddress) public {
    isaoAddress = new ISAOTest(_raisingPeriod, _distributionPeriod, 
      _minimalFundSize, _limits, _costs, _minimalDeposit, _paybotAddress);
    erc20Address = new ERC20Test(isaoAddress, _limits[_limits.length-1]);
    ISAOTest(isaoAddress).setERC20Token(erc20Address); 
    ISAOTest(isaoAddress).setState(ST_RAISING);
    
  }
}