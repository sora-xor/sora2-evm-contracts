import { task } from 'hardhat/config';
import { ethers } from "hardhat";
import * as sora from "@sora-substrate/util";

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

// Interface for the TransferContainer containing the transfer object
interface TransferContainer {
  transfer: OutgoingRequestEncoded;
}

// Interface for each item in serializedResponse
type ResponseData = [TransferContainer, Signature[]];

// Centralized error logging function
const logError = (message: string, error?: unknown) => {
  console.error(`[ERROR] ${message}`);
  if (error instanceof Error) {
    console.error(`Details: ${error.message}`);
  }
};

task("getRequestInfo", "Fetches receipt info from approved bridge request")
  .addParam("hash", "The transaction hash")
  .setAction(async (taskArgs) => {
    const soraEndpoint: string = "wss://ws.framenode-7.s4.stg1.sora2.soramitsu.co.jp";
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
      const serializedResponse: ResponseData[] = JSON.parse(JSON.stringify(rpcResponse.asOk));
      console.log("Serialized Response Structure:", JSON.stringify(serializedResponse, null, 2));

      // Process each response item in serializedResponse
      const formattedDataArray = serializedResponse.map((responseData) => {
        const [transferContainer, signatures] = responseData;

        // Validate transferContainer and signatures
        if (!transferContainer?.transfer || !Array.isArray(signatures)) {
          logError("Transfer data or signatures data is missing or malformed.");
          return null;
        }

        const transfer = transferContainer.transfer;

        // Transform to the desired output format
        return {
          hash: transfer.txHash,
          from: transfer.from,
          to: transfer.to,
          amount: String(transfer.amount),
          tokenAddress: transfer.currencyId.tokenAddress,
          r: signatures.map((sig) => sig.r),
          s: signatures.map((sig) => sig.s),
          v: signatures.map((sig) => (sig.v === 1 ? 28 : 27))
        };
      }).filter(Boolean); // Filter out any null entries due to errors

      // Log the formatted data
      console.log("Formatted RPC Requests:", formattedDataArray);

    } catch (error) {
      logError("Error connecting or fetching data", error);
    } finally {
      // Close the connection to clean up resources
      sora.connection.close();
      console.log("Connection closed.");
    }
  });
