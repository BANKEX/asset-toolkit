

var ISAOTest = artifacts.require("./ISAOTest.sol");

var TestToken = artifacts.require("./ERC20/TestToken.sol");

const tbn = v => web3._extend.utils.toBigNumber(v);
const fbn = v => v.toString();
const tw = v => web3._extend.utils.toBigNumber(v).mul(1e18);
const fw = v => web3._extend.utils.fromWei(v).toString();

const TOKEN_SUPPLY = tw(110);
const MINIMAL_DEPOSIT_SIZE = tw(0.05)

const TI_DAY = tbn(86400);

const ST_DEFAULT = tbn(0x00);
const ST_RAISING = tbn(0x01);
const ST_WAIT_FOR_ICO = tbn(0x02);
const ST_MONEY_BACK = tbn(0x04);
const ST_TOKEN_DISTRIBUTION = tbn(0x08);
const ST_FUND_DEPRECATED = tbn(0x10);


const RL_DEFAULT = tbn(0x00);
const RL_POOL_MANAGER = tbn(0x01);
const RL_ICO_MANAGER = tbn(0x02);
const RL_ADMIN = tbn(0x04);
const RL_PAYBOT = tbn(0x08);






module.exports = function(deployer, network, accounts) {
  const operator = accounts[0];
  const RAISING_PERIOD = TI_DAY.mul(10);
  const DISTRIBUTION_PERIOD = TI_DAY.mul(36524);
  // const MINIMAL_FUND_SIZE = tw(110);
  const MINIMAL_FUND_SIZE = tw(110);
  const LIMITS = [tw(100), tw(500), tw(1000)];
  const COSTS = [tw(0.1), tw(0.2), tw(0.5)];
  const PAYBOT_ADDRESS = accounts[9];
  
  const MINIMAL_DEPOSIT = tw(0.1);





  (async () => {

    // await deployer.deploy(TestToken, TOKEN_SUPPLY, {from: operator});
    // await TestToken.deployed();
    //
    // console.log("Token ERC20 address:");
    // console.log((TestToken.address).toString());
    //
    // console.log(JSON.stringify([RAISING_PERIOD, DISTRIBUTION_PERIOD,
    //   MINIMAL_FUND_SIZE, LIMITS, COSTS, MINIMAL_DEPOSIT, PAYBOT_ADDRESS].map(x=>x.toString())))
    //
    // await deployer.deploy(ISAOTest,
    //   RAISING_PERIOD, DISTRIBUTION_PERIOD,
    //   MINIMAL_FUND_SIZE, LIMITS, COSTS, MINIMAL_DEPOSIT,
    //   PAYBOT_ADDRESS,
    //   {from:operator});
    //
    // await ISAOTest.deployed();

      deployer.then(async function() {
          let token = await TestToken.new(TOKEN_SUPPLY);
          let isao = await ISAOTest.new(
                      RAISING_PERIOD, DISTRIBUTION_PERIOD,
                      MINIMAL_FUND_SIZE, LIMITS, COSTS, MINIMAL_DEPOSIT,
                      PAYBOT_ADDRESS,
                      {from:operator});

          await token.approve(isao.address, TOKEN_SUPPLY, {from: operator});
          await isao.setERC20Token(token.address, {from: operator});
          await isao.acceptAbstractToken(TOKEN_SUPPLY, {from: operator});

          let a = (await isao.tokenAddress()).toString();
          let b = (isao.address).toString();

          // await isao.setState(ST_RAISING, {from: operator});
          // let state = await isao.getState();

          console.log(`Address of ERC20 token: ${a}`);
          console.log(`Address of ISAO: ${b}`);
          // console.log(`State of ISAO: ${state}`);
      });


  })();
};
