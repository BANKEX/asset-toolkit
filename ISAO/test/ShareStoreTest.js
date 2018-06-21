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
const ST_MONEY_BACK = tbn(0x04);
const ST_TOKEN_DISTRIBUTION = tbn(0x08);
const ST_FUND_DEPRECATED = tbn(0x10);

const TM_DEFAULT = tbn(0x00);
const TM_RAISING = tbn(0x01);
const TM_WAIT_FOR_ICO = tbn(0x02);
const TM_TOKEN_DISTRIBUTION = tbn(0x08);
const TM_FUND_DEPRECATED = tbn(0x10);

const RAISING_PERIOD = TI_DAY.mul(10);
const DISTRIBUTION_PERIOD = TI_DAY.mul(45);

const MINIMAL_FUND_SIZE = tw(0.1);
const MAXIMAL_FUND_SIZE = tw(100000);

const APPROVE_VALUE = TOKEN_SUPPLY;
const INVESTOR_SUM_PAY = tw(0.6);
const INVESTOR_SUM_TO_TRIGGER = tw(0.00001);

const RL_DEFAULT = tbn(0x00);
const RL_ADMIN = tbn(0x04);
const RL_PAYBOT = tbn(0x08);

const LIMITS = [tw(5), tw(15), tw(300)];
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

