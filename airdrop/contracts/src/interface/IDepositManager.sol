// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

interface IDepositManager {
    /// @dev Deposit WTON for a specific user.
    function deposit(address layer2, address account, uint256 amount) external returns (bool);
}
