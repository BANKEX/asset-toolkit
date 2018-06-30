pragma solidity ^0.4.23;

import "../TimeMachine/ITimeMachine.sol";
import "./IStateModel.sol";
import "./IRoleModel.sol";
import "./IShareStore.sol";
import "../../libs/math/SafeMath.sol";
import "../../abstract/Cassette/ICassette.sol";


contract StateModel is ICassette, IRoleModel, IShareStore, IStateModel, ITimeMachine {
  using SafeMath for uint;
  uint public launchTimestamp;

  uint public raisingPeriod;
  uint public distributionPeriod;
  uint8 internal initialState_;
  
  function getTimeState_() internal view returns (uint8) {
    uint _launchTimestamp = launchTimestamp;
    uint _relativeTimestamp = getTimestamp_().sub(_launchTimestamp);
    if (_launchTimestamp == 0)
      return TST_DEFAULT;
    if (_relativeTimestamp < raisingPeriod)
      return TST_RAISING;
    if (_relativeTimestamp < distributionPeriod)
      return TST_TOKEN_DISTRIBUTION;
    return TST_FUND_DEPRECATED;
  }

  function getRaisingState_() internal view returns(uint8) {
    uint _totalShare = getTotalShare_();
    if (_totalShare < getMinimalFundSize_()) 
      return RST_NOT_COLLECTED;
    if (_totalShare < getMaximalFundSize_())
      return RST_COLLECTED;
    return RST_FULL;
  }


  function getState_() internal view returns (uint8) {
    uint _initialState = initialState_;
    uint _timeState = getTimeState_();
    uint _raisingState = getRaisingState_();
    return getState_(_initialState, _timeState, _raisingState);
  }


  function getState_(uint _initialState, uint _timeState, uint _raisingState) private pure returns (uint8) {
    if (_initialState == ST_DEFAULT) return ST_DEFAULT;

    if (_initialState == ST_RAISING) {
      if (_timeState == TST_RAISING) {
        if (_raisingState == RST_FULL) {
          return ST_TOKEN_DISTRIBUTION;
        }
        return ST_RAISING;
      }

      if (_timeState == TST_TOKEN_DISTRIBUTION) {
        if (_raisingState == RST_NOT_COLLECTED) {
          return ST_MONEY_BACK;
        }
        return ST_TOKEN_DISTRIBUTION;
      }
      return ST_FUND_DEPRECATED;
    }


    if (_initialState == ST_MONEY_BACK) {
      if (_timeState == TST_RAISING || _timeState == TST_TOKEN_DISTRIBUTION) {
        return ST_MONEY_BACK;
      }
      return ST_FUND_DEPRECATED;
    }
    
    if (_initialState == ST_TOKEN_DISTRIBUTION) {
      if (_timeState == TST_RAISING || _timeState == TST_TOKEN_DISTRIBUTION) {
        return ST_TOKEN_DISTRIBUTION;
      }
      return ST_FUND_DEPRECATED;
    }

    return ST_FUND_DEPRECATED;
  }
  
  function setState_(uint _stateNew) internal returns (bool) {
    uint _initialState = initialState_;
    uint _timeState = getTimeState_();
    uint _raisingState = getRaisingState_();
    uint8 _state = getState_(_initialState, _timeState, _raisingState);
    uint8 _role = getRole_();

    if (_stateNew == ST_RAISING) {
      if ((_role == RL_ADMIN || _role == RL_PAYBOT) && (_state == ST_DEFAULT)) 
        if(getCassetteSize_() >= getMaximalFundSize_()) {
          launchTimestamp = getTimestamp_();
          initialState_ = ST_RAISING;
          return true;
        }
      revert();
    }

    if (_stateNew == ST_TOKEN_DISTRIBUTION) {
      if ((_role == RL_ADMIN || _role == RL_PAYBOT) && (_raisingState == RST_COLLECTED)) {
        initialState_ = ST_TOKEN_DISTRIBUTION;
        return true;
      }
      revert();
    }

    if (_stateNew == ST_MONEY_BACK) {
      if ((_role == RL_ADMIN || _role == RL_PAYBOT) && (_state == ST_RAISING)) {
        initialState_ = ST_MONEY_BACK;
        return true;
      }
      revert();
    }

    revert();
    return true;
  }
  
  /**
  * @dev Returns state of pooling (for example: raising)
  * @return state (0 if ST_DEFAULT, 1 if ST_RAISING, 4 if ST_MONEY_BACK, 8 if ST_TOKEN_DISTRIBUTION, 10 if ST_FUND_DEPRECATED)
  */
  function getState() external view returns(uint8) {
    return getState_();
  }
  
  /**
  * @dev Allow to set state by stakeholders
  * @return result of operation, true if success
  */
  function setState(uint newState) external returns(bool) {
    return setState_(newState);
  }

}

