// SPDX-License-Identifier: Apache License 2.0
pragma solidity 0.8.25;

import {IBridge} from "./interfaces/IBridge.sol";
import {IBridgeWrapper} from "./interfaces/IBridgeWrapper.sol";
import {IBridgeWrapperErrors} from "./interfaces/IBridgeWrapperErrors.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BridgeWrapper
 * @dev Contract to interface with an external bridge contract for asset transfers,
 * and to distribute these assets (Ether or ERC20 tokens) to multiple recipients.
 */
contract BridgeWrapper is
    ReentrancyGuard,
    IBridgeWrapper,
    IBridgeWrapperErrors
{
    using SafeERC20 for IERC20;
    /// @dev Address of the Hashi Bridge
    IBridge public immutable bridgeContract;
    /// @dev Mapping to store whitelist of admin addresses and count of admins
    mapping(address => bool) public admins;
    uint256 public adminCount;

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
     * @dev Initializes the contract with the address of the bridge contract and initial admin.
     * @param bridgeAddress Address of the bridge contract.
     * @param initialAdmin Address of the initial admin.
     */
    constructor(address bridgeAddress, address initialAdmin) {
        if (bridgeAddress == address(0)) revert InvalidAdminAddress();
        if (initialAdmin == address(0)) revert InvalidAdminAddress();
        
        bridgeContract = IBridge(bridgeAddress);
        admins[initialAdmin] = true;
        ++adminCount; // Add the initial admin
    }

    /**
     * @dev Modifier to restrict access to admin-only functions.
     */
    modifier onlyAdmin() {
        if (!admins[msg.sender]) revert NotAdmin();
        _;
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
        if (msg.sender != address(bridgeContract)) revert("Direct Ether transfers are not allowed");
    }

    /**
     * @inheritdoc IBridgeWrapper
     */
    function addAdmin(address admin) external onlyAdmin {
        if (admin == address(0)) revert InvalidAdminAddress();
        if (admins[admin]) revert AdminAlreadyExists();

        admins[admin] = true;
        ++adminCount;
        emit AdminUpdated(admin, true);
    }

    /**
     * @inheritdoc IBridgeWrapper
     */
    function removeAdmin(address admin) external onlyAdmin {
        if (admin == address(0)) revert InvalidAdminAddress();
        if (!admins[admin]) revert AdminDoesNotExist();
        if (adminCount == 1) revert CannotRemoveLastAdmin();

        admins[admin] = false;
        adminCount--;
        emit AdminUpdated(admin, false);
    }

    /**
     * @inheritdoc IBridgeWrapper
     */
    function getSidechainTokenId(
        address tokenAddress
    ) public view returns (bytes32) {
        return bridgeContract._sidechainTokensByAddress(tokenAddress);
    }

    /**
     * @inheritdoc IBridgeWrapper
     */
    function getSidechainTokenAddress(
        bytes32 sidechainId
    ) public view returns (address) {
        return bridgeContract._sidechainTokens(sidechainId);
    }

    /**
     * @inheritdoc IBridgeWrapper
     */
    function getBalance(address tokenAddress) public view returns (uint256) {
        if (tokenAddress == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(tokenAddress).balanceOf(address(this));
        }
    }

    /**
     * @inheritdoc IBridgeWrapper
     */
    function receiveAndDistribute(
        bytes calldata encodedData,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant onlyAdmin {
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
     * @inheritdoc IBridgeWrapper
     */
    function receiveFromWalletAndDistribute(
        address tokenAddress,
        uint256 amount,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external payable nonReentrant {
        if (recipients.length != amounts.length) revert ArrayLengthMismatch();
        if (amount == 0) revert InvalidDistributionAmount();

        if (tokenAddress == address(0)) {
            // For Ether, ensure the msg.value matches the amount
            if (msg.value != amount) revert InvalidDistributionAmount();
        } else {
            uint256 initialBalance = getBalance(tokenAddress);
            // For ERC20 tokens, transfer the tokens from the sender to this contract
            IERC20(tokenAddress).safeTransferFrom(
                msg.sender,
                address(this),
                amount
            );
            // Verifying receipt of tokens or Ether
            if (getBalance(tokenAddress) < initialBalance + amount) {
                revert WalletTransferFailed();
            }
        }

        emit AssetsReceived(tokenAddress, amount, msg.sender);
        _distribute(tokenAddress, amount, recipients, amounts);
    }

    /**
     * @inheritdoc IBridgeWrapper
     */
    function sweep(
        address tokenAddress,
        address recipient
    ) external nonReentrant onlyAdmin {
        if (recipient == address(0)) revert RecipientZeroAddress();
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
}
