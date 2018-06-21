pragma solidity ^0.4.23;
import "./ICassette.sol";
import "../../libs/token/ERC888/IERC888.sol";
import "../ISAO/IStateModel.sol";
import "../ISAO/IRoleModel.sol";


contract ERC888Cassette is ICassette, IRoleModel, IStateModel {
  address public tokenAddress;
  uint public tokenId;


  function getCassetteSize_() internal view returns(uint) {
    return IERC888(tokenAddress).balanceOf(tokenId, this);
  }

  function acceptAbstractToken_(uint _value) internal returns(bool) {
    return IERC888(tokenAddress).transferFrom(tokenId, msg.sender, this, _value);
  }

  function releaseAbstractToken_(address _for, uint _value) internal returns(bool) {
    return IERC888(tokenAddress).transfer(tokenId, _for, _value);
  }

  function setERC888Token_(address _tokenAddress, uint _tokenId) internal returns(bool) {
    tokenAddress = _tokenAddress;
    tokenId = _tokenId;
    return true;
  }

  function setERC888Token(address _tokenAddress, uint _tokenId) external returns(bool) {
    uint8 _role = getRole_();
    uint8 _state = getState_();
    require(_role == RL_ADMIN || _role == RL_PAYBOT);
    require(_state == ST_DEFAULT);
    return setERC888Token_(_tokenAddress, _tokenId);
  }
}