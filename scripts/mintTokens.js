const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const recipient = process.env.MINT_TO;

  const collateralAddress = process.env.VITE_COLLATERAL_TOKEN_ADDRESS;
  const loanAddress = process.env.VITE_LOAN_TOKEN_ADDRESS;

  const CollateralToken = await hre.ethers.getContractAt("CollateralToken", collateralAddress);
  const LoanToken = await hre.ethers.getContractAt("LoanToken", loanAddress);

  const amount = hre.ethers.parseEther("1000");

  console.log(`Minting tokens to ${recipient}...`);

  await CollateralToken.connect(owner).mint(recipient, amount);
  await LoanToken.connect(owner).mint(recipient, amount);

  console.log("Mint completado: 1000 cUSD y 1000 dDAI");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
