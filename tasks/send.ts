import { HardhatRuntimeEnvironment } from 'hardhat/types';
import DeployConfig from "../deploy-data/config";
import * as sora from "@sora-substrate/util";
import abi from "../abis/BridgeOld.abi";
import { writeFile } from "fs/promises";
import "hardhat-deploy";

export async function main({ to, amount, token }) {
    const hh: HardhatRuntimeEnvironment = require("hardhat");
    let [deployer] = await hh.getUnnamedAccounts();
    let res;
    if (!token) {
        res = await hh.deployments.execute("Bridge", { from: deployer, log: true, value: amount }, "sendEthToSidechain", to);
    } else {
        res = await hh.deployments.execute("Bridge", { from: deployer, log: true }, "sendERC20ToSidechain", to, amount, token);
    }
    console.log(res);
}