contract('ShareStore', (accounts) => {
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

    describe('COMMON TEST', () => {
        it("should set token to ISAO", async function () {
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            let tokenAddress = await share.tokenAddress();
            assert(tbn(tokenAddress).eq(tokenLocal.address));
        });

        it("should send ERC20 tokens to ISAO", async function () {
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
            let ISAOTokenBalance = await tokenLocal.balanceOf(share.address);
            assert(ISAOTokenBalance.eq(APPROVE_VALUE));
        });

        it("should invest ETH during ST_RAISING period via transaction send", async function () {
            let investorsSendSums = {
                account3: INVESTOR_SUM_PAY,
                account4: INVESTOR_SUM_PAY,
                account5: INVESTOR_SUM_PAY,
                account6: INVESTOR_SUM_PAY,
                account7: INVESTOR_SUM_PAY,
                account8: INVESTOR_SUM_PAY
            };
            let goodValues = calculateTokenBalances(investors, investorsSendSums);
            let goodTotalShare = goodValues.goodTotalShare;
            let goodInvestorTokenBalance = goodValues.goodInvestorTokenBalance;
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
            await share.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors) {
                await share.sendTransaction({value: investorsSendSums[i], from: investors[i]});
                let goodTokenBalance = goodInvestorTokenBalance[i];
                let tokenBalance = await share.getBalanceTokenOf(investors[i]);
                assert(tokenBalance.eq(goodTokenBalance));
            };
            let totalShare = await share.totalShare();
            assert(totalShare.eq(goodTotalShare));
        });

        it("should invest ETH during ST_RAISING period via buyShare func call", async function () {
            let investorsSendSums = {
                account3: INVESTOR_SUM_PAY,
                account4: INVESTOR_SUM_PAY,
                account5: INVESTOR_SUM_PAY,
                account6: INVESTOR_SUM_PAY,
                account7: INVESTOR_SUM_PAY,
                account8: INVESTOR_SUM_PAY
            };
            let goodValues = calculateTokenBalances(investors, investorsSendSums);
            let goodTotalShare = goodValues.goodTotalShare;
            let goodInvestorTokenBalance = goodValues.goodInvestorTokenBalance;
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
            await share.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors) {
                await share.buyShare({value: investorsSendSums[i], from: investors[i]});
                let goodTokenBalance = goodInvestorTokenBalance[i];
                let tokenBalance = await share.getBalanceTokenOf(investors[i]);
                assert(tokenBalance.eq(goodTokenBalance));
            }
            let totalShare = await share.totalShare();
            assert(totalShare.eq(goodTotalShare));
        });

        it("should get all sent ETH by investors to ADMIN during ST_TOKEN_DISTRIBUTION period", async function () {
            let totalSendETH = INVESTOR_SUM_PAY.mul(Object.keys(investors).length);
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
            await share.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors) 
                await share.buyShare({value: INVESTOR_SUM_PAY, from: investors[i]});
            await share.setState(ST_TOKEN_DISTRIBUTION, {from: ADMIN});
            let adminBalanceBefore = await web3.eth.getBalance(ADMIN);
            let tx = await share.releaseEtherToStakeholderForce(RL_ADMIN, totalSendETH, {from: ADMIN, gasPrice: gasPrice});
            let gasCost = gasPrice.mul(tx.receipt.gasUsed);
            let adminBalanceAfter = await web3.eth.getBalance(ADMIN);
            assert(adminBalanceAfter.eq(adminBalanceBefore.plus(totalSendETH).minus(gasCost)));
        });

        it("should get all share in tokens by investors during ST_TOKEN_DISTRIBUTION period by transaction send", async function () {
            let investorsSendSums = {
                account3: INVESTOR_SUM_PAY,
                account4: INVESTOR_SUM_PAY,
                account5: INVESTOR_SUM_PAY,
                account6: INVESTOR_SUM_PAY,
                account7: INVESTOR_SUM_PAY,
                account8: INVESTOR_SUM_PAY
            };
            let goodValues = calculateTokenBalances(investors, investorsSendSums);
            let goodTotalShare = goodValues.goodTotalShare;
            let goodInvestorTokenBalance = goodValues.goodInvestorTokenBalance;
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
            await share.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors) 
                await share.buyShare({value: investorsSendSums[i], from: investors[i]});
            await share.setState(ST_TOKEN_DISTRIBUTION, {from: ADMIN});
            for (let i in investors) {
                await share.sendTransaction({value: tw(0.0001), from: investors[i]});
                let goodTokenBalance = goodInvestorTokenBalance[i];
                let tokenBalance = await tokenLocal.balanceOf(investors[i]);
                assert(tokenBalance.eq(goodTokenBalance));
            };
            let totalSupply = await tokenLocal.totalSupply();
            let remainTokens = await tokenLocal.balanceOf(share.address);
            assert(remainTokens.eq(totalSupply.minus(goodTotalShare)));
        });

        it("should get all share in tokens by investors during ST_TOKEN_DISTRIBUTION period by releaseToken func call", async function () {
            let investorsSendSums = {
                account3: INVESTOR_SUM_PAY,
                account4: INVESTOR_SUM_PAY,
                account5: INVESTOR_SUM_PAY,
                account6: INVESTOR_SUM_PAY,
                account7: INVESTOR_SUM_PAY,
                account8: INVESTOR_SUM_PAY
            };
            let goodValues = calculateTokenBalances(investors, investorsSendSums);
            let goodTotalShare = goodValues.goodTotalShare;
            let goodInvestorTokenBalance = goodValues.goodInvestorTokenBalance;
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
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
            };
            let totalSupply = await tokenLocal.totalSupply();
            let remainTokens = await tokenLocal.balanceOf(share.address);
            assert(remainTokens.eq(totalSupply.minus(goodTotalShare)));
        });

        it("should get all share in tokens by investors during ST_TOKEN_DISTRIBUTION period by releaseTokenForce func call", async function () {
            let investorsSendSums = {
                account3: INVESTOR_SUM_PAY,
                account4: INVESTOR_SUM_PAY,
                account5: INVESTOR_SUM_PAY,
                account6: INVESTOR_SUM_PAY,
                account7: INVESTOR_SUM_PAY,
                account8: INVESTOR_SUM_PAY
            };
            let goodValues = calculateTokenBalances(investors, investorsSendSums);
            let goodTotalShare = goodValues.goodTotalShare;
            let goodInvestorTokenBalance = goodValues.goodInvestorTokenBalance;
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
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
        });

        it("should get sent ETH back to investors during ST_MONEY_BACK period by transaction send", async function () {
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
            await share.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors) 
                await share.buyShare({value: INVESTOR_SUM_PAY, from: investors[i]});
            await share.setState(ST_MONEY_BACK, {from: ADMIN});
            for (let i in investors) {
                let balanceBefore = await web3.eth.getBalance(investors[i]);
                let tx = await share.sendTransaction({value: tw(0.001), from: investors[i], gasPrice: gasPrice});
                let gasCost = gasPrice.mul(tx.receipt.gasUsed);
                let balanceAfter = await web3.eth.getBalance(investors[i]);
                assert(balanceAfter.eq(balanceBefore.plus(INVESTOR_SUM_PAY).minus(gasCost)));
            }
        });

        it("should get sent ETH back to investors during ST_MONEY_BACK period by refundShare func call", async function () {
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
            await share.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors) 
                await share.buyShare({value: INVESTOR_SUM_PAY, from: investors[i]});
            await share.setState(ST_MONEY_BACK, {from: ADMIN});
            for (let i in investors) {
                let investorTokenBalance = await share.getBalanceTokenOf(investors[i]);
                let balanceBefore = await web3.eth.getBalance(investors[i]);
                let tx = await share.refundShare(investorTokenBalance, {from: investors[i], gasPrice: gasPrice});
                let gasCost = gasPrice.mul(tx.receipt.gasUsed);
                let balanceAfter = await web3.eth.getBalance(investors[i]);
                assert(balanceAfter.eq(balanceBefore.plus(INVESTOR_SUM_PAY).minus(gasCost)));
            }
        });

        it("should get sent ETH back to investors during ST_MONEY_BACK period by refundShareForce func call", async function () {
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
            await share.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors) 
                await share.buyShare({value: INVESTOR_SUM_PAY, from: investors[i]});
            await share.setState(ST_MONEY_BACK, {from: ADMIN});
            for (let i in investors) {
                let investorTokenBalance = await share.getBalanceTokenOf(investors[i]);
                let balanceBefore = await web3.eth.getBalance(investors[i]);
                let tx = await share.refundShareForce(investors[i], investorTokenBalance, {from: ADMIN});
                let gasCost = gasPrice.mul(tx.receipt.gasUsed);
                let balanceAfter = await web3.eth.getBalance(investors[i]);
                assert(balanceAfter.eq(balanceBefore.plus(INVESTOR_SUM_PAY)));
            }
        })

        it("should allow refundShareForce during RAISING period", async function () {
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
            await share.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors) 
                await share.buyShare({value: INVESTOR_SUM_PAY, from: investors[i]});;
            for (let i in investors) {
                let investorTokenBalance = await share.getBalanceTokenOf(investors[i]);
                let balanceBefore = await web3.eth.getBalance(investors[i]);
                let tx = await share.refundShareForce(investors[i], investorTokenBalance, {from: ADMIN});
                let gasCost = gasPrice.mul(tx.receipt.gasUsed);
                let balanceAfter = await web3.eth.getBalance(investors[i]);
                assert(balanceAfter.eq(balanceBefore.plus(INVESTOR_SUM_PAY)));
            }
        })

        it("should get all remain share in tokens by ADMIN during ST_FUND_DEPRECATED period", async function () {
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
            await share.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors) 
                await share.buyShare({value: INVESTOR_SUM_PAY, from: investors[i]});
            await share.setState(ST_TOKEN_DISTRIBUTION, {from: ADMIN});
            for (let i in investors) {
                await share.sendTransaction({value: tw(0.0001), from: investors[i]});
                break;
            };
            await share.setState(ST_FUND_DEPRECATED);
            let remainTokens = await tokenLocal.balanceOf(share.address);
            let adminTokenBalanceBefore = await tokenLocal.balanceOf(ADMIN);
            let data = web3.eth.contract(IERC20_ABI).at(tokenLocal.address).transfer.getData(ADMIN, remainTokens);
            await share.execute(tokenLocal.address, 0, data, {from: ADMIN, gasPrice: gasPrice});
            let adminTokenBalanceAfter = await tokenLocal.balanceOf(ADMIN);
            assert(adminTokenBalanceAfter.eq(adminTokenBalanceBefore.plus(remainTokens)));
        });

        it("should get all remain share in ETH by ADMIN during ST_FUND_DEPRECATED period", async function () {
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
            await share.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors) 
                await share.buyShare({value: INVESTOR_SUM_PAY, from: investors[i]});
            await share.setState(ST_TOKEN_DISTRIBUTION, {from: ADMIN});
            for (let i in investors) {
                await share.sendTransaction({value: tw(0.0001), from: investors[i]});
                break;
            };
            await share.setState(ST_FUND_DEPRECATED);
            let remainETH = await web3.eth.getBalance(share.address);
            let adminBalanceBefore = await web3.eth.getBalance(ADMIN);
            let tx = await share.execute(ADMIN, remainETH, 0, {from: ADMIN, gasPrice: gasPrice});
            let gasCost = gasPrice.mul(tx.receipt.gasUsed);
            let adminBalanceAfter = await web3.eth.getBalance(ADMIN);
            assert(adminBalanceAfter.eq(adminBalanceBefore.plus(remainETH).minus(gasCost)));
        });
    });


    describe('NEGATIVE TEST', () => {

    });

    describe('CALC TEST', () => {
        it("should send: 20 ERC20 tokens => 40 ERC20 tokens => 120 ERC20 tokens => 1e23 ERC20 tokens to ISAO", async function () {
            let approveSums = [tbn(20), tbn(40), tbn(120), tbn(1e23)];
            let goodTokenBalance = tbn(0);
            for (let i in approveSums) 
                goodTokenBalance = goodTokenBalance.plus(approveSums[i]);
            await tokenLocal.approve(share.address, goodTokenBalance, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            let currentTokenBalance = tbn(0);
            for (let i in approveSums) {
                await share.acceptAbstractToken(approveSums[i], {from: ADMIN});
                currentTokenBalance = currentTokenBalance.plus(approveSums[i]);
                let ISAOTokenBalance = await tokenLocal.balanceOf(share.address);
                assert(ISAOTokenBalance.eq(currentTokenBalance));
            }
            let ISAOTokenBalance = await tokenLocal.balanceOf(share.address);
            assert(ISAOTokenBalance.eq(goodTokenBalance));
        });

        it("should (invest ETH => refundShareForce) during ST_RAISING period", async function () {
            let investorsSendSums = {
                account3: tw('0.2'),
                account4: tw('1'),
                account5: tw('1.123242423432423'),
                account6: tw('2.111112111112221'),
                account7: tw('0.1111231232124324'),
                account8: tw('0.99999999999999')
            };
            let goodValues = calculateTokenBalances(investors, investorsSendSums);
            let goodTotalShare = goodValues.goodTotalShare;
            let goodInvestorTokenBalance = goodValues.goodInvestorTokenBalance;
            let investorsMoneyBackSumsInTokens = {
                account3: (goodInvestorTokenBalance.account3).divToInt('21123'),
                account4: (goodInvestorTokenBalance.account4).divToInt('1.23'),
                account5: (goodInvestorTokenBalance.account5).divToInt('911111'),
                account6: (goodInvestorTokenBalance.account6).divToInt('1231'),
                account7: (goodInvestorTokenBalance.account7).divToInt('23'),
                account8: (goodInvestorTokenBalance.account8).divToInt('111.2'),
            };
            let investorsMoneyBackSumsETH = {};
            for (let i in investors) 
                investorsMoneyBackSumsETH[i] = (investorsSendSums[i]).mul(investorsMoneyBackSumsInTokens[i]).divToInt(goodInvestorTokenBalance[i]);
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
            await share.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors) {
                await share.sendTransaction({value: investorsSendSums[i], from: investors[i]});
                let goodTokenBalance = goodInvestorTokenBalance[i];
                let tokenBalance = await share.getBalanceTokenOf(investors[i]);
                assert(tokenBalance.eq(goodTokenBalance));
            };
            for (let i in investors) {
                let balanceBefore = await web3.eth.getBalance(investors[i]);
                await share.refundShareForce(investors[i], investorsMoneyBackSumsInTokens[i], {from: ADMIN});
                goodTotalShare = goodTotalShare.minus(investorsMoneyBackSumsInTokens[i]);
                let balanceAfter = await web3.eth.getBalance(investors[i]);
                assert(balanceAfter.eq(balanceBefore.plus(investorsMoneyBackSumsETH[i])));
            }
            let totalShare = await share.totalShare();
            assert(totalShare.eq(goodTotalShare));
        });

        it("should admin sends tokens to ISAO => invest => first investor gets 50% their share => refund some investors shares => admin gets back 50% his share in ETH => admin sends tokens to ISAO => all investors gets their remain share", async function () {
            let approveValue1 = TOKEN_SUPPLY.divToInt(2e6);
            let approveValue2 = TOKEN_SUPPLY.minus(approveValue1);
            let investorsSendSums = {
                // Sending this value we get current max amount of tokens
                account3: approveValue1.mul(COSTS[0]).divToInt(1e18),
                account4: tw('1.2231221'),
                account5: tw('0.123242423452423'),
                account6: tw('9.999919999999999'),
                account7: tw('1.2131203131'),
                account8: tw('20.555155555555554')
            };

            let adminShare = tbn(0);
            for (let i in investors)
                adminShare = adminShare.plus(investorsSendSums[i]);
            let goodValues = calculateTokenBalances(investors, investorsSendSums);
            let goodTotalShare = goodValues.goodTotalShare;
            let goodInvestorTokenBalance = goodValues.goodInvestorTokenBalance;
            let firstInvestorMoneyBack = (goodInvestorTokenBalance.account3).divToInt('2');
            let firstInvestorMoneyBackInETH = firstInvestorMoneyBack.mul(COSTS[0]).div('1e18');
            await tokenLocal.approve(share.address, approveValue1, {from: ERC20_CREATOR});
            let allowance = await tokenLocal.allowance(ERC20_CREATOR, share.address);
            assert(allowance.eq(approveValue1));
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            let tokenAddress = await share.tokenAddress();
            assert(tbn(tokenAddress).eq(tokenLocal.address));
            await share.acceptAbstractToken(approveValue1, {from: ADMIN});
            let ISAOTokenBalance = await tokenLocal.balanceOf(share.address);
            assert(ISAOTokenBalance.eq(approveValue1));
            await share.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors) {
                await share.sendTransaction({value: investorsSendSums[i], from: investors[i]});
                let investorTokenBalance = await share.getBalanceTokenOf(investors[i]);
                assert(investorTokenBalance.eq(goodInvestorTokenBalance[i]));
            }
            let investorBalanceBefore = web3.eth.getBalance(investors.account3);
            await share.refundShareForce(investors.account3, firstInvestorMoneyBack, {from: ADMIN});
            let investorBalanceAfter = web3.eth.getBalance(investors.account3);
            assert(investorBalanceAfter.eq(investorBalanceBefore.plus(firstInvestorMoneyBackInETH)));
            goodInvestorTokenBalance.account3 = (goodInvestorTokenBalance.account3).minus(firstInvestorMoneyBack);
            goodTotalShare = goodTotalShare.minus(firstInvestorMoneyBack);
            await share.setState(ST_TOKEN_DISTRIBUTION, {from: ADMIN});
            let adminBalanceBefore = await web3.eth.getBalance(ADMIN);
            let tx = await share.releaseEtherToStakeholderForce(RL_ADMIN, adminShare.divToInt(2), {from: ADMIN, gasPrice: gasPrice});
            let gasCost1 = gasPrice.mul(tx.receipt.gasUsed);
            let adminBalanceAfter = await web3.eth.getBalance(ADMIN);
            assert(adminBalanceAfter.eq(adminBalanceBefore.plus(adminShare.divToInt(2)).minus(gasCost1)));
            let firstInvestorReleaseAmount = goodInvestorTokenBalance.account3.divToInt(2);
            await share.releaseToken(firstInvestorReleaseAmount, {from: investors.account3});
            let investorTokenBalance = await tokenLocal.balanceOf(investors.account3);
            assert(investorTokenBalance.eq(firstInvestorReleaseAmount));
            await tokenLocal.approve(share.address, approveValue2, {from: ERC20_CREATOR});
            let allowance1 = await tokenLocal.allowance(ERC20_CREATOR, share.address);
            assert(allowance1.eq(approveValue2));
            await share.acceptAbstractToken(approveValue2, {from: ADMIN});
            let ISAOTokenBalance1 = await tokenLocal.balanceOf(share.address);
            assert(ISAOTokenBalance1.eq(approveValue1.plus(approveValue2).minus(firstInvestorReleaseAmount)));
            for (let i in investors) {
                    await share.sendTransaction({value: tw('0.0001'), from: investors[i]});
                    let goodTokenBalance = goodInvestorTokenBalance[i];
                    let tokenBalance = await tokenLocal.balanceOf(investors[i]);
                    assert(tokenBalance.eq(goodTokenBalance));
            }   
        });

        it("should invest => refundShareForce => invest => distribute", async function () {
            let investorsSendSums = {
                account3: tw('0.354'),
                account4: tw('5'),
                account5: tw('1.121241223'),
                account6: tw('5.555555555551'),
                account7: tw('1.22314232124324'),
                account8: tw('0.89999999999999')
            };
            let goodValues = calculateTokenBalances(investors, investorsSendSums);
            let goodTotalShare = goodValues.goodTotalShare;
            let goodInvestorTokenBalance = goodValues.goodInvestorTokenBalance;
            let investorsMoneyBackSumsInTokens = {
                account3: (goodInvestorTokenBalance.account3).divToInt('2'),
                account4: (goodInvestorTokenBalance.account4).divToInt('3'),
                account5: (goodInvestorTokenBalance.account5).divToInt('4'),
                account6: (goodInvestorTokenBalance.account6).divToInt('5'),
                account7: (goodInvestorTokenBalance.account7).divToInt('6'),
                account8: (goodInvestorTokenBalance.account8).divToInt('7'),
            };
            let investorsMoneyBackSumsETH = {};
            for (let i in investors) 
                investorsMoneyBackSumsETH[i] = (investorsSendSums[i]).mul(investorsMoneyBackSumsInTokens[i]).divToInt(goodInvestorTokenBalance[i]);
            await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
            await share.setERC20Token(tokenLocal.address, {from: ADMIN});
            await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
            await share.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors) {
                await share.sendTransaction({value: investorsSendSums[i], from: investors[i]});
                let goodTokenBalance = goodInvestorTokenBalance[i];
                let tokenBalance = await share.getBalanceTokenOf(investors[i]);
                assert(tokenBalance.eq(goodTokenBalance));
            };
            for (let i in investors) {
                let balanceBefore = await web3.eth.getBalance(investors[i]);
                await share.refundShareForce(investors[i], investorsMoneyBackSumsInTokens[i], {from: ADMIN});
                goodInvestorTokenBalance[i] = goodInvestorTokenBalance[i].minus(investorsMoneyBackSumsInTokens[i]);
                goodTotalShare = goodTotalShare.minus(investorsMoneyBackSumsInTokens[i]);
                let balanceAfter = await web3.eth.getBalance(investors[i]);
                assert(balanceAfter.eq(balanceBefore.plus(investorsMoneyBackSumsETH[i])));
            }
            await share.setState(ST_TOKEN_DISTRIBUTION, {from: ADMIN});
            for (let i in investors) {
                await share.releaseToken(goodInvestorTokenBalance[i], {from: investors[i]});
                let investorTokenBalance = await tokenLocal.balanceOf(investors[i]);
                assert(investorTokenBalance.eq(goodInvestorTokenBalance[i]));
            }
            let ISAOTokenBalance = await tokenLocal.balanceOf(share.address);
            assert(ISAOTokenBalance.eq(APPROVE_VALUE.minus(goodTotalShare)));
        });

        // it("should get sent ETH back to investors during ST_MONEY_BACK period by refundShare func call", async function () {
        //     await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
        //     await share.setERC20Token(tokenLocal.address, {from: ADMIN});
        //     await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
        //     await share.setState(ST_RAISING, {from: ADMIN});
        //     for (let i in investors) 
        //         await share.buyShare({value: INVESTOR_SUM_PAY, from: investors[i]});
        //     await share.setState(ST_MONEY_BACK, {from: ADMIN});
        //     for (let i in investors) {
        //         let investorTokenBalance = await share.getBalanceTokenOf(investors[i]);
        //         let balanceBefore = await web3.eth.getBalance(investors[i]);
        //         let tx = await share.refundShare(investorTokenBalance, {from: investors[i], gasPrice: gasPrice});
        //         let gasCost = gasPrice.mul(tx.receipt.gasUsed);
        //         let balanceAfter = await web3.eth.getBalance(investors[i]);
        //         assert(balanceAfter.eq(balanceBefore.plus(INVESTOR_SUM_PAY).minus(gasCost)));
        //     }
        // });

        // it("should get sent ETH back to investors during ST_MONEY_BACK period by refundShareForce func call", async function () {
        //     await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
        //     await share.setERC20Token(tokenLocal.address, {from: ADMIN});
        //     await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
        //     await share.setState(ST_RAISING, {from: ADMIN});
        //     for (let i in investors) 
        //         await share.buyShare({value: INVESTOR_SUM_PAY, from: investors[i]});
        //     await share.setState(ST_MONEY_BACK, {from: ADMIN});
        //     for (let i in investors) {
        //         let investorTokenBalance = await share.getBalanceTokenOf(investors[i]);
        //         let balanceBefore = await web3.eth.getBalance(investors[i]);
        //         let tx = await share.refundShareForce(investors[i], investorTokenBalance, {from: ADMIN});
        //         let gasCost = gasPrice.mul(tx.receipt.gasUsed);
        //         let balanceAfter = await web3.eth.getBalance(investors[i]);
        //         assert(balanceAfter.eq(balanceBefore.plus(INVESTOR_SUM_PAY)));
        //     }
        // })

        // it("should allow refundShareForce during RAISING period", async function () {
        //     await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
        //     await share.setERC20Token(tokenLocal.address, {from: ADMIN});
        //     await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
        //     await share.setState(ST_RAISING, {from: ADMIN});
        //     for (let i in investors) 
        //         await share.buyShare({value: INVESTOR_SUM_PAY, from: investors[i]});;
        //     for (let i in investors) {
        //         let investorTokenBalance = await share.getBalanceTokenOf(investors[i]);
        //         let balanceBefore = await web3.eth.getBalance(investors[i]);
        //         let tx = await share.refundShareForce(investors[i], investorTokenBalance, {from: ADMIN});
        //         let gasCost = gasPrice.mul(tx.receipt.gasUsed);
        //         let balanceAfter = await web3.eth.getBalance(investors[i]);
        //         assert(balanceAfter.eq(balanceBefore.plus(INVESTOR_SUM_PAY)));
        //     }
        // })

        // it("should get all remain share in tokens by ADMIN during ST_FUND_DEPRECATED period", async function () {
        //     await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
        //     await share.setERC20Token(tokenLocal.address, {from: ADMIN});
        //     await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
        //     await share.setState(ST_RAISING, {from: ADMIN});
        //     for (let i in investors) 
        //         await share.buyShare({value: INVESTOR_SUM_PAY, from: investors[i]});
        //     await share.setState(ST_TOKEN_DISTRIBUTION, {from: ADMIN});
        //     for (let i in investors) {
        //         await share.sendTransaction({value: tw(0.0001), from: investors[i]});
        //         break;
        //     };
        //     await share.setState(ST_FUND_DEPRECATED);
        //     let remainTokens = await tokenLocal.balanceOf(share.address);
        //     let adminTokenBalanceBefore = await tokenLocal.balanceOf(ADMIN);
        //     let data = web3.eth.contract(IERC20_ABI).at(tokenLocal.address).transfer.getData(ADMIN, remainTokens);
        //     await share.execute(tokenLocal.address, 0, data, {from: ADMIN, gasPrice: gasPrice});
        //     let adminTokenBalanceAfter = await tokenLocal.balanceOf(ADMIN);
        //     assert(adminTokenBalanceAfter.eq(adminTokenBalanceBefore.plus(remainTokens)));
        // });

        // it("should get all remain share in ETH by ADMIN during ST_FUND_DEPRECATED period", async function () {
        //     await tokenLocal.approve(share.address, APPROVE_VALUE, {from: ERC20_CREATOR});
        //     await share.setERC20Token(tokenLocal.address, {from: ADMIN});
        //     await share.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
        //     await share.setState(ST_RAISING, {from: ADMIN});
        //     for (let i in investors) 
        //         await share.buyShare({value: INVESTOR_SUM_PAY, from: investors[i]});
        //     await share.setState(ST_TOKEN_DISTRIBUTION, {from: ADMIN});
        //     for (let i in investors) {
        //         await share.sendTransaction({value: tw(0.0001), from: investors[i]});
        //         break;
        //     };
        //     await share.setState(ST_FUND_DEPRECATED);
        //     let remainETH = await web3.eth.getBalance(share.address);
        //     let adminBalanceBefore = await web3.eth.getBalance(ADMIN);
        //     let tx = await share.execute(ADMIN, remainETH, 0, {from: ADMIN, gasPrice: gasPrice});
        //     let gasCost = gasPrice.mul(tx.receipt.gasUsed);
        //     let adminBalanceAfter = await web3.eth.getBalance(ADMIN);
        //     assert(adminBalanceAfter.eq(adminBalanceBefore.plus(remainETH).minus(gasCost)));
        // });
    });

    describe('OVERDRAFT TEST', () => {

    });
});

