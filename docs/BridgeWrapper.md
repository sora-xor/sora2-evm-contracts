# BridgeWrapper Contract Documentation

## Overview

The `BridgeWrapper` contract is designed to interface with an external bridge contract for asset transfers, and to distribute these assets (Ether or ERC20 tokens) to multiple recipients. It includes admin functionality to control access to certain critical functions.

## Interface: IBridgeWrapper

### Custom Errors

- **BridgeZeroAddress()**
  - Error to indicate that the bridge address was submitted as address(0) to the constructor.

- **RecipientZeroAddress()**
  - Error to indicate that a recipient address was submitted as address(0).

- **InvalidDistributionAmount()**
  - Error to indicate that the distribution amount is invalid.

- **ArrayLengthMismatch()**
  - Error to indicate that the lengths of recipients and amounts arrays do not match.

- **WalletTransferFailed()**
  - Error to indicate a failure with transferring tokens from the wallet in `receiveFromWalletAndDistribute`.

- **BridgeTransferFailed()**
  - Error to indicate a failure with processing bridge receipt in `receiveAndDistribute`.

- **DistributedAmountMismatch()**
  - Error to indicate a failure with distributing received tokens or Ether in `receiveAndDistribute`.

- **SendEtherFailed()**
  - Error to indicate a failure with sending Ether to a recipient in `distributeEther`.

- **NotAdmin()**
  - Error to indicate that the caller is not an admin. Used in `onlyAdmin` modifier.

- **CannotRemoveLastAdmin()**
  - Error to indicate that removing the last admin is not allowed. Used in `removeAdmin` function.

- **AdminAlreadyExists()**
  - Error to indicate that the admin already exists. Used in `addAdmin` function.

- **AdminDoesNotExist()**
  - Error to indicate that the admin does not exist. Used in `removeAdmin` function.

- **InvalidAdminAddress()**
  - Error to indicate that the provided address is invalid. Used in both `addAdmin` and `removeAdmin` function.

### Events

- **AssetsReceived**
  - Emitted when assets are received either from the bridge or from a wallet.
  - Parameters:
    - `address tokenAddress`: The address of the token received (address(0) for Ether).
    - `uint256 amount`: The amount of tokens or Ether received.
    - `address from`: The address from which the assets were received.

- **AssetsDistributed**
  - Emitted when assets are distributed to recipients.
  - Parameters:
    - `address tokenAddress`: The address of the token distributed (address(0) for Ether).
    - `uint256 totalAmount`: The total amount of tokens or Ether distributed.
    - `address[] recipients`: The array of recipient addresses.
    - `uint256[] amounts`: The array of amounts distributed to each recipient.

- **AdminUpdated**
  - Emitted when an admin is added or removed.
  - Parameters:
    - `address admin`: The address of the admin that was added or removed.
    - `bool isAdded`: True if the admin was added, false if removed.

### Functions

- `function addAdmin(address admin) external`
  - Adds an admin to the whitelist.
  - Parameters:
    - `address admin`: The address of the admin to be added.

- `function removeAdmin(address admin) external`
  - Removes an admin from the whitelist.
  - Parameters:
    - `address admin`: The address of the admin to be removed.

- `function getSidechainTokenId(address tokenAddress) external view returns (bytes32)`
  - Retrieves the sidechain token ID associated with a given Ethereum token address.
  - Parameters:
    - `address tokenAddress`: The address of the Ethereum token.
  - Returns:
    - `bytes32`: The sidechain token ID as bytes32.

- `function getSidechainTokenAddress(bytes32 sidechainId) external view returns (address)`
  - Retrieves the Ethereum address associated with a given sidechain token ID.
  - Parameters:
    - `bytes32 sidechainId`: The ID of the sidechain token.
  - Returns:
    - `address`: The Ethereum address of the token.

- `function getBalance(address tokenAddress) external view returns (uint256)`
  - Returns the balance of either Ether or an ERC20 token held by this contract.
  - Parameters:
    - `address tokenAddress`: Address of the token (use address(0) for Ether).
  - Returns:
    - `uint256`: The balance of the token or Ether.

