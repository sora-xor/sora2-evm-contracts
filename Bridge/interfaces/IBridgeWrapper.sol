// SPDX-License-Identifier: Apache License 2.0
pragma solidity ^0.8.25;

/**
 * @title IBridgeWrapper
 * @dev Interface for the BridgeWrapper contract.
 */
interface IBridgeWrapper {
    // Events
    /// @dev Emitted when assets are received either from the bridge or from a wallet.
    /// @param tokenAddress The address of the token received (address(0) for Ether).
    /// @param amount The amount of tokens or Ether received.
    /// @param from The address from which the assets were received.
    event AssetsReceived(
        address indexed tokenAddress,
        uint256 amount,
        address indexed from
    );

    /// @dev Emitted when assets are distributed to recipients.
    /// @param tokenAddress The address of the token distributed (address(0) for Ether).
    /// @param totalAmount The total amount of tokens or Ether distributed.
    /// @param recipients The array of recipient addresses.
    /// @param amounts The array of amounts distributed to each recipient.
    event AssetsDistributed(
        address indexed tokenAddress,
        uint256 totalAmount,
        address[] recipients,
        uint256[] amounts
    );

    /// @dev Emitted when an admin is added or removed.
    /// @param admin The address of the admin that was added or removed.
    /// @param isAdded True if the admin was added, false if removed.
    event AdminUpdated(address indexed admin, bool isAdded);

    /**
     * @dev Adds an admin to the whitelist.
     * @param admin The address of the admin to be added.
     */
    function addAdmin(address admin) external;

    /**
     * @dev Removes an admin from the whitelist.
     * @param admin The address of the admin to be removed.
     */
    function removeAdmin(address admin) external;

    /**
     * @dev Retrieves the sidechain token ID associated with a given Ethereum token address.
     * @param tokenAddress Address of the Ethereum token.
     * @return The sidechain token ID as bytes32.
     */
    function getSidechainTokenId(address tokenAddress) external view returns (bytes32);

    /**
     * @dev Retrieves the Ethereum address associated with a given sidechain token ID.
     * @param sidechainId The ID of the sidechain token.
     * @return The Ethereum address of the token.
     */
    function getSidechainTokenAddress(bytes32 sidechainId) external view returns (address);

    /**
     * @dev Returns the balance of either Ether or an ERC20 token held by this contract.
     * @param tokenAddress Address of the token (use address(0) for Ether).
     * @return The balance of the token or Ether.
     */
    function getBalance(address tokenAddress) external view returns (uint256);

    /**
     * @dev Processes the receipt of assets from the bridge and distributes them accordingly.
     * @param encodedData Encoded data containing receipt details.
     * @param recipients Array of addresses to which token or ETH should be transferred.
     * @param amounts Array of token or ETH amounts to be transferred to the recipients.
     */
    function receiveAndDistribute(
        bytes calldata encodedData,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external;

    /**
     * @dev Function to receive Ether or ERC20 tokens directly from a wallet and distribute them.
     * @param tokenAddress Address of the token to be transferred (use address(0) for Ether).
     * @param amount Amount of tokens or Ether to be received.
     * @param recipients Array of addresses to which token or Ether should be transferred.
     * @param amounts Array of token or Ether amounts to be transferred to the recipients.
     */
    function receiveFromWalletAndDistribute(
        address tokenAddress,
        uint256 amount,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external payable;

    /**
     * @dev Sweeps all Ether or ERC20 tokens sent to the contract by mistake to the specified recipient.
     * @param tokenAddress Address of the token to be swept (use address(0) for Ether).
     * @param recipient Address to which the swept tokens or Ether will be sent.
     */
    function sweep(address tokenAddress, address recipient) external;
}