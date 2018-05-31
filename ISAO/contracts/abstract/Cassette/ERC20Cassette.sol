pragma solidity ^0.4.23;
import "./ICassette.sol";
import "../../libs/token/ERC20/IERC20.sol";

contract ERC20Cassette is ICassette {
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


}