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


const TOKEN_SUPPLY = tw(1000);
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
        isao = await ISAO.new(
            RAISING_PERIOD, DISTRIBUTION_PERIOD,
            MINIMAL_FUND_SIZE, LIMITS, COSTS, MINIMAL_DEPOSIT_SIZE,
            ADMIN,  PAYBOT
        );
        token = await Token.new(TOKEN_SUPPLY, {from: ADMIN});
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
            await token.approve(isao.address, APPROVE_VALUE, {from: ADMIN});
            await isao.setERC20Token(token.address, {from: ADMIN});
            await isao.acceptAbstractToken(APPROVE_VALUE, {from: ADMIN});
            await isao.setState(ST_RAISING, {from: ADMIN});
            for (let i in investors)
                await isao.buyShare({value: investorsSendSums[i], from: investors[i]});
            let state = await isao.getState();
            assert(state.eq(ST_TOKEN_DISTRIBUTION));
            try {
                await isao.buyShare({value: tw('1'), from: investors.account3});
                console.log('ERROR')
            } catch (e) {
                assert(e);
            }
        });
    });
});


