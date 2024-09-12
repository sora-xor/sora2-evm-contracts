import { task } from 'hardhat/config';
import { ethers } from "hardhat";
import * as sora from "@sora-substrate/util";

task("getRequestInfo", "Fetches receipt info from approved bridge request")
  .addParam("hash", "The transaction hash")
  .setAction(async (taskArgs) => {
    const soraEndpoint:string = "wss://ws.framenode-7.s4.stg1.sora2.soramitsu.co.jp";
    await sora.connection.open(soraEndpoint);
    sora.api.initialize();
    console.log("Connected to:", soraEndpoint);
    const apiRequest = await sora.api.bridgeProxy.eth.getApprovedRequest(taskArgs.hash);
    const rpcRequest = (await sora.connection.api.rpc.ethBridge.getApprovedRequests([taskArgs.hash], {networkId: 0})).asOk;
    //TODO
    const assetIds = rpcRequest.map((res) => {
      console.log(JSON.parse(JSON.stringify(res)))
    })
    console.log("Tx approve info: ", apiRequest);
  });