// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BreenTokenVault {
    IERC20 public immutable token;

    mapping(address => uint256) public balances;
    uint256 public totalStaked;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _token) {
        token = IERC20(_token);
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");

        bool success = token.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");

        balances[msg.sender] += amount;
        totalStaked += amount;

        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        totalStaked -= amount;

        bool success = token.transfer(msg.sender, amount);
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    function getMyBalance() external view returns (uint256) {
        return balances[msg.sender];
    }
}