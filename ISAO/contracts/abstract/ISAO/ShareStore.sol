pragma solidity ^0.4.23;


import "./IStateModel.sol";
import "./IRoleModel.sol";
import "./IShareStore.sol";
import "../Cassette/ICassette.sol";
import "../../libs/math/SafeMath.sol";



contract ShareStore is ICassette, IRoleModel, IShareStore, IStateModel{
  using SafeMath for uint;

  uint public minimalDeposit;
  uint public minimalFundSize;
  uint public maximalFundSize;

  mapping (uint=>uint) stNext;
  mapping (uint=>uint) stPrice;
  uint stPos;

  mapping (address=>uint) share;
  mapping (address=>uint) eth;

  mapping (address=>uint) tokenReleased_;

  mapping (uint8=>uint) stakeholderEtherReleased_;
  mapping (uint8=>uint) stakeholderTokenReleased_;

  uint totalShare;

  uint constant DECIMAL_MULTIPLIER = 1e18;

  function getTotalShare_() internal view returns(uint){
    return totalShare;
  }

  function getMinimalFundSize_() internal view returns(uint) {
    return minimalFundSize;
  }

  function getMaximalFundSize_() internal view returns(uint) {
    return maximalFundSize;
  }


  function buyShare_() internal returns(bool) {
    require(msg.value >= minimalDeposit);
    uint __shareCursor = totalShare;
    uint _shareCursor = __shareCursor;
    uint __stPos = stPos;
    uint _stPos = __stPos;
    uint _remainValue = msg.value;

    while (_remainValue > 0 && _stPos != 0) {
      uint _stPrice = stPrice[_stPos];
      uint _share = _remainValue.mul(DECIMAL_MULTIPLIER).div(_stPrice);

      if (_shareCursor.add(_share) > _stPos) {
        _remainValue = _remainValue.sub(_stPos.sub(_shareCursor).mul(_stPrice).div(DECIMAL_MULTIPLIER));
        _shareCursor = _stPos;
        _stPos = stNext[_stPos];
      } else {
        _remainValue = 0;
        _shareCursor = _shareCursor.add(_share);
      }
    }

    if (__stPos != _stPos) 
      stPos = _stPos;

    if (__shareCursor != _shareCursor) {
      share[msg.sender] = share[msg.sender].add(_shareCursor.sub(__shareCursor));
      eth[msg.sender] = eth[msg.sender].add(msg.value.sub(_remainValue));
      totalShare = _shareCursor;
    }

    if (_remainValue > 0) 
      msg.sender.transfer(_remainValue);
    return true;
  }

  function refundShare_(address _for, uint _value) internal returns(bool) {
    uint _share = share[_for];
    uint _tokenReleased = tokenReleased_[_for];
    require(_share.sub(_tokenReleased) >= _value);
    uint _eth = eth[_for];
    uint _valueEth = _eth.mul(_value).div(_share);
    share[_for] = _share.sub(_value);
    eth[_for] = _eth.sub(_valueEth);
    totalShare = totalShare.sub(_value);
    _for.transfer(_valueEth);
    return true;
  }

  function setCosts_(uint _minimalFundSize, uint[] _limits, uint[] _costs) internal returns(bool) {
    uint _stSize = _limits.length;
    require(_stSize == _costs.length);
    require(_stSize > 0);
    for (uint _i = 0; _i < (_stSize - 1); _i++){
      stNext[_limits[_i]] = _limits[_i+1];
      stPrice[_limits[_i]] = _costs[_i];
    }

    stPrice[_limits[_stSize - 1]] = _costs[_stSize - 1];
    stPos = _limits[0];
    minimalFundSize = _minimalFundSize;
    maximalFundSize = _costs[_stSize - 1];
    return true;
  }

  function getBalanceTokenOf_(address _for) internal view returns (uint) {
    return share[_for].sub(tokenReleased_[_for]);
  }

  function getStakeholderBalanceTokenOf_(uint8 _for) internal view returns (uint) {
    if (_for != RL_ADMIN) return 0;
    return maximalFundSize - totalShare - stakeholderTokenReleased_[_for];
  }

  function getStakeholderBalanceEtherOf_(uint8 _for) internal view returns (uint) {
    if (_for != RL_ADMIN) return 0;
    return address(this).balance - stakeholderEtherReleased_[_for];
  }

  function releaseToken_(address _for, uint _value) internal returns (bool) {
    uint _balance = getBalanceTokenOf_(_for);
    require(_balance >= _value);
    tokenReleased_[_for] = tokenReleased_[_for].add(_value);
    emit ReleaseToken(_for, _value);
    return releaseAbstractToken_(_for, _value);
  }

  function releaseEtherToStakeholder_(uint8 _for, uint _value) internal returns (bool) {
    uint _balance = getStakeholderBalanceEtherOf_(_for);
    require(_balance >= _value);
    stakeholderEtherReleased_[_for] = stakeholderEtherReleased_[_for].add(_value);
    address _afor = getRoleAddress_(_for);
    _afor.transfer(_value);
    emit ReleaseEtherToStakeholder(_for, _afor, _value);
    return true;
  }

  function releaseTokenToStakeholder_(uint8 _for, uint _value) internal returns (bool) {
    uint _balance = getStakeholderBalanceTokenOf_(_for);
    require(_balance >= _value);
    stakeholderTokenReleased_[_for] = stakeholderTokenReleased_[_for].add(_value);
    address _afor = getRoleAddress_(_for);
    emit ReleaseTokenToStakeholder(_for, _afor, _value);
    return releaseAbstractToken_(_afor, _value);
  }
  
  /**
  * @dev Release amount of ETH to stakeholder by admin or paybot
  * @param _for stakeholder role (for example: 2)
  * @param _value amount of ETH in wei
  * @return result of operation, true if success
  */
  function releaseEtherToStakeholderForce(uint8 _for, uint _value) external returns(bool) {
    uint8 _role = getRole_();
    uint8 _state = getState_();
    require(_state == ST_TOKEN_DISTRIBUTION);
    require((_role==RL_ADMIN) || (_role==RL_PAYBOT));
    return releaseEtherToStakeholder_(_for, _value);
  }
  
  /**
  * @dev Release amount of tokens to msg.sender
  * @param _value amount of tokens
  * @return result of operation, true if success
  */
  function releaseToken(uint _value) external returns(bool) {
    uint8 _state = getState_();
    require(_state == ST_TOKEN_DISTRIBUTION);
    return releaseToken_(msg.sender, _value);
  }
  
  /**
  * @dev Release amount of tokens to person by admin or paybot
  * @param _for address of person
  * @param _value amount of tokens
  * @return result of operation, true if success
  */
  function releaseTokenForce(address _for, uint _value) external returns(bool) {
    uint8 _role = getRole_();
    uint8 _state = getState_();
    require(_state == ST_TOKEN_DISTRIBUTION);
    require((_role==RL_ADMIN) || (_role==RL_PAYBOT));
    return releaseToken_(_for, _value);
  }
  
  /**
  * @dev Allow to return ETH back to msg.sender if state Money back
  * @param _value amount of ETH in wei
  * @return result of operation, true if success
  */
  function refundShare(uint _value) external returns(bool) {
    uint8 _state = getState_();
    require (_state == ST_MONEY_BACK);
    return refundShare_(msg.sender, _value);
  }
  
  /**
  * @dev Allow to return ETH back to person by admin or paybot if state Money back
  * @param _for address of person
  * @param _value amount of ETH in wei
  * @return result of operation, true if success
  */
  function refundShareForce(address _for, uint _value) external returns(bool) {
    uint8 _state = getState_();
    uint8 _role = getRole_();
    require(_role == RL_ADMIN || _role == RL_PAYBOT);
    require (_state == ST_MONEY_BACK || _state == ST_RAISING);
    return refundShare_(_for, _value);
  }
  
  function buyShare() external payable returns(bool) {
    uint8 _state = getState_();
    require(_state == ST_RAISING);
    return buyShare_();
  }

  function () public payable {
    uint8 _state = getState_();
    if (_state == ST_RAISING){
      buyShare_();
      return;
    }

    if (_state == ST_MONEY_BACK) {
      refundShare_(msg.sender, share[msg.sender]);
      if(msg.value > 0)
        msg.sender.transfer(msg.value);
      return;
    }

    if (_state == ST_TOKEN_DISTRIBUTION) {
      releaseToken_(msg.sender, getBalanceTokenOf_(msg.sender));
      if(msg.value > 0)
        msg.sender.transfer(msg.value);
      return;
    }
    revert();
  }

  
}