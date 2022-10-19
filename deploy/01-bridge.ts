import { HardhatRuntimeEnvironment } from "hardhat/types";
import DeployConfig from "../deploy-data/config";
import { default as ganacheConfig } from "../deploy-data/ganache"
import { default as gethConfig } from "../deploy-data/geth"
import { default as rinkebyConfig } from "../deploy-data/rinkeby"
import { default as mainnetConfig } from "../deploy-data/mainnet"
import { default as sepoliaConfig } from "../deploy-data/sepolia"
import { default as sepolia2Config } from "../deploy-data/sepolia2"


module.exports = async ({
  deployments,
  getUnnamedAccounts,
  network,
  run
}: HardhatRuntimeEnvironment) => {
  let [deployer] = await getUnnamedAccounts();

  let config: DeployConfig;
  switch (network.name) {
    case "ganache":
      config = ganacheConfig;
      break;
    case "mainnet":
      config = mainnetConfig;
      break;
    case "rinkeby":
      config = rinkebyConfig;
      break;
    case "sepolia":
      config = sepoliaConfig;
      break;
    case "sepolia2":
      config = sepolia2Config;
      break;
    case "geth":
      config = gethConfig;
      break;
    default:
      console.log("No config for network", network.name);
      config = ganacheConfig;
      break;
  }

  console.log("Deploy config", config);

  let tokenAddresses = config.sidechainAssets.map((val) => val.address);
  let assetIds = config.sidechainAssets.map((val) => val.asset_id);
  let bridge = await deployments.deploy("Bridge", {
    from: deployer,
    log: true,
    autoMine: true,
    args: [
      config.peers,
      tokenAddresses, assetIds, config.erc20Addresses,
      config.valAddress, config.xorAddress, config.usdtAddress,
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    ]
  });

  await run("verify:verify", {
    address: bridge.address,
    constructorArguments: [
      config.peers,
      tokenAddresses, assetIds, config.erc20Addresses,
      config.valAddress, config.xorAddress,
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    ],
  });
};
