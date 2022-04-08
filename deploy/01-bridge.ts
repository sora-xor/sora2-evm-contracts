import { HardhatRuntimeEnvironment } from "hardhat/types";
import DeployConfig from "../deploy-data/config";
import { default as ganacheConfig } from "../deploy-data/ganache"
import { default as gethConfig } from "../deploy-data/geth"
import { default as rinkebyConfig } from "../deploy-data/rinkeby"
import { default as mainnetConfig } from "../deploy-data/mainnet"


module.exports = async ({
  deployments,
  getUnnamedAccounts,
  ethers,
  network
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
    case "geth":
      config = gethConfig;
      break;
    default:
      config = ganacheConfig;
      break;
  }

  let tokenAddresses = config.sidechainAssets.map((val) => val.address);
  let assetIds = config.sidechainAssets.map((val) => val.asset_id);
  await deployments.deploy("BridgeDeployer", {
    from: deployer,
    log: true,
    autoMine: true,
    args: [
      config.peers,
      tokenAddresses, assetIds, config.erc20Addresses,
      config.xorAddress, config.valAddress,
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    ]
  });

  await deployments.execute("BridgeDeployer", {
    from: deployer,
    log: true,
    autoMine: true,
  }, "deployBridgeContract")
};