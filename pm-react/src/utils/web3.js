import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constants";

// Подключение к MetaMask
export async function connectToMetaMask() {
  if (!window.ethereum) {
    throw new Error("MetaMask не установлена");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);

  // Проверка уже подключенных аккаунтов
  const accounts = await provider.send("eth_accounts", []);
  if (accounts.length > 0) {
    const signer = await provider.getSigner();
    return { provider, signer, account: accounts[0] };
  }

  // Запрос разрешения на подключение, если аккаунты не подключены
  const newAccounts = await provider.send("eth_requestAccounts", []);
  if (newAccounts.length > 0) {
    const signer = await provider.getSigner();
    return { provider, signer, account: newAccounts[0] };
  }

  throw new Error("Не удалось подключить MetaMask");
}

// Получение экземпляра контракта
export async function getContractInstance() {
  const { signer } = await connectToMetaMask();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}
