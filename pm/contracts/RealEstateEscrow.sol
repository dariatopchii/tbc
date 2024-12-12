// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RealEstateEscrow is ReentrancyGuard {
    struct Escrow {
        uint256 propertyId;
        address payer;
        address payee;
        uint256 amount;
        bool isCompleted;
    }

    uint256 public escrowCounter;
    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(uint256 escrowId, uint256 propertyId, address payer, address payee, uint256 amount);
    event EscrowCompleted(uint256 escrowId);

    function createEscrow(uint256 _propertyId, address _payee, uint256 _amount) public payable returns (uint256) {
        require(msg.value == _amount, "Incorrect amount");
        require(_amount > 0, "Incorrect amount");
        require(_payee != address(0), "Invalid payee address");

        escrowCounter++;
        escrows[escrowCounter] = Escrow({
            propertyId: _propertyId,
            payer: msg.sender,
            payee: _payee,
            amount: _amount,
            isCompleted: false
        });

        emit EscrowCreated(escrowCounter, _propertyId, msg.sender, _payee, _amount);
        return escrowCounter;
    }

    function completeEscrow(uint256 _escrowId) public nonReentrant {
        require(_escrowId <= escrowCounter, "Escrow does not exist");
        Escrow storage escrow = escrows[_escrowId];
        require(!escrow.isCompleted, "Escrow already completed");
        require(msg.sender == escrow.payee, "Only the payee can complete the escrow");
        require(address(this).balance >= escrow.amount, "Insufficient contract balance");

        escrow.isCompleted = true;
        payable(escrow.payee).transfer(escrow.amount);

        emit EscrowCompleted(_escrowId);
    }

    receive() external payable {}
}
