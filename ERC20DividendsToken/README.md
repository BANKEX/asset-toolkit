# ERC-20 Dividends Token

ERC-20 Dividends token is an implementation of standard ERC-20 with an ability to distribute funds received by smart-contract among token-holders. Dividend balance update happens at the time of receipt of ether at the contract. Token holder is responsible for transferring ether dividends from token contract to his own.

ERC-20 dividends token works the following way. Assume that there is a smart contract of a vending machine that sells coffee and has 100 tokens total. Three token-holders buy those tokens so that the first one has 50 tokens, the second and the third one have 30 and 20 tokens respectively.  

![name](../docs/images/image0.svg)

Now, imagine that a customer bought a huge amount of coffee for 10 Eth. Smart-contract receives these funds, and tokenholders get dividends that are distributed among them in proportion to their contribution. After that tokenholders are able to release their dividends and get ethers using *`releaseDividendsRights`* function.  So, tokenholder 1 can receive 5 Eth, tokenholder 2 can receives 3 Eth, and tokenholder 3 can receive 2 Eth.

![name](../docs/images/image1.svg)

Now, assume that tokenholder 1 transferred 25 of his tokens to tokenholder 2 using function *`transfer`*, thus changing the proportion of tokens distribution. Now tokenholder 1 has 25 tokens, and tokenholder 2 has 55 tokens. When another customer buys coffee for 10 Eth, tokenholder 1 receives 2.5 Eth as dividends, and tokenholder 2 receives 5.5 Eth. It’s important to mention that amount of dividends they had from the previous purchase doesn’t change - the first tokenholder has 5 Eth, and the second one has 3 Eth. 

![name](../docs/images/image2.svg)






# Documentation

https://bankex.github.io/ERC20DividendsToken/


# Deployment

Use `truffle migrate --network ganache` to  deploy contract on ganache.

Use 
```bash
geth --dev --rpccorsdomain="*" --rpcaddr="0.0.0.0" --rpc --rpcapi="personal,eth,net,debug,web3,db,admin" --networkid 7555  --dev.period=1
```
to setup remix compatible debug supporting test ethereum blockchain and `truffle migrate --network geth_dev` to deploy the contract.


Strictly recommended to use solium linter. `solium -d contracts`

If you have compilation errors due to `emit Event` in solidity, update truffle.