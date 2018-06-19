const StateModelTest = artifacts.require("./StateModelTest.sol");

const web3 = global.web3;

const tbn = v => web3.toBigNumber(v);
const fbn = v => v.toString();
const tw = v => web3.toBigNumber(v).mul(1e18);
const fw = v => web3._extend.utils.fromWei(v).toString();


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
const DISTRIBUTION_PERIOD = TI_DAY.mul(45);
const MINIMAL_FUND_SIZE = tw(100);
const MAXIMAL_FUND_SIZE = tw(100000);

const RL_DEFAULT = tbn(0x00);
const RL_ADMIN = tbn(0x04);
const RL_PAYBOT = tbn(0x08);

contract('StateModelTest', (accounts) => {

    beforeEach(async function () {
        stateModelTest = await StateModelTest.new(RAISING_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
    });

    describe('ST common tests', () => {
        it("default state should be ST_DEFAULT", async function () {
            assert(ST_DEFAULT.eq(await stateModelTest.getState()));
        });

        it("should allow to set state RAISING if there are enough tokens", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            await stateModelTest.setCassetteSize(tw(100000));
            await stateModelTest.setState(ST_RAISING);
            assert(ST_RAISING.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);

        });

        it("should be changed to distribution from raising if fund is collected", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            assert((RL_ADMIN).eq(await stateModelTest.getRole()));
            await stateModelTest.setCassetteSize(tw(100001));
            await stateModelTest.setState(ST_RAISING);
            assert(ST_RAISING.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
            await stateModelTest.setTotalShare(MAXIMAL_FUND_SIZE);
            await stateModelTest.incTimestamp(RAISING_PERIOD);
            assert(ST_TOKEN_DISTRIBUTION.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
        });

        it("should go to MONEY BACK from Raising if RST is not collected", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            assert((RL_ADMIN).eq(await stateModelTest.getRole()));
            await stateModelTest.setCassetteSize(tw(100001));
            await stateModelTest.setState(ST_RAISING);
            assert(ST_RAISING.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
            await stateModelTest.setTotalShare(tw(0));
            await stateModelTest.incTimestamp(RAISING_PERIOD);
            assert(ST_MONEY_BACK.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
        });

        it("should be depricated after distribution be period", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            assert((RL_ADMIN).eq(await stateModelTest.getRole()));
            await stateModelTest.setCassetteSize(tw(100001));
            await stateModelTest.setState(ST_RAISING);
            assert(ST_RAISING.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
            await stateModelTest.setTotalShare(MAXIMAL_FUND_SIZE);
            await stateModelTest.incTimestamp(RAISING_PERIOD);
            assert(ST_TOKEN_DISTRIBUTION.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
            await stateModelTest.incTimestamp(DISTRIBUTION_PERIOD);
            assert(ST_FUND_DEPRECATED.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
        })

        it("state must go to depricated after money back", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            assert((RL_ADMIN).eq(await stateModelTest.getRole()));
            await stateModelTest.setCassetteSize(tw(100001));
            await stateModelTest.setState(ST_RAISING);
            assert(ST_RAISING.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
            await stateModelTest.setTotalShare(tw(0));
            await stateModelTest.incTimestamp(RAISING_PERIOD);
            assert(ST_MONEY_BACK.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
            await stateModelTest.incTimestamp(DISTRIBUTION_PERIOD);
            // await stateModelTest.incTimestamp(DISTRIBUTION_PERIOD);
            // await stateModelTest.incTimestamp(DISTRIBUTION_PERIOD);
            assert(ST_FUND_DEPRECATED.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
        })

        it("should be set to DISTRIBUTION correctly", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            assert((RL_ADMIN).eq(await stateModelTest.getRole()));
            await stateModelTest.setCassetteSize(tw(100001));
            await stateModelTest.setState(ST_RAISING);
            assert(ST_RAISING.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
            await stateModelTest.setTotalShare(tw(1000));
            await stateModelTest.setState(ST_TOKEN_DISTRIBUTION);
            assert(ST_TOKEN_DISTRIBUTION.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
        });

        it("should be set to MoneyBack correctly", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            assert((RL_ADMIN).eq(await stateModelTest.getRole()));
            await stateModelTest.setCassetteSize(tw(100001));
            await stateModelTest.setState(ST_RAISING);
            assert(ST_RAISING.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
            await stateModelTest.setTotalShare(tw(1000));
            await stateModelTest.setState(ST_MONEY_BACK);
            assert(ST_MONEY_BACK.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
        });

        it("should be distribution if RST_FULL during RAISING", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            assert((RL_ADMIN).eq(await stateModelTest.getRole()));
            await stateModelTest.setCassetteSize(tw(100001));
            await stateModelTest.setState(ST_RAISING);
            assert(ST_RAISING.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
            await stateModelTest.setTotalShare(tw(100001));
            assert(ST_TOKEN_DISTRIBUTION.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
        });
    });

    describe('TM time state tests', () => {
        it("after creation must be default", async () => {
            assert(TM_DEFAULT.eq(await stateModelTest.getTimeState()));
        });
        it("after creation must be default anyway", async () => {
            await stateModelTest.incTimestamp(RAISING_PERIOD);
            await stateModelTest.incTimestamp(DISTRIBUTION_PERIOD);
            assert(TM_DEFAULT.eq(await stateModelTest.getTimeState()));
        });
        it("when ST become raising must be raising", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            await stateModelTest.setCassetteSize(tw(100001));
            await stateModelTest.setState(ST_RAISING);
            assert(TM_RAISING.eq(await stateModelTest.getTimeState()));
        });
        it("after raising goes to distribution if fund collected", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            await stateModelTest.setCassetteSize(tw(100001));
            await stateModelTest.setState(ST_RAISING);
            assert(TM_RAISING.eq(await stateModelTest.getTimeState()));
            await stateModelTest.setTotalShare(tw(1000));
            await stateModelTest.incTimestamp(RAISING_PERIOD);
            assert(ST_TOKEN_DISTRIBUTION.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
            assert(TM_TOKEN_DISTRIBUTION.eq(await stateModelTest.getTimeState()));
        });
        it("should be depricated after distribution period ", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            await stateModelTest.setCassetteSize(tw(100001));
            await stateModelTest.setState(ST_RAISING);
            assert(TM_RAISING.eq(await stateModelTest.getTimeState()));
            await stateModelTest.setTotalShare(tw(1000));
            await stateModelTest.incTimestamp(RAISING_PERIOD);
            assert(ST_TOKEN_DISTRIBUTION.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
            assert(TM_TOKEN_DISTRIBUTION.eq(await stateModelTest.getTimeState()));
            await stateModelTest.incTimestamp(DISTRIBUTION_PERIOD);
            assert(ST_FUND_DEPRECATED.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
            assert(TM_FUND_DEPRECATED.eq(await stateModelTest.getTimeState()));
        });
        it("also must be depricated if st is mone back", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            assert((RL_ADMIN).eq(await stateModelTest.getRole()));
            await stateModelTest.setCassetteSize(tw(100001));
            await stateModelTest.setState(ST_RAISING);
            assert(ST_RAISING.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
            await stateModelTest.setTotalShare(tw(1000));
            await stateModelTest.setState(ST_MONEY_BACK);
            assert(ST_MONEY_BACK.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
            await stateModelTest.incTimestamp(DISTRIBUTION_PERIOD);
            assert(ST_FUND_DEPRECATED.eq(await stateModelTest.getState()), `error ${await stateModelTest.getState()}`);
            assert(TM_FUND_DEPRECATED.eq(await stateModelTest.getTimeState()));
        });
    });

    describe('RST amount state tests', () => {
        it("should not be collected if share store < minimal_fund_size", async () => {});
    });




});
//
// contract('StateModelTest ROLE TEST POSITIVE', (accounts) => {
//
//     it("pool manager should be able to set state to ST_RAISING", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         assert(ST_RAISING.eq(await stateModelTestLocal.getState()));
//     })
//
//     it("pool manager should be able to set state to ST_WAIT_FOR_ICO", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.setState(ST_WAIT_FOR_ICO);
//         assert(ST_WAIT_FOR_ICO.eq(await stateModelTestLocal.getState()));
//     })
//
//     it("ico manager should be able to set state to ST_WAIT_FOR_ICO", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.setRole(RL_ICO_MANAGER);
//         await stateModelTestLocal.setState(ST_WAIT_FOR_ICO);
//         assert(ST_WAIT_FOR_ICO.eq(await stateModelTestLocal.getState()));
//     })
//
//     it("pool manager should be able to set state to ST_MONEY_BACK", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_MONEY_BACK);
//         assert(ST_MONEY_BACK.eq(await stateModelTestLocal.getState()));
//     })
//     it("pay bot should be able to set state to ST_MONEY_BACK", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.setRole(RL_PAYBOT);
//         await stateModelTestLocal.setState(ST_MONEY_BACK);
//         assert(ST_MONEY_BACK.eq(await stateModelTestLocal.getState()));
//     })
//     it("admin should be able to set state to ST_MONEY_BACK", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.setRole(RL_ADMIN);
//         await stateModelTestLocal.setState(ST_MONEY_BACK);
//         assert(ST_MONEY_BACK.eq(await stateModelTestLocal.getState()));
//     })
//
//     it("admin should be able to set state to ST_TOKEN_DISTRIBUTION", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.setState(ST_WAIT_FOR_ICO);
//         await stateModelTestLocal.setRole(RL_ADMIN);
//         await stateModelTestLocal.setState(ST_TOKEN_DISTRIBUTION);
//         assert(ST_TOKEN_DISTRIBUTION.eq(await stateModelTestLocal.getState()));
//     })
//
//     it("ico manager should be able to set state to ST_TOKEN_DISTRIBUTION", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.setState(ST_WAIT_FOR_ICO);
//         await stateModelTestLocal.setRole(RL_ICO_MANAGER);
//         await stateModelTestLocal.setState(ST_TOKEN_DISTRIBUTION);
//         assert(ST_TOKEN_DISTRIBUTION.eq(await stateModelTestLocal.getState()));
//     })
//     it("pool manager should be able to set state to ST_TOKEN_DISTRIBUTION", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.setState(ST_WAIT_FOR_ICO);
//         await stateModelTestLocal.setState(ST_TOKEN_DISTRIBUTION);
//         assert(ST_TOKEN_DISTRIBUTION.eq(await stateModelTestLocal.getState()));
//     })
//
//     it("PAY BOT should be able to set state to ST_TOKEN_DISTRIBUTION", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.setState(ST_WAIT_FOR_ICO);
//         await stateModelTestLocal.setRole(RL_PAYBOT);
//         await stateModelTestLocal.setState(ST_TOKEN_DISTRIBUTION);
//         assert(ST_TOKEN_DISTRIBUTION.eq(await stateModelTestLocal.getState()));
//     })
//
// });
//
// contract('StateModelTest ROLE TEST NEGATIVE', (accounts) => {
//
//     it("admin or ico manager or paybot or DEFAULT shouldn't be able to set state to ST_RAISING", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_ADMIN);
//         try {await stateModelTestLocal.setState(ST_RAISING);} catch (err) {}
//         await stateModelTestLocal.setRole(RL_ICO_MANAGER);
//         try {await stateModelTestLocal.setState(ST_RAISING);} catch (err) {}
//         await stateModelTestLocal.setRole(RL_PAYBOT);
//         try {await stateModelTestLocal.setState(ST_RAISING);} catch (err) {}
//         await stateModelTestLocal.setRole(RL_DEFAULT);
//         try {await stateModelTestLocal.setState(ST_RAISING);} catch (err) {}
//         assert(ST_DEFAULT.eq(await stateModelTestLocal.getState()));
//     })
//
//     it("admin or DEFAULT or paybot shouldn't be able to set state to ST_WAIT_FOR_ICO", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.setRole(RL_ADMIN);
//         try {await stateModelTestLocal.setState(ST_WAIT_FOR_ICO);} catch (err) {}
//         await stateModelTestLocal.setRole(RL_PAYBOT);
//         try {await stateModelTestLocal.setState(ST_WAIT_FOR_ICO);} catch (err) {}
//         await stateModelTestLocal.setRole(RL_DEFAULT);
//         try {await stateModelTestLocal.setState(ST_WAIT_FOR_ICO);} catch (err) {}
//         assert(ST_RAISING.eq(await stateModelTestLocal.getState()), `current state, because RL_DEFAULT changed it ${ (await stateModelTestLocal.getState()).toString() }`);
//     })
//
//     it("DEFAULT shouldn't be able to set state to ST_TOKEN_DISTRIBUTION", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         try {await stateModelTestLocal.setState(ST_RAISING);} catch (err) {}
//         await stateModelTestLocal.setTotalShare(tw(100));
//         try {await stateModelTestLocal.setState(ST_WAIT_FOR_ICO);} catch (err) {}
//         await stateModelTestLocal.setRole(RL_DEFAULT);
//         try {await stateModelTestLocal.setState(ST_TOKEN_DISTRIBUTION);} catch (err) {}
//         assert(ST_WAIT_FOR_ICO.eq(await stateModelTestLocal.getState()), `current state, because RL_DEFAULT changed it ${ (await stateModelTestLocal.getState()).toString() }`);
//     })
// });
//
// contract('StateModelTest TIME TEST POSITIVE', (accounts) => {
//
//     it("after RAISING must be WAIT FOR ICO if enough ETH collected", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.incTimestamp(RAISING_PERIOD);
//         assert(ST_WAIT_FOR_ICO.eq(await stateModelTestLocal.getState()));
//     })
//
//     it("after WAIT FOR ICO must be DISTRIBUTION after ICO period", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.incTimestamp(RAISING_PERIOD);
//         await stateModelTestLocal.incTimestamp(ICO_PERIOD);
//         assert(ST_TOKEN_DISTRIBUTION.eq(await stateModelTestLocal.getState()));
//     })
//
//     it("after WAIT FOR ICO must be DISTRIBUTION after ICO period x2", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.setState(ST_WAIT_FOR_ICO);
//         await stateModelTestLocal.incTimestamp(ICO_PERIOD);
//         assert(ST_TOKEN_DISTRIBUTION.eq(await stateModelTestLocal.getState()));
//     })
//
//     it("after DISTRIBUTION must be DEPRICATED after DISTRIBUTION period", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.incTimestamp(RAISING_PERIOD);
//         await stateModelTestLocal.incTimestamp(ICO_PERIOD);
//         await stateModelTestLocal.incTimestamp(DISTRIBUTION_PERIOD);
//         assert(ST_FUND_DEPRECATED.eq(await stateModelTestLocal.getState()));
//     })
//
//     it("after DISTRIBUTION must be DEPRICATED after DISTRIBUTION period x2", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.setState(ST_WAIT_FOR_ICO);
//         await stateModelTestLocal.incTimestamp(ICO_PERIOD);
//         await stateModelTestLocal.incTimestamp(DISTRIBUTION_PERIOD);
//         assert(ST_FUND_DEPRECATED.eq(await stateModelTestLocal.getState()));
//     })
//
//     it("after DISTRIBUTION must be DEPRICATED after DISTRIBUTION period x3", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(100));
//         await stateModelTestLocal.setState(ST_WAIT_FOR_ICO);
//         await stateModelTestLocal.setState(ST_TOKEN_DISTRIBUTION);
//         await stateModelTestLocal.incTimestamp(DISTRIBUTION_PERIOD);
//         assert(ST_FUND_DEPRECATED.eq(await stateModelTestLocal.getState()));
//     })
//
// });
//
// contract('StateModelTest TIME TEST NEGATIVE', (accounts) => {
//
//     it("after RAISING must not be WAIT FOR ICO if not enough ETH collected", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.setTotalShare(tw(1));
//         await stateModelTestLocal.incTimestamp(RAISING_PERIOD);
//         assert(ST_MONEY_BACK.eq(await stateModelTestLocal.getState()));
//     })
// });
//
// contract('StateModelTest TimeState TEST', (accounts) => {
//
//     it("must be default", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         assert(TM_DEFAULT.eq(await stateModelTestLocal.getTimeState()));
//     })
//
//     it("must be default", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.incTimestamp(RAISING_PERIOD);
//         assert(TM_DEFAULT.eq(await stateModelTestLocal.getTimeState()));
//     })
//
//     it("must be rasing", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         assert(TM_RAISING.eq(await stateModelTestLocal.getTimeState()));
//     })
//
//     it("must be TM_WAIT_FOR_ICO", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.incTimestamp(RAISING_PERIOD);
//         assert(TM_WAIT_FOR_ICO.eq(await stateModelTestLocal.getTimeState()));
//     })
//
//     it("must be TM_TOKEN_DISTRIBUTION", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.incTimestamp(RAISING_PERIOD);
//         await stateModelTestLocal.incTimestamp(ICO_PERIOD);
//         assert(TM_TOKEN_DISTRIBUTION.eq(await stateModelTestLocal.getTimeState()));
//     })
//
//     it("must be TM_FUND_DEPRECATED", async function() {
//         let stateModelTestLocal = await StateModelTest.new(RAISING_PERIOD, ICO_PERIOD, DISTRIBUTION_PERIOD, MINIMAL_FUND_SIZE, MAXIMAL_FUND_SIZE);
//         await stateModelTestLocal.setRole(RL_POOL_MANAGER);
//         await stateModelTestLocal.setState(ST_RAISING);
//         await stateModelTestLocal.incTimestamp(RAISING_PERIOD);
//         await stateModelTestLocal.incTimestamp(ICO_PERIOD);
//         await stateModelTestLocal.incTimestamp(DISTRIBUTION_PERIOD);
//         assert(TM_FUND_DEPRECATED.eq(await stateModelTestLocal.getTimeState()));
//     })
// });
//