import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28", // Версия Solidity
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // Адрес локальной сети
      chainId: 31337, // Chain ID для сети Hardhat
      mining: {
        auto: true, // Включение автоматического майнинга
        interval: 500 // Интервал (мс) между блоками, если auto: false
      }
    }
  },
  defaultNetwork: "localhost", // Установите локальную сеть по умолчанию
};

export default config;
