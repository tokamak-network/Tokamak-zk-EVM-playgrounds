// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/token/ERC20/IERC20.sol";

contract DepositManagerMock {
    IERC20 public wton;

    event Deposited(address layer2, address account, uint256 amount);

    constructor(address _wton) {
        wton = IERC20(_wton);
    }

    function deposit(address layer2, address account, uint256 amount) external returns (bool) {
        require(wton.transferFrom(msg.sender, address(this), amount));
        emit Deposited(layer2, account, amount);
        return true;
    }
}
