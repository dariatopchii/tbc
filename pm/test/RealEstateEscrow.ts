import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("RealEstateEscrow - Edge Cases", function () {
  async function deployRealEstateEscrowFixture() {
    const [payer, payee, otherAccount] = await ethers.getSigners();
    const RealEstateEscrow = await ethers.getContractFactory("RealEstateEscrow");
    const escrow = await RealEstateEscrow.deploy();
    await escrow.waitForDeployment();
    return { escrow, payer, payee, otherAccount };
  }

  describe("Edge Cases", function () {
    it("Should revert if escrow value is zero", async function () {
      const { escrow, payee } = await loadFixture(deployRealEstateEscrowFixture);

      const propertyId = 1;
      const amount = ethers.parseEther("0");

      await expect(
        escrow.createEscrow(propertyId, payee.address, amount, { value: amount })
      ).to.be.revertedWith("Incorrect amount");
    });

    it("Should revert if payee address is zero", async function () {
      const { escrow } = await loadFixture(deployRealEstateEscrowFixture);

      const propertyId = 1;
      const amount = ethers.parseEther("1");

      await expect(
        escrow.createEscrow(propertyId, ethers.ZeroAddress, amount, { value: amount })
      ).to.be.revertedWith("Invalid payee address");
    });

    it("Should revert if completing a non-existent escrow", async function () {
      const { escrow, payee } = await loadFixture(deployRealEstateEscrowFixture);

      await expect(escrow.connect(payee).completeEscrow(999)).to.be.revertedWith(
        "Escrow does not exist"
      );
    });

    it("Should revert if escrow is completed but insufficient funds remain", async function () {
      const { escrow, payee } = await loadFixture(deployRealEstateEscrowFixture);
    
      const propertyId = 1;
      const amount = ethers.parseEther("1");
    
      // Create an escrow
      await escrow.createEscrow(propertyId, payee.address, amount, { value: amount });
    
      // Simulate insufficient funds by draining the contract
      await ethers.provider.send("hardhat_setBalance", [
        escrow.target,
        "0x0", // Set balance to 0
      ]);
    
      // Attempt to complete the escrow
      await expect(escrow.connect(payee).completeEscrow(1)).to.be.revertedWith(
        "Insufficient contract balance"
      );
    });
    

    it("Should prevent re-entrancy attacks", async function () {
      const { escrow } = await loadFixture(deployRealEstateEscrowFixture);

      const propertyId = 1;
      const amount = ethers.parseEther("1");

      const MaliciousContract = await ethers.getContractFactory("MaliciousEscrowAttacker");
      const attacker = await MaliciousContract.deploy(escrow.target, propertyId, amount);
      await attacker.waitForDeployment();

      await expect(attacker.attack({ value: amount })).to.be.revertedWith(
        "ReentrancyGuard: reentrant call"
      );
    });
  });
});
