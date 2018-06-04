pragma solidity ^0.4.23;

import "../../abstract/ISAO/ISAO.sol";
import "../../abstract/TimeMachine/TimeMachineT.sol";
import "../../abstract/Cassette/ERC20Cassette.sol";

contract ISAOTest is ISAO, TimeMachineT, ERC20Cassette {
  uint constant DECIMAL_MULTIPLIER = 1e18;
  
  constructor(uint _raisingPeriod, 
              uint _distributionPeriod, 
              uint _minimalFundSize, 
              uint[] _limits, 
              uint[] _costs,
              uint _minimalDeposit,
              address _paybotAddress) public {
    raisingPeriod = _raisingPeriod;
    distributionPeriod = _distributionPeriod;

    minimalDeposit = _minimalDeposit;
    setCosts_(_minimalFundSize, _limits, _costs);

    setRole_(RL_ADMIN, msg.sender);
    setRole_(RL_PAYBOT, _paybotAddress);
  }
}