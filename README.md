# Proof of Asset smart contracts core

### About 
This repo contains smart contracts library that we use in the asset tokenization products in the BANKEX.
Nevertheless, contracts can be used in wide range of products including ICO.

Contacts covered with unit test and optimized by gas usage - we design it to be scalable on a significant amount of users.
We also provide demo web applications for the contacts that visualize workflow and main features.

### Smart contacts
- #####ISAO - Initial Smart Asset Offer
  Smart contact that allows you to collect funds for any ERC20 token in the transparent and convenient, it supports common procedures and features like funding stairs and refunds.
  <p>Contract workflow:</p>
  
  ![state-sequence-diagram](https://artall64.github.io/tmp-isao-images/state-sequence-diagram-v2.svg)
  
  You can check demo project here: [https://isao.staging.bankex.team](https://isao.staging.bankex.team).
  Source code and detailed instructions as well as demo project source code you can find in `ISAO` subfolder.
    
- #####Multitoken - ERC888 Implemantation, with additional divedends payout feature
  That contact is [ERC888](https://github.com/ethereum/EIPs/issues/888) token implementation.
  It allows you to store and manage multiple ERC20 tokens in the single contract.
  Our implementation also has additional dividend payout feature.
  You can find it overview it this [blog post](https://blog.bankex.org/dividend-payout-bankex-tests-the-newest-token-standard-erc-888-aff5a1fb14eb).
  
  You can check demo project here: [https://multitoken.bankex.team](https://isao.staging.bankex.team).
  Source code and detailed instructions as well as demo project source code you can find in `multi_token` subfolder.
    
- #####ERC20 Dividends
  That is ERC20 token implementation that distributes funds received among participants.
  Dividend balance update happens at the time of receipt of ether at the contract.
  Token holder is responsible for transferring ether dividends from token contract to his own.
