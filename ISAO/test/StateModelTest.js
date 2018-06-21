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

const RST_NOT_COLLECTED = tbn(0x01);
const RST_COLLECTED = tbn(0x02);
const RST_FULL = tbn(0x04);

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
        it("should not be collected if total share < minimal_fund_size", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            assert((RL_ADMIN).eq(await stateModelTest.getRole()));
            await stateModelTest.setTotalShare(tw(1));
            assert(RST_NOT_COLLECTED.eq(await stateModelTest.getRaisingState()));
        });
        it("should be collected if total share > minimal_fund_size", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            assert((RL_ADMIN).eq(await stateModelTest.getRole()));
            await stateModelTest.setTotalShare(tw(101));
            assert(RST_COLLECTED.eq(await stateModelTest.getRaisingState()));
        });
        it("should be full if total share = maximal_fund_size", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            assert((RL_ADMIN).eq(await stateModelTest.getRole()));
            await stateModelTest.setTotalShare(tw(100000));
            assert(RST_FULL.eq(await stateModelTest.getRaisingState()));
        });
    });

    describe('ST negative state tests', () => {
        it("should not allow to set any state except RAISING if current state DEFAULT", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            assert((RL_ADMIN).eq(await stateModelTest.getRole()));
            await stateModelTest.setCassetteSize(tw(100001));
            let stateObj = {
                STATE1: ST_DEFAULT,
                STATE2: ST_MONEY_BACK,
                STATE3: ST_FUND_DEPRECATED,
                STATE4: ST_TOKEN_DISTRIBUTION
            };
            try {
                for (let i in stateObj) {
                    await stateModelTest.setState(STATE[i]);
                }
            }
            catch (e) {

            }
            assert(ST_DEFAULT.eq(await stateModelTest.getState()));
            await stateModelTest.setState(ST_RAISING);
            assert(ST_RAISING.eq(await stateModelTest.getState()));
        });

        it("should not allow to set any state EXCEPT MONEYBACK or DISTRIBUTION after RAISING", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            await stateModelTest.setCassetteSize(tw(100001));
            await stateModelTest.setState(ST_RAISING);
            await stateModelTest.setTotalShare(tw(101));
            let stateObj = {
                STATE1: ST_DEFAULT,
                STATE2: ST_FUND_DEPRECATED,
                STATE3: ST_RAISING,
            };
            try {
                for (let i in stateObj) {
                    await stateModelTest.setState(STATE[i]);
                }
            }
            catch (e) {

            }
            assert(ST_RAISING.eq(await stateModelTest.getState()));
            await stateModelTest.setState(ST_TOKEN_DISTRIBUTION);
            assert(ST_TOKEN_DISTRIBUTION.eq(await stateModelTest.getState()));
        });

        it("should not allow to set any state EXCEPT MONEYBACK or DISTRIBUTION after RAISING x2", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            await stateModelTest.setCassetteSize(tw(100001));
            await stateModelTest.setState(ST_RAISING);
            await stateModelTest.setTotalShare(tw(101));
            let stateObj = {
                STATE1: ST_DEFAULT,
                STATE2: ST_FUND_DEPRECATED,
                STATE3: ST_RAISING,
            };
            try {
                for (let i in stateObj) {
                    await stateModelTest.setState(STATE[i]);
                }
            }
            catch (e) {

            }
            assert(ST_RAISING.eq(await stateModelTest.getState()));
            await stateModelTest.setState(ST_MONEY_BACK);
            assert(ST_MONEY_BACK.eq(await stateModelTest.getState()));
        });

        it("should not allow to set  state DISTRIBUTION after RAISING if fund is not collected", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            await stateModelTest.setCassetteSize(tw(100001));
            await stateModelTest.setState(ST_RAISING);
            await stateModelTest.setTotalShare(tw(10));

            try {
                await stateModelTest.setState(ST_TOKEN_DISTRIBUTION);
            }
            catch (e) {
            }
            assert(ST_RAISING.eq(await stateModelTest.getState()));
        });
        it("should not allow to set any state after DISTRIBUTION", async () => {
            await stateModelTest.setRole(RL_ADMIN);
            await stateModelTest.setCassetteSize(tw(100001));
            await stateModelTest.setState(ST_RAISING);
            await stateModelTest.setTotalShare(tw(101));
            await stateModelTest.setState(ST_TOKEN_DISTRIBUTION);
            let stateObj = {
                STATE1: ST_DEFAULT,
                STATE2: ST_FUND_DEPRECATED,
                STATE3: ST_RAISING,
                STATE4: ST_MONEY_BACK,
                STATE5: ST_TOKEN_DISTRIBUTION
            };
            try {
                for (let i in stateObj) {
                    await stateModelTest.setState(STATE[i]);
                }
            }
            catch (e) {
            }
            assert(ST_TOKEN_DISTRIBUTION.eq(await stateModelTest.getState()));
        });
    });
});
