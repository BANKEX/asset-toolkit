pragma solidity ^0.4.23;
contract ICassette {
  function getCassetteSize_() internal view returns(uint);
  function acceptAbstractToken_(uint _value) internal returns(bool);
  function releaseAbstractToken_(address _for, uint _value) internal returns(bool);

}