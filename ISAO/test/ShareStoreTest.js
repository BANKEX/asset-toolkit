// https://github.com/MikeMcl/bignumber.js/
const BigNumber = require('bignumber.js');
const ShareStoreTest = artifacts.require("./ShareStoreTest.sol");
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

// const tbn = v => web3.toBigNumber(v);
// const fbn = v => v.toString();
// const tw = v => web3.toBigNumber(v).mul(1e18);
// const fw = v => web3._extend.utils.fromWei(v).toString();
// const DECIMAL_MULTIPLIER = new BN(0xDE0B6B3A7640000, 16);
// console.log(DECIMAL_MULTIPLIER.toNumber())
// const tbn = v => new BN(v, 10);
// const fbn = v => v.toNumber();
// const tw = v => BN.isBN(v) ? v.mul(DECIMAL_MULTIPLIER) : tbn(v).mul(DECIMAL_MULTIPLIER);
// const fw = v => BN.isBN(v) ? v.div(DECIMAL_MULTIPLIER).toNumber() : tbn(v).div(DECIMAL_MULTIPLIER).toNumber();

const tbn = v => new BigNumber(v);
const fbn = v => v.toNumber();
const tw = v => BigNumber.isBigNumber(v) ? v.times(1e18) : tbn(v).times(1e18);
const fw = v => BigNumber.isBigNumber(v) ? v.div(1e18).toNumber() : tbn(v).div(1e18).toNumber();

const TOKEN_SUPPLY = tw(10);
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

const RAISING_PERIOD = TI_DAY.times(10);
const ICO_PERIOD = TI_DAY.times(15);
const DISTRIBUTION_PERIOD = TI_DAY.times(45);

const MINIMAL_FUND_SIZE = tw(1);
const MAXIMAL_FUND_SIZE = tw(100000);

const INVESTOR_SUM_PAY = tw(0.5);
const INVESTOR_SUM_TO_TRIGGER = tw(0.00001);

const RL_DEFAULT = tbn(0x00);
const RL_ADMIN = tbn(0x04);
const RL_PAYBOT = tbn(0x08);

const gasPrice = tw("3e-7");

contract('ShareStore COMMON TEST', (accounts) => {
    beforeEach(async function() {
        tokenLocal = await Token.new(TOKEN_SUPPLY);
        share = await ShareStoreTest.new(
            MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE,
            MINIMAL_DEPOSIT_SIZE, tokenLocal.address
        );
    });
    it("Token address must be tokenLocal.address", async function () {
        assert.equal(tokenLocal.address, await share.tokenAddress());
    })

});

contract('ShareStore NEGATIVE TEST', (accounts) => {

});

contract('ShareStore CALC TEST', (accounts) => {

});


contract('ShareStore OVERDRAFT TEST', (accounts) => {
});
