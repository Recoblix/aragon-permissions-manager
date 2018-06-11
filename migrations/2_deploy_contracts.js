var App = artifacts.require('./PermissionManager.sol')

module.exports = function (deployer) {
  deployer.deploy(App)
}
