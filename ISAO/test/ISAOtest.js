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

const INVESTOR_SUM_PAY = tw(0.5);
const INVESTOR_SUM_TO_TRIGGER = tw(0.00001);

const RL_DEFAULT = tbn(0x00);
const RL_ADMIN = tbn(0x04);
const RL_PAYBOT = tbn(0x08);
const LIMITS = [tw(100), tw(500), tw(1000)];
const COSTS = [tw(0.1), tw(0.2), tw(0.5)];

const gasPrice = tw("3e-7");

contract('ShareStore COMMON TEST', (accounts) => {

    beforeEach(async function () {
        isao = await ISAO.new(
            RAISING_PERIOD, DISTRIBUTION_PERIOD,
            MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE,LIMITS, COSTS, MINIMAL_DEPOSIT_SIZE,
            accounts[1], {from: accounts[0]}
        );
        token = await Token.new(TOKEN_SUPPLY, {from: accounts[0]});
    });

    it("should allow to take all tokens when distribution", async function () {
        await token.approve(isao.address, TOKEN_SUPPLY, {from: accounts[0]});
        await isao.setERC20Token(token.address, {from: accounts[0]});
        await isao.acceptAbstractToken(TOKEN_SUPPLY, {from: accounts[0]});
        await isao.setState(ST_RAISING);
        assert((await isao.getState()).eq(ST_RAISING));

        await isao.sendTransaction({from: accounts[2], value: 10e18});
        await isao.setState(ST_TOKEN_DISTRIBUTION, {from: accounts[0]});
        assert((await isao.getState()).eq(ST_TOKEN_DISTRIBUTION));

        let balToken = await isao.getBalanceTokenOf(accounts[2]);

        console.log((balToken).toString());

        await isao.releaseToken(90000000000000000000, {from: accounts[2]});


        let balToken2 = await isao.getBalanceTokenOf(accounts[2]);

        console.log((balToken2).toString());

        await isao.releaseToken(9999999999999998800, {from: accounts[2]});

        let balToken3 = await isao.getBalanceTokenOf(accounts[2]);

        console.log((balToken3).toString());


    });
});