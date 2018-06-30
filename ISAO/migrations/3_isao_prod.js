const ISAOProd = artifacts.require("./ISAOProd.sol");
const env = process.env;
const tbn = v => web3._extend.utils.toBigNumber(v);
const tw = v => web3._extend.utils.toBigNumber(v).mul(1e18);
const TI_DAY = tbn(86400);

module.exports =  (deployer, network, accounts) => {


    (async () => {
        await deployer.deploy(ISAOProd,
            env.RAISING_PERIOD, env.DISTRIBUTION_PERIOD,
            env.MINIMAL_FUND_SIZE, env.LIMITS, COSTS, env.MINIMAL_DEPOSIT,
            env.ADMIN_ADDRESS, env.PAYBOT_ADDRESS,
          {from:env.OPERATOR});

        await ISAOTest.deployed();
        });
};