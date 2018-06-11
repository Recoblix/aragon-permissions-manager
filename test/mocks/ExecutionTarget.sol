pragma solidity ^0.4.18;

import "@aragon/os/contracts/apps/AragonApp.sol";

contract ExecutionTarget is AragonApp {
    uint public counter;

    bytes32 constant public ROLE = keccak256("ROLE");

    function execute() auth(ROLE) {
        counter += 1;
        Executed(counter);
    }

    function setCounter(uint x) auth(ROLE) {
        counter = x;
    }

    event Executed(uint x);
}
