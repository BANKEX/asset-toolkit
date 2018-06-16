pragma solidity ^0.4.23;

import "../../abstract/ISAO/StateModel.sol";
import "../../abstract/ISAO/ShareStore.sol";
import "../../abstract/TimeMachine/TimeMachineT.sol";

contract StateModelTest is StateModel, ShareStore, TimeMachineT {
  uint totalShare_;
  uint8 role_;

  function getTotalShare_() internal view returns(uint) {
    return totalShare_;
  }

  function getRole_() internal view returns(uint8) {
    return role_;
  }

  function getRole_(address _for) internal view returns(uint8) {
    return role_;
  }

  function getRoleAddress_(uint8 _for) view internal returns(address) {
    return msg.sender;
  }

  function setRole(uint8 _role) external returns(bool) {
    role_ = _role;
    return true;
  }

  function setTotalShare(uint _totalShare) external returns(bool) {
    totalShare_ = _totalShare;
    return true;
  }

  function getState() external  view returns(uint8) {
    return getState_();
  }

  function getTimeState() external  view returns(uint8) {
    return getTimeState_();
  }

  function getRaisingState() external  view returns(uint8) {
    return getRaisingState_();
  }


  constructor(uint _raisingPeriod, uint _distributionPeriod, uint _minimalFundSize, uint _maximalFundSize) public {
    raisingPeriod = _raisingPeriod;
    distributionPeriod = _distributionPeriod;

    minimalFundSize = _minimalFundSize;
    maximalFundSize = _maximalFundSize;
  }
}