- `function receiveAndDistribute(bytes calldata encodedData, address[] calldata recipients, uint256[] calldata amounts) external`
  - Processes the receipt of assets from the bridge and distributes them accordingly.
  - Parameters:
    - `bytes encodedData`: Encoded data containing receipt details.
    - `address[] recipients`: Array of addresses to which token or ETH should be transferred.
    - `uint256[] amounts`: Array of token or ETH amounts to be transferred to the recipients.

- `function receiveFromWalletAndDistribute(address tokenAddress, uint256 amount, address[] calldata recipients, uint256[] calldata amounts) external payable`
  - Function to receive Ether or ERC20 tokens directly from a wallet and distribute them.
  - Parameters:
    - `address tokenAddress`: Address of the token to be transferred (use address(0) for Ether).
    - `uint256 amount`: Amount of tokens or Ether to be received.
    - `address[] recipients`: Array of addresses to which token or Ether should be transferred.
    - `uint256[] amounts`: Array of token or Ether amounts to be transferred to the recipients.

- `function sweep(address tokenAddress, address recipient) external`
  - Sweeps all Ether or ERC20 tokens sent to the contract by mistake to the specified recipient.
  - Parameters:
    - `address tokenAddress`: Address of the token to be swept (use address(0) for Ether).
    - `address recipient`: Address to which the swept tokens or Ether will be sent.

## Contract: BridgeWrapper

### Structs

- **BridgeReceipt**
  - Struct used for receiving tokens.
  - Fields:
    - `address tokenAddress`: Address of the token to be transferred from the Bridge contract.
    - `uint256 amount`: Amount of tokens or Ether to be transferred.
    - `address from`: Address from which the assets were transferred.
    - `bytes32 txHash`: Transaction hash on the source chain.
    - `uint8[] v`: Array of final 1 byte of ECDSA signature.
    - `bytes32[] r`: Array of first 32 bytes of ECDSA signature.
    - `bytes32[] s`: Array of second 32 bytes of ECDSA signature.

### Constructor

- `constructor(address _bridgeAddress, address initialAdmin)`
  - Initializes the contract with the address of the bridge contract and initial admin.
  - Parameters:
    - `address _bridgeAddress`: Address of the bridge contract.
    - `address initialAdmin`: Address of the initial admin.

### Modifiers

- `modifier onlyAdmin()`
  - Modifier to restrict access to admin-only functions.
  - Reverts with `NotAdmin` if the caller is not an admin.


### Internal Functions

- `function processBridgeReceipt(BridgeReceipt memory data) internal`
  - Internal function to process asset receipt through the bridge.
  - Parameters:
    - `BridgeReceipt data`: Distribution data struct.

- `function _distribute(address tokenAddress, uint256 amount, address[] calldata recipients, uint256[] calldata amounts) internal`
  - Internal function to distribute either Ether or ERC20 tokens to specified recipients.
  - Parameters:
    - `address tokenAddress`: Address of the token (use address(0) for Ether).
    - `uint256 amount`: Amount of tokens or Ether to distribute.
    - `address[] recipients`: Array of recipient addresses.
    - `uint256[] amounts`: Array of amounts to distribute.

- `function distributeEther(address[] calldata recipients, uint256[] calldata amounts) internal returns (uint256 totalDistributed)`
  - Internal function to distribute Ether to specified recipients.
  - Parameters:
    - `address[] recipients`: Array of recipient addresses.
    - `uint256[] amounts`: Array of amounts to distribute.
  - Returns:
    - `uint256 totalDistributed`: Total amount of Ether distributed.

- `function distributeTokens(address tokenAddress, address[] calldata recipients, uint256[] calldata amounts) internal returns (uint256 totalDistributed)`
  - Internal function to distribute ERC20 tokens to specified recipients.
  - Parameters:
    - `address tokenAddress`: Address of the ERC20 token to distribute.
    - `address[] recipients`: Array of recipient addresses.
    - `uint256[] amounts`: Array of amounts to distribute.
  - Returns:
    - `uint256 totalDistributed`: Total amount of tokens distributed.

### Fallback Functions

- `fallback() external payable`
  - Fallback function to handle direct Ether transfers and calls to non-existent functions.
  - This function will revert any transaction that doesn't match an existing function signature.

- `receive() external payable`
  - Fallback function to handle direct Ether transfers.
  - This function will revert any direct Ether transfer to the contract.
