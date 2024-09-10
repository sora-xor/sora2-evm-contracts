// SPDX-License-Identifier: Apache License 2.0
pragma solidity ^0.8.25;

/**
 * @title IBridgeWrapperErrors
 * @dev Interface for the BridgeWrapper Errors.
 */
interface IBridgeWrapperErrors {
    // Custom Errors
    error BridgeZeroAddress();
    /// @dev Error to indicate that the distribution amount is invalid.
    error InvalidDistributionAmount();
    /// @dev Error to indicate that the lengths of recipients and amounts arrays do not match.
    error ArrayLengthMismatch();
    /// @dev Error to indicate a failure with tranfrerring tokens from the wallet in 'receiveFromWalletAndDistribute'.
    error WalletTransferFailed();
    /// @dev Error to indicate a failure with processing bridge receipt in 'receiveAndDistribute'.
    error BridgeTransferFailed();
    /// @dev Error to indicate a failure with distributing received tokens or Ether in 'receiveAndDistribute'.
    error DistributedAmountMismatch();
    /// @dev Error to indicate a failure with sending Ether to a recipient in 'distributeEther'.
    error SendEtherFailed();
    /// @dev Error to indicate that the caller is not an admin.
    error NotAdmin();
    /// @dev Error to indicate that removing the last admin is not allowed.
    error CannotRemoveLastAdmin();
    /// @dev Error to indicate that the admin already exists.
    error AdminAlreadyExists();
    /// @dev Error to indicate that the admin does not exist.
    error AdminDoesNotExist();
    /// @dev Error to indicate that the provided address is invalid.
    error InvalidAdminAddress();
}