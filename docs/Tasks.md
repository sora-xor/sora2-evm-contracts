## Task 1: `getRequestInfo`

### Purpose

The `getRequestInfo` task fetches approved bridge requests from the Sora blockchain for a specified transaction hash, processes them, and logs the formatted data structure for bridge operations or debugging.

### Usage

1.  **Run the Task**

    ```console
    npx hardhat getRequestInfo --hash <TRANSACTION_HASH>
    ```

    Replace `<TRANSACTION_HASH>` with the desired transaction hash.
    

2.  **Expected Output**

    -   Logs the raw structure of the approved bridge request.
    -   Logs the formatted data structure after processing, which includes the `hash`, `from`, `to`, `amount`, `currencyType`, and signature parts (`r`, `s`, `v` arrays).

### Example

```console
npx hardhat getRequestInfo --hash 0x123abc456def789...
```

### Code Snippet

```ts
task("getRequestInfo", "Fetches receipt info from approved bridge request")
.addParam("hash", "The transaction hash")
.setAction(async (taskArgs, hre) => {     // Implementation provided in the main code   
});
```

---

## Task 2: `encodeAndEstimate`

### Purpose

The `encodeAndEstimate` task combines three main steps:

1.  **Fetch Approved Bridge Request**: Retrieves bridge request data for a specified transaction hash, similar to `getRequestInfo`.
2.  **Format and Validate Data**: Formats and validates the data from the bridge request.
3.  **Encode `wrapperReciept`**: Encodes the formatted data into a tuple structure required for use with an Ethereum-compatible contract.

This task prepares data to be sent to Ethereum-compatible contracts, such as bridge contracts on the Ethereum network.

### Usage

1.  **Run the Task**

    ```console
    npx hardhat encodeAndEstimate --hash <TRANSACTION_HASH>
    ```
    
    Replace `<TRANSACTION_HASH>` with the desired transaction hash.

2.  **Expected Output**

    -   Logs the raw serialized structure of the bridge request data.
    -   Logs the formatted `wrapperReciept` data.
    -   Logs the ABI-encoded `wrapperReciept`, ready for use with Ethereum smart contracts.
    -   Logs estimated gas.

### Example

```console
npx hardhat encodeAndCall --hash 0x123abc456def789...
```

### Code Snippet

```ts
task("encodeAndCall", "Encodes receipt info from approved bridge request")
.addParam("hash", "The transaction hash")
.setAction(async (taskArgs, hre) => {     // Implementation provided in the main code   
});
```

---

## Common Issues

-   **Invalid Transaction Hash**:

    -   Ensure the hash provided is valid and corresponds to an approved bridge request. If invalid, an error message will display in the console.
-   **Connection Errors**:

    -   Confirm that the Sora blockchain endpoint is accessible and that your internet connection is stable. Any connection error will be logged.
-   **Signature Validation Errors**:

    -   If signature data (`r`, `s`, `v` values) are missing or malformed, the task will log a detailed error message.