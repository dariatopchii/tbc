const hre = require("hardhat");

async function main() {
  const Escrow = await hre.ethers.getContractFactory("RealEstateEscrow");
  const escrow = await Escrow.deploy();

  // Замените .deployed() на waitForDeployment()
  await escrow.waitForDeployment();

  console.log("Escrow contract deployed to:", escrow.target); // target - это адрес контракта
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
