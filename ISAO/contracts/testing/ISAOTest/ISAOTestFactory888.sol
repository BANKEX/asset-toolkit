pragma solidity ^0.4.23;

import "./ISAOTest888.sol";
import "../../libs/token/ERC888/IERC888.sol";

contract IERC888_2 is IERC888 {
    function init(uint _tokenId, uint _value) external;
}

contract ISAOTest888_2 is ISAOTest888 {
  uint8 constant ST_RAISING = 0x01;
  constructor(uint _raisingPeriod, 
              uint _distributionPeriod, 
              uint _minimalFundSize,
              uint[] _limits, 
              uint[] _costs,
              uint _minimalDeposit,
              address _adminAddress,
              address _paybotAddress) public ISAOTest888(_raisingPeriod, _distributionPeriod,
              _minimalFundSize, _limits, _costs, _minimalDeposit, _adminAddress, _paybotAddress
              ) {
  }
  function init (address _tokenAddress, uint _tokenId) public returns(bool) {
    require(tokenAddress==address(0));
    tokenAddress = _tokenAddress;
    tokenId = _tokenId;
    initialState_ = ST_RAISING;
    launchTimestamp = getTimestamp_();
    return true;
  }
}

/// @notice  This factory is not legacy, but it is ganache-compatible. Do not write in-constructor factories for production!
contract ISAOTestFactory {
  uint8 constant ST_RAISING = 0x01;
  address public isaoAddress;

  constructor(uint _raisingPeriod, 
              uint _distributionPeriod, 
              uint _minimalFundSize,
              uint[] _limits, 
              uint[] _costs,
              uint _minimalDeposit,
              address _adminAddress,
              address _paybotAddress,
              address _erc888Address,
              uint _erc888tokenId) public {
                  
    isaoAddress = new ISAOTest888_2(_raisingPeriod, _distributionPeriod, 
      _minimalFundSize, _limits, _costs, _minimalDeposit, _adminAddress, _paybotAddress);
    ISAOTest888_2(isaoAddress).init(_erc888Address, _erc888tokenId);
    uint _value = _limits[_limits.length-1];
    IERC888_2(_erc888Address).init(_erc888tokenId, _value+1);
    IERC888_2(_erc888Address).transfer(_erc888tokenId, isaoAddress, _value);
  }
}