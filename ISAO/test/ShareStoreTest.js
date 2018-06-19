const ShareStoreTest = artifacts.require("./ShareStoreTest.sol");
const Token = artifacts.require("./TestToken.sol");

const web3 = global.web3;

const IERC20_ABI = [{
        "constant": false,
        "inputs": [{
                "name": "spender",
                "type": "address"
            },
            {
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [{
            "name": "",
            "type": "bool"
        }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
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
        "outputs": [{
            "name": "",
            "type": "bool"
        }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
            "name": "who",
            "type": "address"
        }],
        "name": "balanceOf",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{
                "name": "to",
                "type": "address"
            },
            {
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [{
            "name": "",
            "type": "bool"
        }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{
                "name": "owner",
                "type": "address"
            },
            {
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

const tbn = v => web3.toBigNumber(v);
const fbn = v => v.toString();
const tw = v => web3.toBigNumber(v).mul(1e18);
const fw = v => web3._extend.utils.fromWei(v).toString();


const TOKEN_SUPPLY = tw(1000000);
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

const MINIMAL_FUND_SIZE = tw(1);
const MAXIMAL_FUND_SIZE = tw(100000);

const APPROVE_VALUE = TOKEN_SUPPLY;
const INVESTOR_SUM_PAY = tw(0.6);
const INVESTOR_SUM_TO_TRIGGER = tw(0.00001);

const RL_DEFAULT = tbn(0x00);
const RL_ADMIN = tbn(0x04);
const RL_PAYBOT = tbn(0x08);

const LIMITS = [tw(5), tw(15), tw(30)];
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

contract('ShareStore COMMON TEST', (accounts) => {
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
        share = await ShareStoreTest.new(
            MINIMAL_FUND_SIZE,
            MINIMAL_DEPOSIT_SIZE,
            LIMITS,
            COSTS, {
                from: ADMIN
            }
        );
    });

    it("should set token to ISAO", async function () {
        await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
        await share.setERC20Token(tokenLocal.address, {from: ADMIN});
        let tokenAddress = await share.tokenAddress();
        assert(tbn(tokenAddress).eq(tokenLocal.address));
    })

    it("should send ERC20 tokens to ISAO", async function () {
        await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
        await share.setERC20Token(tokenLocal.address, {from: ADMIN});
        await share.acceptAbstractToken(TOKEN_SUPPLY, {from: ADMIN});
        let ISAOTokenBalance = await tokenLocal.balanceOf(share.address);
        assert(ISAOTokenBalance.eq(APPROVE_VALUE));
    })

    it("should invest ETH during ST_RAISING period via transaction send", async function () {
        let countOfInvestors = Object.keys(investors).length;
        let investorsSendSums = {
            account3: INVESTOR_SUM_PAY,
            account4: INVESTOR_SUM_PAY,
            account5: INVESTOR_SUM_PAY,
            account6: INVESTOR_SUM_PAY,
            account7: INVESTOR_SUM_PAY,
            account8: INVESTOR_SUM_PAY
        }
        let goodValues = calculateTokenBalances(investors, investorsSendSums);
        let goodTotalShare = goodValues.goodTotalShare;
        let goodInvestorTokenBalance = goodValues.goodInvestorTokenBalance;
        await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
        await share.setERC20Token(tokenLocal.address, {from: ADMIN});
        await share.acceptAbstractToken(TOKEN_SUPPLY, {from: ADMIN});
        await share.setState(ST_RAISING, {from: ADMIN});
        for (let i in investors) {
            await share.sendTransaction({value: investorsSendSums[i], from: investors[i]});
            let goodTokenBalance = goodInvestorTokenBalance[i];
            let tokenBalance = await share.getBalanceTokenOf(investors[i]);
            assert(tokenBalance.eq(goodTokenBalance));
        }
        let totalShare = await share.totalShare();
        assert(totalShare.eq(goodTotalShare));
    })

    it("should invest ETH during ST_RAISING period via buyShare func call", async function () {
        let investorsSendSums = {
            account3: INVESTOR_SUM_PAY,
            account4: INVESTOR_SUM_PAY,
            account5: INVESTOR_SUM_PAY,
            account6: INVESTOR_SUM_PAY,
            account7: INVESTOR_SUM_PAY,
            account8: INVESTOR_SUM_PAY
        }
        let goodValues = calculateTokenBalances(investors, investorsSendSums);
        let goodTotalShare = goodValues.goodTotalShare;
        let goodInvestorTokenBalance = goodValues.goodInvestorTokenBalance;
        await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
        await share.setERC20Token(tokenLocal.address, {from: ADMIN});
        await share.acceptAbstractToken(TOKEN_SUPPLY, {from: ADMIN});
        await share.setState(ST_RAISING, {from: ADMIN});
        for (let i in investors) {
            await share.buyShare({value: investorsSendSums[i], from: investors[i]});
            let goodTokenBalance = goodInvestorTokenBalance[i];
            let tokenBalance = await share.getBalanceTokenOf(investors[i]);
            assert(tokenBalance.eq(goodTokenBalance));
        }
        let totalShare = await share.totalShare();
        assert(totalShare.eq(goodTotalShare));
    })

    it("should get all sent ETH by investors to ADMIN during ST_TOKEN_DISTRIBUTION period", async function () {
        let totalSendETH = INVESTOR_SUM_PAY.mul(Object.keys(investors).length);
        await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
        await share.setERC20Token(tokenLocal.address, {from: ADMIN});
        await share.acceptAbstractToken(TOKEN_SUPPLY, {from: ADMIN});
        await share.setState(ST_RAISING, {from: ADMIN});
        for (let i in investors) 
            await share.buyShare({value: INVESTOR_SUM_PAY, from: investors[i]});
        await share.setState(ST_TOKEN_DISTRIBUTION, {from: ADMIN});
        let adminBalanceBefore = await web3.eth.getBalance(ADMIN);
        let tx = await share.releaseEtherToStakeholderForce(RL_ADMIN, totalSendETH, {from: ADMIN, gasPrice: gasPrice});
        let gasCost = gasPrice.mul(tx.receipt.gasUsed);
        let adminBalanceAfter = await web3.eth.getBalance(ADMIN);
        assert(adminBalanceAfter.eq(adminBalanceBefore.plus(totalSendETH).minus(gasCost)));
    })

    it("should get all share in tokens by investors during ST_TOKEN_DISTRIBUTION period by transaction send", async function () {
        let investorsSendSums = {
            account3: INVESTOR_SUM_PAY,
            account4: INVESTOR_SUM_PAY,
            account5: INVESTOR_SUM_PAY,
            account6: INVESTOR_SUM_PAY,
            account7: INVESTOR_SUM_PAY,
            account8: INVESTOR_SUM_PAY
        }
        let goodValues = calculateTokenBalances(investors, investorsSendSums);
        let goodTotalShare = goodValues.goodTotalShare;
        let goodInvestorTokenBalance = goodValues.goodInvestorTokenBalance;
        await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
        await share.setERC20Token(tokenLocal.address, {from: ADMIN});
        await share.acceptAbstractToken(TOKEN_SUPPLY, {from: ADMIN});
        await share.setState(ST_RAISING, {from: ADMIN});
        for (let i in investors) 
            await share.buyShare({value: investorsSendSums[i], from: investors[i]});
        await share.setState(ST_TOKEN_DISTRIBUTION, {from: ADMIN});
        for (let i in investors) {
            await share.sendTransaction({value: tw(0.0001), from: investors[i]});
            let goodTokenBalance = goodInvestorTokenBalance[i];
            let tokenBalance = await tokenLocal.balanceOf(investors[i]);
            assert(tokenBalance.eq(goodTokenBalance));
        }
        let totalSupply = await tokenLocal.totalSupply();
        let remainTokens = await tokenLocal.balanceOf(share.address);
        assert(remainTokens.eq(totalSupply.minus(goodTotalShare)));
    })

    it("should get all share in tokens by investors during ST_TOKEN_DISTRIBUTION period by releaseToken func call", async function () {
        let investorsSendSums = {
            account3: INVESTOR_SUM_PAY,
            account4: INVESTOR_SUM_PAY,
            account5: INVESTOR_SUM_PAY,
            account6: INVESTOR_SUM_PAY,
            account7: INVESTOR_SUM_PAY,
            account8: INVESTOR_SUM_PAY
        }
        let goodValues = calculateTokenBalances(investors, investorsSendSums);
        let goodTotalShare = goodValues.goodTotalShare;
        let goodInvestorTokenBalance = goodValues.goodInvestorTokenBalance;
        await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
        await share.setERC20Token(tokenLocal.address, {from: ADMIN});
        await share.acceptAbstractToken(TOKEN_SUPPLY, {from: ADMIN});
        await share.setState(ST_RAISING, {from: ADMIN});
        for (let i in investors) 
            await share.buyShare({value: investorsSendSums[i], from: investors[i]});
        await share.setState(ST_TOKEN_DISTRIBUTION, {from: ADMIN});
        for (let i in investors) {
            let investorTokenBalance = await share.getBalanceTokenOf(investors[i]);
            await share.releaseToken(investorTokenBalance, {from: investors[i]});
            let goodTokenBalance = goodInvestorTokenBalance[i];
            let tokenBalance = await tokenLocal.balanceOf(investors[i]);
            assert(tokenBalance.eq(goodTokenBalance));
        }
        let totalSupply = await tokenLocal.totalSupply();
        let remainTokens = await tokenLocal.balanceOf(share.address);
        assert(remainTokens.eq(totalSupply.minus(goodTotalShare)));
    })

    it("should get all share in tokens by investors during ST_TOKEN_DISTRIBUTION period by releaseTokenForce func call", async function () {
        let investorsSendSums = {
            account3: INVESTOR_SUM_PAY,
            account4: INVESTOR_SUM_PAY,
            account5: INVESTOR_SUM_PAY,
            account6: INVESTOR_SUM_PAY,
            account7: INVESTOR_SUM_PAY,
            account8: INVESTOR_SUM_PAY
        }
        let goodValues = calculateTokenBalances(investors, investorsSendSums);
        let goodTotalShare = goodValues.goodTotalShare;
        let goodInvestorTokenBalance = goodValues.goodInvestorTokenBalance;
        await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
        await share.setERC20Token(tokenLocal.address, {from: ADMIN});
        await share.acceptAbstractToken(TOKEN_SUPPLY, {from: ADMIN});
        await share.setState(ST_RAISING, {from: ADMIN});
        for (let i in investors) 
            await share.buyShare({value: investorsSendSums[i], from: investors[i]});
        await share.setState(ST_TOKEN_DISTRIBUTION, {from: ADMIN});
        for (let i in investors) {
            let investorTokenBalance = await share.getBalanceTokenOf(investors[i]);
            await share.releaseTokenForce(investors[i], investorTokenBalance, {from: ADMIN});
            let goodTokenBalance = goodInvestorTokenBalance[i];
            let tokenBalance = await tokenLocal.balanceOf(investors[i]);
            assert(tokenBalance.eq(goodTokenBalance));
        }
        let totalSupply = await tokenLocal.totalSupply();
        let remainTokens = await tokenLocal.balanceOf(share.address);
        assert(remainTokens.eq(totalSupply.minus(goodTotalShare)));
    })
});

contract('ShareStore NEGATIVE TEST', (accounts) => {

});

contract('ShareStore CALC TEST', (accounts) => {

});


contract('ShareStore OVERDRAFT TEST', (accounts) => {});