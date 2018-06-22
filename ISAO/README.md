## WIP. Not for production usage. This is still alpha.

# ISAO Smart Contract

## About

This repo contains well tested Ethereum smart contract that is used in the services of BANKEX and also useful for all the people who want to perform their own procedure of asset tokenization. It is available under <span style="color:red">SOME<span> license.

#### What is ISAO?

ISAO - Initial Smart Asset Offer is the procedure of issuance of security or utility tokens for the assets and is one of the core parts of BANKEX [proof of asset protocol](github or white pare). By assets we mean anything that has value or is able to generate cash flow. Despite ICO that attracts investments for RnD projects or similar, **ISAO is designed to tokenize the real world's assets**.

#### Supported Features

ISAO Smart contact allows to raise funding on any ERC20 token in several steps, with a different amount of the tokens supply and price on each step of ISAO. It also supports the following features:

- Minimal amount of ETH to become investor
- Minimal required funding  in order to consider ISAO successful
- Funding stairs
- Money back procedure in case when not enough ETH was raised
- Distribution stage
- Deprecated stage
- Testing contract

Features to be implemented:

- Sending of the funds to the owner of the asset rather than to the administrator
- Administrator's fee can be set as a fixed amount or an interest

## Quick Start

You can check demo project [https://isao.staging.bankex.team](https://isao.staging.bankex.team) and see its Github repo.

If you want to deploy your own contract in the Ethereum test network:

1) Clone this repo and run `npm install`, also you'll need `truffle` installed globally so check [instructions](https://github.com/trufflesuite/truffle) how to install it.

2) Register in https://infura.io/ and copy your API KEY. It will allows you to deploy the contract to the  Ethereum network without maintaining  the full node. 

3) Create .env file in the root folder with the next content:

```
ETH_KEY=PRIVATE_KEY # private key of your ethereum account
INFURA_TOKEN=TOKEN  # Infura API key
```

