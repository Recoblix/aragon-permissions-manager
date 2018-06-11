const { assertRevert } = require('@aragon/test-helpers/assertThrow')
const getBlockNumber = require('@aragon/test-helpers/blockNumber')(web3)
const timeTravel = require('@aragon/test-helpers/timeTravel')(web3)
const { encodeCallScript, EMPTY_SCRIPT } = require('@aragon/test-helpers/evmScript')
const ExecutionTarget = artifacts.require('ExecutionTarget')

const PermissionManager = artifacts.require('PermissionManager')
const MiniMeToken = artifacts.require('@aragon/os/contracts/lib/minime/MiniMeToken')
const DAOFactory = artifacts.require('@aragon/os/contracts/factory/DAOFactory')
const EVMScriptRegistryFactory = artifacts.require('@aragon/os/contracts/factory/EVMScriptRegistryFactory')
const ACL = artifacts.require('@aragon/os/contracts/acl/ACL')
const Kernel = artifacts.require('@aragon/os/contracts/kernel/Kernel')

const getContract = name => artifacts.require(name)
const pct16 = x => new web3.BigNumber(x).times(new web3.BigNumber(10).toPower(16))
const createdActionId = receipt => receipt.logs.filter(x => x.event == 'StartAction')[0].args.actionId

const ANY_ADDR = '0xffffffffffffffffffffffffffffffffffffffff'
const NO_ADDR  = '0x0000000000000000000000000000000000000000'

const VOTER_STATE = ['ABSENT', 'YEA', 'NAY'].reduce((state, key, index) => {
    state[key] = index;
    return state;
}, {})


contract('Permissions Manager App', accounts => {
    let daoFact, permissionManager, token, executionTarget, acl = {}

    const root = accounts[0]

    before(async () => {
        const kernelBase = await getContract('Kernel').new()
        const aclBase = await getContract('ACL').new()
        const regFact = await EVMScriptRegistryFactory.new()
        daoFact = await DAOFactory.new(kernelBase.address, aclBase.address, regFact.address)
    })

    beforeEach(async () => {
        const r = await daoFact.newDAO(root)
        const dao = Kernel.at(r.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
        acl = ACL.at(await dao.acl())

        await acl.createPermission(root, dao.address, await dao.APP_MANAGER_ROLE(), root, { from: root })

        const pmReceipt = await dao.newAppInstance('0x1234', (await PermissionManager.new()).address, { from: root })
        permissionManager = PermissionManager.at(pmReceipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)

        await acl.createPermission(ANY_ADDR, permissionManager.address, await permissionManager.GRANT_ROLE(), root, { from: root })
        await acl.createPermission(ANY_ADDR, permissionManager.address, await permissionManager.REMOVE_ROLE(), root, { from: root })
        await acl.createPermission(ANY_ADDR, permissionManager.address, await permissionManager.SET_MANAGER_ROLE(), root, { from: root })

        const etReceipt = await dao.newAppInstance('0x1334', (await ExecutionTarget.new()).address, { from: root })
        executionTarget = ExecutionTarget.at(etReceipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)

        await acl.createPermission(NO_ADDR, executionTarget.address, await executionTarget.ROLE(), permissionManager.address, { from: root })

    })

    it('Does not start with permission', async () => {
        return assertRevert(async () => {
            await executionTarget.execute({ from: root })
        })
    })

    it('Can grant permission', async () => {
        await permissionManager.grantPermission(acl.address, root, executionTarget.address, await executionTarget.ROLE(), { from: root })
        await executionTarget.execute({ from: root })
        assert.equal(await executionTarget.counter(), 1, 'should have received execution call')
    })
    it('Can revoke Permission', async () => {
        await permissionManager.grantPermission(acl.address, root, executionTarget.address, await executionTarget.ROLE(), { from: root })
        await permissionManager.revokePermission(acl.address, root, executionTarget.address, await executionTarget.ROLE(), { from: root })
        return assertRevert(async () => {
            await executionTarget.execute({ from: root })
        })
    })
})
