const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const collateralAddress = "0xA374f6335e1B1Fd89a400a8CF68F842da8548d35"
  const loanAddress = "0x091bB729bBb50CFC2223c69C5AE93D5a83B8a331"

  const LendingProtocol = await hre.ethers.getContractFactory("LendingProtocol");
  const lending = await LendingProtocol.deploy(collateralAddress, loanAddress);
  await lending.waitForDeployment();

  console.log(`LendingProtocol deployed at: ${await lending.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
