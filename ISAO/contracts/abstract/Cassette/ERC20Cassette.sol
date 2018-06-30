pragma solidity ^0.4.23;
import "./ICassette.sol";
import "../../libs/token/ERC20/IERC20.sol";
import "../ISAO/IStateModel.sol";
import "../ISAO/IRoleModel.sol";


contract ERC20Cassette is ICassette, IRoleModel, IStateModel {
  address public tokenAddress;


  function getCassetteSize_() internal view returns(uint) {
    return IERC20(tokenAddress).balanceOf(this);
  }

  function acceptAbstractToken_(uint _value) internal returns(bool) {
    return IERC20(tokenAddress).transferFrom(msg.sender, this, _value);
  }

  function releaseAbstractToken_(address _for, uint _value) internal returns(bool) {
    return IERC20(tokenAddress).transfer(_for, _value);
  }

  function setERC20Token_(address _tokenAddress) internal returns(bool) {
    tokenAddress = _tokenAddress;
  }

  function setERC20Token(address _tokenAddress) external returns(bool) {
    uint8 _role = getRole_();
    uint8 _state = getState_();
    require(_role == RL_ADMIN || _role == RL_PAYBOT);
    require(_state == ST_DEFAULT);
    return setERC20Token_(_tokenAddress);
  }


}