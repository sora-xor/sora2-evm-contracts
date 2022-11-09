import { HardhatRuntimeEnvironment } from 'hardhat/types';
import DeployConfig from "../deploy-data/config";
import { default as mainnetConfig } from "../deploy-data/mainnet"

async function main() {
    const hh: HardhatRuntimeEnvironment = require("hardhat");
    const config = mainnetConfig;
    const bridgeAddress = "0x6F984C337aD5b7C2084805042AE942cef462e3ff";
    let tokenAddresses = config.sidechainAssets.map((val) => val.address);
    let assetIds = config.sidechainAssets.map((val) => val.asset_id);
    await hh.run("verify:verify", {
        address: bridgeAddress,
        constructorArguments: [
            config.peers,
            tokenAddresses, assetIds, config.erc20Addresses,
            config.valAddress, config.xorAddress,
            '0x0000000000000000000000000000000000000000000000000000000000000000'
        ],
    });
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
});