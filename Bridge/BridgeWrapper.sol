// SPDX-License-Identifier: Apache License 2.0
pragma solidity 0.8.25;

import {IBridge} from "./IBridge.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DraftBridgeWrapper
 * @dev Contract to interface with an external bridge contract for asset transfers,
 * and to distribute these assets (Ether or ERC20 tokens) to multiple recipients.
 */
contract DraftBridgeWrapper is ReentrancyGuard {
    using SafeERC20 for IERC20;
    /// @dev Address of the Hashi Bridge
    IBridge public immutable bridgeContract;

    error InvalidDistributionAmount();
    error ArrayLengthMismatch();
    /// @dev Error to indicate a failure with processing bridge receipt. Used in 'receiveAndDistribute'.
    error BridgeTransferFailed();
    /// @dev Error to indicate a failure with distributing recied tokens or Ether. Used in 'receiveAndDistribute'.
    error DistributedAmountMismatch();
    /// @dev Error to indicate a failure with sending Eth to a recipient. Used in 'distributeEther'.
    error SendEtherFailed();

    /**
     * @dev Initializes the contract with an address of the bridge contract.
     * @param _bridgeAddress Address of the bridge contract.
     */
    constructor(address _bridgeAddress) {
        bridgeContract = IBridge(_bridgeAddress);
    }

    /**
     * @dev Bridge receipt for recieving tokens.
     * @param tokenAddress Address of the token to be transferred from the Bridge contract.
     * @param amount Amount of tokens or ETH to be transferred.
     * @param txHash Transaction hash on the source chain.
     * @param v Array of final 1 byte of ECDSA signature.
     * @param r Array of first 32 bytes of ECDSA signature.
     * @param s Array of second 32 bytes of ECDSA signature.
     */
    struct BridgeReceipt {
        address tokenAddress;
        uint256 amount;
        address from;
        bytes32 txHash;
        uint8[] v;
        bytes32[] r;
        bytes32[] s;
    }

    /**
     * @dev Retrieves the sidechain token ID associated with a given Ethereum token address.
     * @param tokenAddress Address of the Ethereum token.
     * @return The sidechain token ID as bytes32.
     */
    function getSidechainTokenId(
        address tokenAddress
    ) public view returns (bytes32) {
        return bridgeContract._sidechainTokensByAddress(tokenAddress);
    }

    /**
     * @dev Retrieves the Ethereum address associated with a given sidechain token ID.
     * @param sidechainId The ID of the sidechain token.
     * @return The Ethereum address of the token.
     */
    function getSidechainTokenAddress(
        bytes32 sidechainId
    ) public view returns (address) {
        return bridgeContract._sidechainTokens(sidechainId);
    }

    /**
     * @dev Returns the balance of either Ether or an ERC20 token held by this contract.
     * @param tokenAddress Address of the token (use address(0) for Ether).
     * @return The balance of the token or Ether.
     */
    function getBalance(address tokenAddress) public view returns (uint256) {
        if (tokenAddress == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(tokenAddress).balanceOf(address(this));
        }
    }

    /**
     * @dev Processes the receipt of assets from the bridge and distributes them accordingly.
     * @dev Function doesn't work with deflationary tokens or tokens with modified 'balanceOf' function.
     * @param encodedData Encoded data containing receipt details.
     * @param recipients Array of addresses which token or ETH to be transferred to.
     * @param amounts Array of token or ETH amounts to be transferred to the recipients.
     */
    function receiveAndDistribute(
        bytes calldata encodedData,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant {
        if (recipients.length != amounts.length) revert ArrayLengthMismatch();
        // Decoding receipt data
        BridgeReceipt memory data = abi.decode(encodedData, (BridgeReceipt));
        if (data.amount == 0) revert InvalidDistributionAmount();
        // Fetching balances before processing transfer receipt
        uint256 initialBalance = getBalance(data.tokenAddress);
        // Processing receipt from the bridge
        processBridgeReceipt(data);

        // Verifing receipt of tokens or Ether
        if (getBalance(data.tokenAddress) < initialBalance + data.amount) {
            revert BridgeTransferFailed();
        }

        uint256 totalDistributed;
        // Destiributing recieved tokens between specified array of users
        if (data.tokenAddress == address(0)) {
            totalDistributed = distributeEther(recipients, amounts);
        } else {
            totalDistributed = distributeTokens(
                data.tokenAddress,
                recipients,
                amounts
            );
        }
        // Verifing distribution of tokens or Ether
        if (totalDistributed != data.amount) revert DistributedAmountMismatch();
    }

    /**
     * @dev Internal function to process asset receipt through the bridge.
     * @param data Distribution data struct.
     */
    function processBridgeReceipt(BridgeReceipt memory data) internal {
        bytes32 sidechainId = getSidechainTokenId(data.tokenAddress);
        // Processing receipt based on sidechain id
        if (sidechainId == bytes32(0)) {
            bridgeContract.receiveByEthereumAssetAddress(
                data.tokenAddress,
                data.amount,
                payable(address(this)),
                data.from,
                data.txHash,
                data.v,
                data.r,
                data.s
            );
        } else {
            bridgeContract.receiveBySidechainAssetId(
                sidechainId,
                data.amount,
                address(this),
                data.from,
                data.txHash,
                data.v,
                data.r,
                data.s
            );
        }
    }

    /**
     * @dev Distributes Ether to specified recipients.
     * @param recipients Array of recipient addresses.
     * @param amounts Array of amounts to distribute.
     * @return totalDistributed Total amount of Ether distributed.
     */
    function distributeEther(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) internal returns (uint256 totalDistributed) {
        for (uint256 i = 0; i < recipients.length; i++) {
            (bool success, ) = payable(recipients[i]).call{value: amounts[i]}(
                ""
            );
            if (!success) revert SendEtherFailed();
            totalDistributed += amounts[i];
        }
    }

    /**
     * @dev Distributes ERC20 tokens to specified recipients.
     * @param tokenAddress Address of the ERC20 token to distribute.
     * @param recipients Array of recipient addresses.
     * @param amounts Array of amounts to distribute.
     * @return totalDistributed Total amount of tokens distributed.
     */
    function distributeTokens(
        address tokenAddress,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) internal returns (uint256 totalDistributed) {
        IERC20 token = IERC20(tokenAddress);
        for (uint256 i = 0; i < recipients.length; i++) {
            token.safeTransfer(recipients[i], amounts[i]);
            totalDistributed += amounts[i];
        }
    }
}
