import { config as dotenv } from "dotenv";
import { resolve } from "path";
import "solidity-coverage"

import * as gen_config from "./tasks/gen-config";

dotenv({ path: resolve(__dirname, ".env") });

import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-deploy";
import { HardhatUserConfig, task } from "hardhat/config";

const getenv = (name: string) => {
  if (name in process.env) {
    return process.env[name]
  } else {
    throw new Error(`Please set your ${name} in a .env file`);
  }
}

const rinkebyPrivateKey = getenv("RINKEBY_PRIVATE_KEY");
const gethPrivateKey = getenv("GETH_PRIVATE_KEY");
const mainnetPrivateKey = getenv("MAINNET_PRIVATE_KEY");
const infuraKey = getenv("INFURA_PROJECT_ID");
const etherscanKey = getenv("ETHERSCAN_API_KEY");

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      throwOnTransactionFailures: true,
    },
    ganache: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: {
        mnemonic: "myth like bonus scare over problem client lizard pioneer submit female collect"
      },
      gas: 10000000,
      gasPrice: 5000000000,
    },
    geth: {
      url: "http://127.0.0.1:8545",
      chainId: 4224,
      accounts: [gethPrivateKey],
    },
    rinkeby: {
      chainId: 4,
      url: `https://rinkeby.infura.io/v3/${infuraKey}`,
      accounts: [rinkebyPrivateKey],
    },
    mainnet: {
      chainId: 1,
      url: `https://mainnet.infura.io/v3/${infuraKey}`,
      accounts: [mainnetPrivateKey],
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ],
  },
  paths: {
    sources: "Bridge",
    deployments: '.deployments',
    tests: "test",
    cache: ".cache",
    artifacts: "artifacts"
  },
  mocha: {
    timeout: 60000
  },
  etherscan: {
    apiKey: etherscanKey
  }
};

task("gen-config", "Generate config file for given network")
  .addParam("contractAddress")
  .addParam("soraEndpoint")
  .addParam("peers")
  .addParam("output").setAction(gen_config.main);

export default config;