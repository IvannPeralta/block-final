import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LendingProtocolABI from './abis/LendingProtocolABI.json';
import CollateralTokenABI from './abis/CollateralTokenABI.json';
import LoanTokenABI from './abis/LoanTokenABI.json';
import LendingInterface from './LendingInterface.jsx';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [collateral, setCollateral] = useState(0);
  const [debt, setDebt] = useState(0);
  const [interest, setInterest] = useState(0);
  const [amount, setAmount] = useState("");
  const [tokenBalances, setTokenBalances] = useState({ cUSD: "0", dDAI: "0" });

  useEffect(() => {
    if (account && contract) {
      loadUserData();
      checkTokenBalances();
    }
  }, [account, contract]);

  async function connectWallet() {
    if (!window.ethereum) return alert("Instalá MetaMask");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setAccount(address);

    const lending = new ethers.Contract(CONTRACT_ADDRESS, LendingProtocolABI, signer);
    setContract(lending);
  }

  async function loadUserData() {
    const [col, deb, intRate] = await contract.getUserData(account);
    setCollateral(ethers.formatEther(col));
    setDebt(ethers.formatEther(deb));
    setInterest(ethers.formatEther(intRate));
  }

  async function checkTokenBalances() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const collateralToken = new ethers.Contract(
      import.meta.env.VITE_COLLATERAL_TOKEN_ADDRESS,
      CollateralTokenABI,
      signer
    );

    const loanToken = new ethers.Contract(
      import.meta.env.VITE_LOAN_TOKEN_ADDRESS,
      LoanTokenABI,
      signer
    );

    const cUSDBalance = await collateralToken.balanceOf(address);
    const dDAIBalance = await loanToken.balanceOf(address);

    setTokenBalances({
      cUSD: ethers.formatEther(cUSDBalance),
      dDAI: ethers.formatEther(dDAIBalance),
    });

    console.log("Saldo cUSD:", ethers.formatEther(cUSDBalance));
    console.log("Saldo dDAI:", ethers.formatEther(dDAIBalance));
  }

  async function deposit() {
    try {
      const amountWei = ethers.parseEther(amount);

      // Obtener signer real de MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Crear instancia del token con ese signer
      const collateralToken = new ethers.Contract(
        import.meta.env.VITE_COLLATERAL_TOKEN_ADDRESS,
        CollateralTokenABI,
        signer
      );

      // Aprobar al contrato para mover tus tokens
      const approveTx = await collateralToken.approve(contract.target, amountWei);
      await approveTx.wait();

      // Ejecutar el depósito usando el contrato
      const tx = await contract.connect(signer).depositCollateral(amountWei);
      await tx.wait();

      loadUserData();
      checkTokenBalances();
    } catch (err) {
      console.error("❌ Error al depositar:", err);
      alert("Error al depositar. Revisa si aprobaste correctamente cUSD.");
    }
  }


  async function borrow() {
    const tx = await contract.borrow(ethers.parseEther(amount));
    await tx.wait();
    loadUserData();
    checkTokenBalances();
  }

  async function repay() {
    const totalWei = ethers.parseEther((parseFloat(debt) + parseFloat(interest)).toFixed(18));

    const loanToken = new ethers.Contract(
      import.meta.env.VITE_LOAN_TOKEN_ADDRESS,
      LoanTokenABI,
      await contract.runner
    );

    const approveTx = await loanToken.approve(contract.target, totalWei);
    await approveTx.wait();

    const tx = await contract.repay();
    await tx.wait();

    loadUserData();
    checkTokenBalances();
  }

  async function withdraw() {
    const tx = await contract.withdrawCollateral();
    await tx.wait();
    loadUserData();
    checkTokenBalances();
  }

  return (
    <LendingInterface
      account={account}
      connectWallet={connectWallet}
      collateral={collateral}
      debt={debt}
      interest={interest}
      amount={amount}
      setAmount={setAmount}
      deposit={deposit}
      borrow={borrow}
      repay={repay}
      withdraw={withdraw}
      tokenBalances={tokenBalances}
      checkTokenBalances={checkTokenBalances}
    />
  );
}

export default App;
