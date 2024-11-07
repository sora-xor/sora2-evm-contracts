import { task } from 'hardhat/config';
import * as sora from "@sora-substrate/util";
import { ethers } from "hardhat";

// Interface for the Transfer object within each response
interface OutgoingRequestEncoded {
  currencyId: {
    tokenAddress: string;
  };
  amount: number;
  to: string;
  from: string;
  txHash: string;
  networkId: string;
  raw: string;
}

// Interface for each Signature object
interface Signature {
  r: string;
  s: string;
  v: number;
}

// Centralized error logging function
const logError = (message: string, error?: unknown) => {
  console.error(`[ERROR] ${message}`);
  if (error instanceof Error) {
    console.error(`Details: ${error.message}`);
  }
};

// Main task
task("encodeAndEstimate", "Encodes receipt info from approved bridge request")
  .addParam("hash", "The transaction hash")
  .setAction(async (taskArgs, hre) => {
    const soraEndpoint: string = "wss://ws.framenode-7.s4.stg1.sora2.soramitsu.co.jp";
    const bridgeWrapper = await hre.ethers.getContractAt("BridgeWrapper", "0x5b05244ceCB216A4c14E7CE50cba5182e7F4C2a4");
    const bridgeAddress = await bridgeWrapper.bridgeContract();
    const bridge = await hre.ethers.getContractAt("Bridge", bridgeAddress);
    const coder = hre.ethers.AbiCoder.defaultAbiCoder();

    try {
      await sora.connection.open(soraEndpoint);
      await sora.api.initialize();
      console.log("Connected to:", soraEndpoint);

      // Fetch the approved request using the provided hash
      const rpcResponse = await sora.connection.api.rpc.ethBridge.getApprovedRequests(
        [taskArgs.hash],
        { networkId: 0 }
      );

      if (!rpcResponse.isOk) {
        logError("Error in RPC response", rpcResponse.asErr);
        return;
      }

      // Serialize and parse the response into a JSON-compatible structure
      const serializedResponse = JSON.parse(JSON.stringify(rpcResponse.asOk));
      console.log("Serialized Response Structure:", JSON.stringify(serializedResponse, null, 2));

      // Extract the transferContainer and signatures
      const responseData = serializedResponse[0];
      if (!Array.isArray(responseData) || responseData.length !== 2) {
        logError("Serialized response is not in the expected array format.");
        return;
      }

      const [transferContainer, signatures] = responseData;

      if (!transferContainer?.transfer || !Array.isArray(signatures)) {
        logError("Transfer data or signatures data is missing or malformed.");
        return;
      }

      const transfer = transferContainer.transfer as OutgoingRequestEncoded;

      // Transform to the desired output format
      const formattedData = {
        tokenAddress: transfer.currencyId.tokenAddress,
        amount: String(transfer.amount),
        to: transfer.to,
        from: transfer.from,
        txHash: transfer.txHash,
        v: signatures.map((sig: Signature) => (sig.v === 1 ? 28 : 27)),
        r: signatures.map((sig: Signature) => sig.r),
        s: signatures.map((sig: Signature) => sig.s),
      };

      console.log("Formatted RPC Request:", formattedData);

      if (formattedData.to !== await bridgeWrapper.getAddress()) {
        logError("Wrong recipient address");
        return;
      }

      // Prepare the data for the wrapper
      const wrapperRecipet = {
        tokenAddress: formattedData.tokenAddress,
        amount: formattedData.amount,
        from: formattedData.from,
        txHash: formattedData.txHash,
        v: formattedData.v,
        r: formattedData.r,
        s: formattedData.s,
      };

      const txGasBridge = await bridge.receiveByEthereumAssetAddress.estimateGas(
        formattedData.tokenAddress,
        formattedData.amount,
        formattedData.to,
        formattedData.from,
        formattedData.txHash,
        formattedData.v,
        formattedData.r,
        formattedData.s
      );
      console.log("Tx Gas:", txGasBridge);

      const encodedData = coder.encode(
        ["tuple(address tokenAddress, uint256 amount, address from, bytes32 txHash, uint8[] v, bytes32[] r, bytes32[] s)"],
        [wrapperRecipet]
      );
      console.log("Encoded RPC Request:", encodedData);

      const txGasWrapper = await bridgeWrapper.receiveAndDistribute.estimateGas(
        encodedData,
        ["0x62e52452862f4bf0203db88e0b0d2ddb58c830c8"],
        [formattedData.amount]
      );
      console.log("Tx Gas:", txGasWrapper);

    } catch (error) {
      logError("Error connecting or fetching data", error);
    } finally {
      sora.connection.close();
      console.log("Connection closed.");
    }
  });