4) Use `truffle migrate --reset --network rinkeby`  or  ``truffle.cmd migrate --reset --network rinkeby` on windows. It will deploy ISAO contract and related ERC20 token contract on rinkeby testnet. All the required parameters such as `RAISING_PERIOD ` and `MINIMAL_FUND_SIZE ` will be setup in the migration script  that you can find in `./migrations/2_isao_test.js` file.

*Note: Deploy can take more than 0.5 ETH in the testnet, so be sure you have enough test ether on you account.*

5) Find ISAO contract address in the console output:

```Address of ERC20 token: 0xf23a25c06d8b30134e82755910945ecd4d4a709d
Address of ERC20 token: --- You'll find address here ---
Address of ISAO: --- You'll address here ---
```

Now you have instance of the test contract deployed in the test network, you can play around with it using *remix* and *remixd*. Notes: 

* For *remixd* set `./contracts` folder as shared folder for *remixd*.
* **Important**! Migration by default deploys **testing** contract that allows to change time internal time for testing purposes. To get access to testing features select and compile *ISAOTest.sol* file in the *Remix IDE*



## Roles in ISAO

The main participants in the procedure of ISAO are originator (asset owner), administrator and shareholders. The contract contains only the following roles not including the originator:

1. DEFAULT - shareholder, It refers to the `RL_DEFAULT` constant in the code. 
2. ADMIN  - manager who creates the contract and gets the interest from ISAO. It refers to the `RL_ADMIN` constant in the code. 
3. PAYBOT -  it’s another account of ADMIN, designed to help automate things, the only difference is that bot can't take funds from deprecated contract. It refers to the `RL_PAYBOT` constant in the code. 



## Funding Stairs



## Sequence of states

From the moment of creation, the contract goes through the following state sequence:

![state-sequence-diagram](C:\Users\artem\Desktop\readme\state-sequence-diagram.PNG)

##### 1. Contract deployment 

![deploy](C:\Users\artem\Desktop\readme\deploy.PNG )

Initially administrator of the ISAO should deploy contract to the Ethereum network. For the production deploy you can use `truffle migrate --prod --network YOUR_NETWORK ` . You also also deploy contract with a factory contract as it done in our [demo project (linke to the line in the source code)](link to the demo);

Important thing that administrator should set specify next parameters at the deployment stage:

- Raising and Distribution periods

- Minimal fund size ( soft cap )

  *Note: you should specify it in the tokens, so if you know minimal amount of ETH you want raise, you need to calculated amount of tokens according to your funding stairs*

- Limits of tokens and prices on each stage that define funding stairs

  *Note: this parameters together define hard cap*

- Minimal deposit for the investor

- Admin and paybot address

You can check constructor signature to see the details. Also you can see example of testing contract creation in `./migrations/2_isao_test.js` file. It assign sample values to all the required parameters;

After deployment the contract gets `DEFAULT` state. In the code you can find `ST_DEFAULT = 0x00 ` and `TST_DEFAULT = 0x00 ` which is the same, just `TST_DEFAULT`  is used in the test contact version.



##### 2. Change state from DEFAULT  to RAISING

![deploy-to-raising](C:\Users\artem\Desktop\readme\deploy-to-raising.PNG)

###### DEFAULT STATE

In state parameters of the ISAO contact are set and can't be changed, except related ERC20 token address. In order to set it you need to call `setERC20Token` method on ISAO contract. This method is defined  in the base `ERC20Cassette ` contract.

The following requirements must be met before administrator will be able to change state to RAISING:

- Related ERC20 token is set in the ISAO contract
- ISAO contact have enough supply of related ERC20 token

Administrator or paybot call `setState` method and pass `ST_RAISING = 0x01 ` as an argument.

###### RAISING STATE

At that state investors can by tokens by sending ETH to the contract or calling payable `BuyShare ` function, it will assign proper number of tokens according with funding stage in the internal ISAO token balance storage.




##### 3. Change state from RASING to DISTRIBTUION or MONET_BACK

![raising-to-distribution-or-money-back](C:\Users\artem\Desktop\readme\raising-to-distribution-or-money-back.PNG)



Raising period can be stopped by one of the following reasons:

- When the hard cap is raised the contract automatically goes into the `DISTRIBUTION` state
- When the soft cap hasn't been collected during the raising period, the contact goes into the `MONEY_BACK` state
- When the soft cap is raised and administrator changes the contact state into `DISTRIBUTION`
- At any moment before the hard cap is raised, administrator has the right to change the contract's state into `MONEY_BACK` even soft cap is raised.

The distribution period starts when the contract gets into `DISTRIBUTION` or `MONEY_BACK` state. 

Duration of the distribution period is set in the constructor at the moment of contract creation 



###### DISTRIBTUTION STATE

In the DISTRIBUTION state investors should transfer tokens they bought from the ISAO contract to they own wallets. They can do it either:

- By calling payable function on the contact. In that case all the tokens will be transferred to the caller account. If caller pay any ETH with transaction ISAO contract return it back;
- By calling `releaseToken` function. In that case caller should specify amount of tokens that he want to transfer to his account.

Administrator or paybot can force distribution by transfer tokens to the owners, they can do that by calling `releaseTokenForce ` method.

Also, at that state administrator can take raised during ISAO by calling `releaseEtherToStakeholderForce` method on the contract. 

*Note: at the moment that readme was written, administrator is only one of possible stakeholders of ISAO. We going to add asset owner in the future.*



###### MONEY_BACK STATE

In the MONEY_BACK state investors should request back ETH they. They can do it either:

- By calling payable function on the contact. In that case all the ETH will be transferred to the caller account. If caller pay any ETH with transaction ISAO contract return it back;

- By calling `refundShare` function. In that case caller should specify amount of tokens that he want to refund back to ETH to his account.

  

##### 4. Change state from DISTRIBUTION or MONEY_BACK to DEPRECATED

![distribution-or-money-back-to-deprecated](C:\Users\artem\Desktop\readme\distribution-or-money-back-to-deprecated.PNG)

When distribution period ends, contract automatically changes its state DEPRECATED. 

###### DEPRECATED STATE

In that state administrator can take unclaimed funds of the ISAO contract, such as ETH and related ERC20 token as well as any token that belongs to contract.

See documentation at https://bankex.github.io/isao-contract/