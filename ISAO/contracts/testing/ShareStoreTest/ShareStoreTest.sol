pragma solidity ^0.4.23;

import "../../abstract/ISAO/ShareStore.sol";
import "../../abstract/TimeMachine/TimeMachineT.sol";
import "../../abstract/Cassette/ERC20Cassette.sol";


contract ShareStoreTest is ShareStore, TimeMachineT, ERC20Cassette {
  
  uint8 internal role_;
  address internal roleAddress_;
  
  uint256 public max_value_test = 2**256 -1;
  
  
  uint8 internal state_;
  
  constructor(uint _minimalFundSize, uint _minimalDeposit, uint[] _limits, uint[] _costs) public {
    role_ = 0x04;
    roleAddress_ = msg.sender;
    minimalDeposit = _minimalDeposit;
    setCosts_(_minimalFundSize, _limits, _costs);
  }
  
  

  function setRoleTestData(uint8 _role, address _addr) external {
    role_ = _role;
    roleAddress_ = _addr;
  }
  
  
  function getRole_() view internal returns (uint8) {
    return role_;
  }
  
  function getRole_(address) view internal returns (uint8) {
    return role_;
  }
  
  
  function getRoleAddress_(uint8) view internal returns (address) {
    return roleAddress_;
  }
  
  
  function setState(uint8 _state) external {
    state_ = _state;
  }
  
  function getState() external view returns (uint8) {
    return getState_();
  }
  
  function getState_() internal view returns (uint8) {
    return state_;
  }
  
  function getShareRemaining_() internal view returns(uint)
  {
    return maximalFundSize.sub(getTotalShare_());
  }
  
  function getTotalShare_() internal view returns(uint){
    return totalShare;
  }
  
}