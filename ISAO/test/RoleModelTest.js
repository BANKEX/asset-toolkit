const RoleModelTest = artifacts.require("./RoleModelTest.sol");

const web3 = global.web3;

const tbn = v => web3.toBigNumber(v);
const fbn = v => v.toString();
const tw = v => web3.toBigNumber(v).mul(1e18);
const fw = v => web3._extend.utils.fromWei(v).toString();

const RL_DEFAULT = tbn(0x00);
const RL_ADMIN = tbn(0x04);
const RL_PAYBOT = tbn(0x08);

contract('RoleModelTest', (accounts) => {

    beforeEach(async function() {
        roleModelTest = await RoleModelTest.new({from: accounts[0]});
    });

    it("default role of contract creator should be RL_ADMIN", async function() {
        roleModelTest.setRole(RL_ADMIN, {from: accounts[0]});
        assert(RL_ADMIN.eq(await roleModelTest.getRole(accounts[0])));
    });

    it("set role PAYBOT", async function() {
        roleModelTest.setRole(RL_PAYBOT, {from: accounts[9]});
        assert(RL_PAYBOT.eq(await roleModelTest.getRole(accounts[9])));
    });

});
