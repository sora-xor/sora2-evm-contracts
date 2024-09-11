import { task } from 'hardhat/config';
import * as sora from "@sora-substrate/util";

task("getRequestInfo", "Fetches receipt info from approved bridge request")
  .addParam("hash", "The transaction hash")
  .setAction(async (taskArgs) => {
    const soraEndpoint:string = "wss://ws.framenode-7.s4.stg1.sora2.soramitsu.co.jp";
    await sora.connection.open(soraEndpoint);
    sora.api.initialize();
    console.log("Connected to:", soraEndpoint);
    let request = await sora.connection.api.rpc.ethBridge.getApprovedRequests([taskArgs.hash], {networkId: 0});
    let response = request.value.toHuman();
    //TODO
    console.log("Tx approve info: ", JSON.stringify(response));
  });