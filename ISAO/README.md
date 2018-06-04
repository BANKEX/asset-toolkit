## WIP. Not for production usage. This is still alpha.

See documentation at https://bankex.github.io/isao-contract/


## Abstract

This is smart contract for initial smart asset offering (isao). See contract source at /contracts/production/ISAOProd/ISAOProd.sol .

Smart asset offering occurs in two stages: raising and token distrubution. At first stage investors send ether to contract and buy rights to get tokens. If the contract does not reach the minimal value of collected ether during raising time, investors can refund their ether back. If it reaches, we wait until raising time will be over (or admin switch contract to token distribution mode manually, or it reaches hard cap), after that investors can use their rights and get their tokens