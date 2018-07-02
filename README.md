# Proof of Asset - smart contracts core

### About 
This repo contains the smart contracts library that we use in the asset tokenization products in BANKEX.
Contracts can be used in wide range of products including ICO.

Contacts covered with unit test and optimized by gas usage - we design it to be scalable on a significant amount of users.

We also provide demo web applications for the contacts that visualize workflow and main features.
You can quickly have a look on the video overview of the our demo apps [here](https://www.youtube.com/watch?v=sCebWDcFL0M&feature=youtu.behere). Production quiality video will be avalialbe soon. 

### Smart contacts
- ##### ISAO - Initial Smart Asset Offer
  
  Smart contact that allows you to collect funds for any ERC20 token in a transparent and convenient way, it supports common procedures and features like funding stairs and refunds.
  <p>Contract workflow:</p>
  
  ![state-sequence-diagram](https://artall64.github.io/tmp-isao-images/state-sequence-diagram-v2.svg)
  
  You can check demo project here: [https://isao.staging.bankex.team](https://isao.staging.bankex.team).
  Source code and detailed instructions as well as demo project source code you can find in `ISAO` subfolder.
  
  *Note: that contract is not for production usage, we going to make 100% unit test cover before we officially release it*
    
- ##### Multitoken - ERC888 Implemantation, with additional divedends payout feature
  That contract is [ERC888](https://github.com/ethereum/EIPs/issues/888) token implementation.
  Contract specification allows you to store and manage multiple ERC20 tokens inside of the single contract ERC888 contract.
  When you call ERC20 token method that stored inside ERC888, you additionally specifies Id of the ERC20 token.
  
  Our implementation also has an additional dividends payout feature. You can find the overview [here](https://blog.bankex.org/dividend-payout-bankex-tests-the-newest-token-standard-erc-888-aff5a1fb14eb).
  
  You can check the demo project here: [https://multitoken.bankex.team](https://isao.staging.bankex.team).
  Source code and detailed instructions as well as demo project source code you can find in `multi_token` subfolder.
    
- ##### ERC20 Dividends
  That is ERC20 token implementation that distributes funds received among participants.
  Dividend balance update happens at the time of receipt of ether at the contract.
  Token holder is responsible for transferring ether dividends from token contract to his own.
