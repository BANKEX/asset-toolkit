const ISAO = artifacts.require("./ISAOTest.sol");
const Token = artifacts.require("./TestToken.sol");

const web3 = global.web3;

const IERC20_ABI = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "spender",
                "type": "address"
            },
            {
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "from",
                "type": "address"
            },
            {
                "name": "to",
                "type": "address"
            },
            {
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "who",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "to",
                "type": "address"
            },
            {
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "owner",
                "type": "address"
            },
            {
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

const tbn = v => web3.toBigNumber(v);
const fbn = v => v.toString();
const tw = v => web3.toBigNumber(v).mul(1e18);
const fw = v => web3._extend.utils.fromWei(v).toString();


const TOKEN_SUPPLY = tw(900000);
const MINIMAL_DEPOSIT_SIZE = tw(0.05);
const TI_DAY = tbn(86400);

const ST_DEFAULT = tbn(0x00);
const ST_RAISING = tbn(0x01);
const ST_WAIT_FOR_ICO = tbn(0x02);
const ST_MONEY_BACK = tbn(0x04);
const ST_TOKEN_DISTRIBUTION = tbn(0x08);
const ST_FUND_DEPRECATED = tbn(0x10);

const TM_DEFAULT = tbn(0x00);
const TM_RAISING = tbn(0x01);
const TM_WAIT_FOR_ICO = tbn(0x02);
const TM_TOKEN_DISTRIBUTION = tbn(0x08);
const TM_FUND_DEPRECATED = tbn(0x10);

const RAISING_PERIOD = TI_DAY.mul(10);
const ICO_PERIOD = TI_DAY.mul(15);
const DISTRIBUTION_PERIOD = TI_DAY.mul(45);

const MINIMAL_FUND_SIZE = tw(0);
const MAXIMAL_FUND_SIZE = tw(100000);

const APPROVE_VALUE = TOKEN_SUPPLY;
const INVESTOR_SUM_PAY = tw(0.5);
const INVESTOR_SUM_TO_TRIGGER = tw(0.00001);

const RL_DEFAULT = tbn(0x00);
const RL_ADMIN = tbn(0x04);
const RL_PAYBOT = tbn(0x08);
const LIMITS = [tw(5), tw(15), tw(200)];
const COSTS = [tw(0.1), tw(0.2), tw(0.5)];

const gasPrice = tw("3e-7");

/**
 * Calculates totalShare and investors balances (in tokens)
 * @param {Object} investors contains accounts of investors
 * @param {Object} investorsSendSums contains sums in ETH which investors would send
 */
function calculateTokenBalances(investors, investorsSendSums) {
    let goodInvestorTokenBalance = {
        account3: tbn('0'),
        account4: tbn('0'),
        account5: tbn('0'),
        account6: tbn('0'),
        account7: tbn('0'),
        account8: tbn('0')
    };
    let goodTotalShare = tbn(0);
    let currentStage = 0;
    for (let i in investors) {
        let remainETHValue = investorsSendSums[i];
        while (tbn(remainETHValue).gt(0) && goodTotalShare.lte(LIMITS[LIMITS.length - 1])) {
            if (goodTotalShare.plus(remainETHValue.mul(1e18).div(COSTS[currentStage])).lte(LIMITS[currentStage])) {
                goodTotalShare = goodTotalShare.plus(remainETHValue.mul(1e18).div(COSTS[currentStage]));
                goodInvestorTokenBalance[i] = goodInvestorTokenBalance[i].plus(remainETHValue.mul(1e18).div(COSTS[currentStage]));
                remainETHValue = 0;
                if (goodTotalShare.eq(LIMITS[currentStage]))
                    currentStage++;
            } else {
                remainETHValue = remainETHValue.minus(LIMITS[currentStage].minus(goodTotalShare).mul(COSTS[currentStage]).div(1e18));
                goodInvestorTokenBalance[i] = goodInvestorTokenBalance[i].plus(LIMITS[currentStage].minus(goodTotalShare));
                goodTotalShare = goodTotalShare.plus(LIMITS[currentStage].minus(goodTotalShare));
                currentStage++;
            }
        }
    }

    return {
        goodTotalShare: goodTotalShare,
        goodInvestorTokenBalance: goodInvestorTokenBalance
    }
}


contract('ISAO COMMON TEST', (accounts) => {
    const ADMIN = accounts[0];
    const PAYBOT = accounts[1];
    const ERC20_CREATOR = accounts[0];

    const investors = {
        account3: accounts[3],
        account4: accounts[4],
        account5: accounts[5],
        account6: accounts[6],
        account7: accounts[7],
        account8: accounts[8]
    };

    beforeEach(async function () {
        tokenLocal = await Token.new(TOKEN_SUPPLY, {
            from: ERC20_CREATOR
        });
        share = await ISAO.new(
            RAISING_PERIOD, DISTRIBUTION_PERIOD,
            MINIMAL_FUND_SIZE, LIMITS, COSTS, MINIMAL_DEPOSIT_SIZE,
            ADMIN, PAYBOT
        );
    });

    describe('NEGATIVE TEST', () => {
        it("should try to send ETH when fund has been already collected", async function () {
            let investorsSendSums = {
                account3: tw('0.5'),
                account4: tw('2'),
                account5: tw('23.125'),
                account6: tw('23.125'),
                account7: tw('23.125'),
                account8: tw('23.125')
            };
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ADMIN});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
            await share.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors)
                await  share.buyShare({value: investorsSendSums[i], from: investors[i]});
            let state = await share.getState();
            assert(state.eq(ST_TOKEN_DISTRIBUTION));
            try {
                await share.buyShare({value: tw('1'), from: investors.account3});
                console.log('ERROR')
            } catch (e) {
                assert(e);
            }
        });

        it("should admin sends tokens to ISAO => invest => first investor gets 50% their share => refund some investors shares => admin gets back 50% his share in ETH => admin sends tokens to ISAO => all investors gets their remain share", async function () {
            // First part that will be sent
            let approveValue1 = TOKEN_SUPPLY.divToInt(2e2);
            // Second part that will be sent
            let approveValue2 = TOKEN_SUPPLY.minus(approveValue1);
            // ETH that investor will send to contract
            let investorsSendSums = {
                // Sending this value we get current max amount of tokens
                account3: approveValue1.mul(COSTS[0]).divToInt(1e18),
                account4: tw('1.2231221'),
                account5: tw('0.123242423452423'),
                account6: tw('9.999919999999999'),
                account7: tw('1.2131203131'),
                account8: tw('20.555155555555554')
            };
            // admin part in ETH
            let adminShare = tbn(0);
            //
            for (let i in investors) {
                //
                adminShare = adminShare.plus(investorsSendSums[i]);
            }
            // object with calculated amounts of investors token balances and total amount of tokens
            let goodValues = calculateTokenBalances(investors, investorsSendSums);
            // total amount of tokens
            let goodTotalShare = goodValues.goodTotalShare;
            // balances of investors in tokens
            let goodInvestorTokenBalance = goodValues.goodInvestorTokenBalance;
            // amount of tokens to money back
            let firstInvestorMoneyBack = (goodInvestorTokenBalance.account3).divToInt('2');
            // amount of eth to money back
            let firstInvestorMoneyBackInETH = firstInvestorMoneyBack.mul(COSTS[0]).div('1e18');
            // approve first part of tokens to ISAO
            await tokenLocal.approve(share.address, approveValue1, {from: ERC20_CREATOR});
            // get amount of tokens that was approved
            let allowance = await tokenLocal.allowance(ERC20_CREATOR, share.address);
            // check that amounts are correct
            assert(allowance.eq(approveValue1));
            // just say to ISAO that token local is target token
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            // get this address
            let tokenAddress = await share.tokenAddress();
            // // check that token address == token local address
            assert(tbn(tokenAddress).eq(tokenLocal.address));
            // accept firs portion of tokens
            await share.acceptAbstractToken(approveValue1, {from: ADMIN});
            // get balance of ISAO in tokens
            let ISAOTokenBalance = await tokenLocal.balanceOf(share.address);
            // check that accept function works fine
            assert(ISAOTokenBalance.eq(approveValue1));
            // set Raising state
            console.log((await tokenLocal.balanceOf(share.address)).toString());
            console.log((await share.getMaximalFundSize()).toString());
            await share.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors) {
                // send eth from investors to account
                await share.sendTransaction({value: investorsSendSums[i], from: investors[i]});
                // get balance of token from ISAO
                let investorTokenBalance = await share.getBalanceTokenOf(investors[i]);
                // check that calculated balance equals to isao token balance of investor
                assert(investorTokenBalance.eq(goodInvestorTokenBalance[i]));
            }
            // balance of investor 3 in eth before refund
            let investorBalanceBefore = web3.eth.getBalance(investors.account3);
            // refund investors 3 sum by force by admin
            await share.refundShareForce(investors.account3, firstInvestorMoneyBack, {from: ADMIN});
            // balance of investor 3 i in eth after refund
            let investorBalanceAfter = web3.eth.getBalance(investors.account3);
            // check that refund operation was correct
            assert(investorBalanceAfter.eq(investorBalanceBefore.plus(firstInvestorMoneyBackInETH)));
            // calculated balance fix
            goodInvestorTokenBalance.account3 = (goodInvestorTokenBalance.account3).minus(firstInvestorMoneyBack);
            // calculated total amounts of token fix
            goodTotalShare = goodTotalShare.minus(firstInvestorMoneyBack);
            // set Distribution state
            await share.setState(ST_TOKEN_DISTRIBUTION, {from: ADMIN});
            // get balance before admin release ether to stakeholder
            let adminBalanceBefore = await web3.eth.getBalance(ADMIN);
            // release amount of ETH to admin
            let tx = await share.releaseEtherToStakeholderForce(RL_ADMIN, adminShare.divToInt(2), {from: ADMIN, gasPrice: gasPrice});
            // amount of gas that admin spent
            let gasCost1 = gasPrice.mul(tx.receipt.gasUsed);
            // get balance after admin release ether to stakeholder
            let adminBalanceAfter = await web3.eth.getBalance(ADMIN);
            // check that admin has correct balance after release
            assert(adminBalanceAfter.eq(adminBalanceBefore.plus(adminShare.divToInt(2)).minus(gasCost1)));
            // amount of tokens to release by investor
            let firstInvestorReleaseAmount = goodInvestorTokenBalance.account3.divToInt(2);
            // release tokens to investor
            await share.releaseToken(firstInvestorReleaseAmount, {from: investors.account3});
            // balance of tokens of investor on erc20 contract
            let investorTokenBalance = await tokenLocal.balanceOf(investors.account3);
            // check that calculated sum is correct and investor has it
            assert(investorTokenBalance.eq(firstInvestorReleaseAmount));
            // approve next portion of tokens to investor
            await tokenLocal.approve(share.address, approveValue2, {from: ERC20_CREATOR});
            // get allowed sum to spend by ISAO
            let allowance1 = await tokenLocal.allowance(ERC20_CREATOR, share.address);
            // check that approve works fine
            assert(allowance1.eq(approveValue2));
            // accept next portion of tokens
            await share.acceptAbstractToken(approveValue2, {from: ADMIN});
            // get balance of ISAO in tokens
            let ISAOTokenBalance1 = await tokenLocal.balanceOf(share.address);
            // check that token balance now is equal to balance of 2 approved values - amount that investor released
            assert(ISAOTokenBalance1.eq(approveValue1.plus(approveValue2).minus(firstInvestorReleaseAmount)));
            for (let i in investors) {
                // buy tokens (send ETH) to ISAO
                await share.sendTransaction({value: tw('0.0001'), from: investors[i]});
                // balance of current investor from calculated sums
                let goodTokenBalance = goodInvestorTokenBalance[i];
                // get balance of current investor from erc20 token
                let tokenBalance = await tokenLocal.balanceOf(investors[i]);
                // check that calculated sum was correct and equals to erc20 sum
                assert(tokenBalance.eq(goodTokenBalance));
            }
        });
    });
});


