pragma solidity ^0.4.23;

import "../../abstract/ISAO/ISAO.sol";
import "../../abstract/TimeMachine/TimeMachineP.sol";
import "../../abstract/Cassette/ERC20Cassette.sol";

contract ISAOProd is ISAO, TimeMachineP, ERC20Cassette {
  uint constant DECIMAL_MULTIPLIER = 1e18;

  event CostStairs(uint[] limits, uint[] costs);
  
  /** 
  * @param _raisingPeriod time to raise ETH
  * @param _distributionPeriod time to distribute tokens and remaining ETH to investors
  * @param _minimalFundSize minimal collected fund in tokens
  * @param _limits fund stages
  * @param _costs stages prices
  * @param _minimalDeposit minimal amount of ETH in wei which is allowed to become investor
  * @param _paybotAddress address of pay bot
  */  
  constructor(uint _raisingPeriod, 
              uint _distributionPeriod, 
              uint _minimalFundSize, 
              uint[] _limits, 
              uint[] _costs,
              uint _minimalDeposit,
              address _adminAddress,
              address _paybotAddress) public {
    raisingPeriod = _raisingPeriod;
    distributionPeriod = _distributionPeriod;

    minimalDeposit = _minimalDeposit;
    setCosts_(_minimalFundSize, _limits, _costs);

    setRole_(RL_ADMIN, _adminAddress);
    setRole_(RL_PAYBOT, _paybotAddress);
    emit CostStairs(_limits, _costs);
  }
}