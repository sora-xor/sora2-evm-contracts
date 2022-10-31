import { log } from "console";
import { readFile } from "fs";
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import DeployConfig from "../deploy-data/config";
import * as sora from "@sora-substrate/util";
import abi from "../abis/BridgeOld.abi";
import { writeFile } from "fs/promises";
import { AnyJson } from "@polkadot/types/types";
import { keccak256 } from "web3-utils";

export async function main({ contractAddress, soraEndpoint, output, peers }) {
    let peersArray = (peers as string).split(",");
    const hh: HardhatRuntimeEnvironment = require("hardhat");
    await sora.connection.open(soraEndpoint);
    sora.api.initialize();
    console.log("Connected to:", soraEndpoint);
    let registeredAssets = await sora.api.bridge.getRegisteredAssets();
    let contract = await hh.ethers.getContractAt(abi, contractAddress);
    let sidechainAssets = [];
    for (let i = 0; i < 10; i++) {
        try {
            let address: string = await contract.callStatic._sidechainTokenAddressArray(i);
            let asset_id: string = await contract.callStatic._sidechainTokensByAddress(address);
            sidechainAssets.push({ address, asset_id });
        } catch {
            break;
        }
    }
    let xorAddress;
    let valAddress;
    let usdtAddress;
    let erc20Addresses = [];
    for (const asset of registeredAssets) {
        if (asset.symbol == "XOR") {
            xorAddress = asset.externalAddress;
        } else if (asset.symbol == "VAL") {
            valAddress = asset.externalAddress;
        } else if (sidechainAssets.findIndex((value) => value.asset_id == asset.address) == -1) {
            if (asset.externalAddress != "0x0000000000000000000000000000000000000000") {
                erc20Addresses.push(asset.externalAddress);
            }
        }
    }
    let config: DeployConfig = {
        xorAddress, valAddress, sidechainAssets, erc20Addresses, peers: peersArray,
    }
    let data = `
import DeployConfig from "./config";

const config: DeployConfig = ${JSON.stringify(config, null, 4)};

export default config;
    `;
    await writeFile(output, data);
}
