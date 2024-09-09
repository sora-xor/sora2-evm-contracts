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

    // Custom Errors
    /// @dev Error to indicate that the distribution amount is invalid.
    error InvalidDistributionAmount();
    /// @dev Error to indicate that the lengths of recipients and amounts arrays do not match.
    error ArrayLengthMismatch();
    /// @dev Error to indicate a failure with processing bridge receipt in 'receiveAndDistribute'.
    error BridgeTransferFailed();
    /// @dev Error to indicate a failure with distributing received tokens or Ether in 'receiveAndDistribute'.
    error DistributedAmountMismatch();
    /// @dev Error to indicate a failure with sending Ether to a recipient in 'distributeEther'.
    error SendEtherFailed();

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

    /**
     * @dev Initializes the contract with an address of the bridge contract.
     * @param _bridgeAddress Address of the bridge contract.
     */
    constructor(address _bridgeAddress) {
        bridgeContract = IBridge(_bridgeAddress);
    }

    /**
     * @dev Bridge receipt for receiving tokens.
     * @param tokenAddress Address of the token to be transferred from the Bridge contract.
     * @param amount Amount of tokens or Ether to be transferred.
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
     * @param recipients Array of addresses to which token or ETH should be transferred.
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

        // Verifying receipt of tokens or Ether
        if (getBalance(data.tokenAddress) < initialBalance + data.amount) {
            revert BridgeTransferFailed();
        }

        emit AssetsReceived(data.tokenAddress, data.amount, data.from);
        _distribute(data.tokenAddress, data.amount, recipients, amounts);
    }

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
    ) external payable nonReentrant {
        if (recipients.length != amounts.length) revert ArrayLengthMismatch();
        if (amount == 0) revert InvalidDistributionAmount();

        uint256 initialBalance = getBalance(tokenAddress);

        if (tokenAddress == address(0)) {
            // For Ether, ensure the msg.value matches the amount
            if (msg.value != amount) revert InvalidDistributionAmount();
        } else {
            // For ERC20 tokens, transfer the tokens from the sender to this contract
            IERC20(tokenAddress).safeTransferFrom(
                msg.sender,
                address(this),
                amount
            );
        }

        // Verifying receipt of tokens or Ether
        if (getBalance(tokenAddress) < initialBalance + amount) {
            revert BridgeTransferFailed();
        }

        emit AssetsReceived(tokenAddress, amount, msg.sender);
        _distribute(tokenAddress, amount, recipients, amounts);
    }

    /**
     * @dev Sweeps all Ether or ERC20 tokens sent to the contract by mistake to the specified recipient.
     * @param tokenAddress Address of the token to be swept (use address(0) for Ether).
     * @param recipient Address to which the swept tokens or Ether will be sent.
     */
    function sweep(address tokenAddress, address recipient) external {
        uint256 balance = getBalance(tokenAddress);
        if (tokenAddress == address(0)) {
            // Sweep Ether
            (bool success, ) = payable(recipient).call{value: balance}("");
            if (!success) revert SendEtherFailed();
        } else {
            // Sweep ERC20 tokens
            IERC20(tokenAddress).safeTransfer(recipient, balance);
        }
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
     * @dev Internal function to distribute either Ether or ERC20 tokens to specified recipients.
     * @param tokenAddress Address of the token (use address(0) for Ether).
     * @param amount Amount of tokens or Ether to distribute.
     * @param recipients Array of recipient addresses.
     * @param amounts Array of amounts to distribute.
     */
    function _distribute(
        address tokenAddress,
        uint256 amount,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) internal {
        uint256 totalDistributed;
        if (tokenAddress == address(0)) {
            totalDistributed = distributeEther(recipients, amounts);
        } else {
            totalDistributed = distributeTokens(
                tokenAddress,
                recipients,
                amounts
            );
        }

        if (totalDistributed != amount) revert DistributedAmountMismatch();
        emit AssetsDistributed(tokenAddress, amount, recipients, amounts);
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
            unchecked {
                totalDistributed += amounts[i];
            }
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
            unchecked {
                totalDistributed += amounts[i];
            }
        }
    }

    /**
     * @dev Fallback function to handle direct Ether transfers and calls to non-existent functions.
     * This function will revert any transaction that doesn't match an existing function signature.
     */
    fallback() external payable {
        revert("Fallback function called: function does not exist");
    }

    /**
     * @dev Fallback function to handle direct Ether transfers.
     * This function will revert any direct Ether transfer to the contract.
     */
    receive() external payable {
        revert("Direct Ether transfers are not allowed");
    }
}
