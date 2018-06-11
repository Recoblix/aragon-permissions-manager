pragma solidity ^0.4.4;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/acl/ACL.sol";

contract PermissionManager is AragonApp {

    
    bytes32 constant public GRANT_ROLE = keccak256("GRANT_ROLE");
    bytes32 constant public REMOVE_ROLE = keccak256("REMOVE_ROLE");
    bytes32 constant public SET_MANAGER_ROLE = keccak256("SET_MANAGER_ROLE");

    /**
    * @dev Grants permission if allowed. This requires `msg.sender` to be the permission manager
    * @notice Grants `_entity` the ability to perform actions of role `_role` on `_app`
    * @param acl Address of the acl for the permission
    * @param _entity Address of the whitelisted entity that will be able to perform the role
    * @param _app Address of the app in which the role will be allowed (requires app to depend on kernel for ACL)
    * @param _role Identifier for the group of actions in app given access to perform
    */
    function grantPermission(ACL acl, address _entity, address _app, bytes32 _role)
        external
    {
        grantPermissionP(acl, _entity, _app, _role, new uint256[](0));
    }

    /**
    * @dev Grants a permission with parameters if allowed. This requires `msg.sender` to be the permission manager
    * @notice Grants `_entity` the ability to perform actions of role `_role` on `_app`
    * @param acl Address of the acl for the permission
    * @param _entity Address of the whitelisted entity that will be able to perform the role
    * @param _app Address of the app in which the role will be allowed (requires app to depend on kernel for ACL)
    * @param _role Identifier for the group of actions in app given access to perform
    * @param _params Permission parameters
    */
    function grantPermissionP(ACL acl, address _entity, address _app, bytes32 _role, uint256[] _params)
        auth(GRANT_ROLE)
        public
    {
        acl.grantPermissionP(_entity, _app, _role, _params);
    }

    /**
    * @dev Revokes permission if allowed. This requires `msg.sender` to be the the permission manager
    * @notice Revokes `_entity` the ability to perform actions of role `_role` on `_app`
    * @param acl Address of the acl for the permission
    * @param _entity Address of the whitelisted entity to revoke access from
    * @param _app Address of the app in which the role will be revoked
    * @param _role Identifier for the group of actions in app being revoked
    */
    function revokePermission(ACL acl, address _entity, address _app, bytes32 _role)
        auth(REMOVE_ROLE)
        external
    {
        acl.revokePermission(_entity, _app, _role);
    }

    /**
    * @notice Sets `_newManager` as the manager of the permission `_role` in `_app`
    * @param acl Address of the acl for the permission
    * @param _newManager Address for the new manager
    * @param _app Address of the app in which the permission management is being transferred
    * @param _role Identifier for the group of actions being transferred
    */
    function setPermissionManager(ACL acl, address _newManager, address _app, bytes32 _role)
        auth(SET_MANAGER_ROLE)
        external
    {
        acl.setPermissionManager(_newManager, _app, _role);
    }

    /**
    * @notice Removes the manager of the permission `_role` in `_app`
    * @param acl Address of the acl for the permission
    * @param _app Address of the app in which the permission is being unmanaged
    * @param _role Identifier for the group of actions being unmanaged
    */
    function removePermissionManager(ACL acl, address _app, bytes32 _role)
        auth(SET_MANAGER_ROLE)
        external
    {
        acl.removePermissionManager(_app, _role);
    }

}
