// SPDX-License-Identifier: Apache License 2.0

pragma solidity ^0.8.17;

interface IBridge {
    /**
     * @dev Withdraws specified amount of ether or one of ERC-20 tokens to provided sidechain address
     * @param tokenAddress address of token to withdraw (0 for ether)
     * @param amount amount of tokens or ether to withdraw
     * @param to target account address
     * @param txHash hash of transaction from sidechain
     * @param from source of transfer
     * @param v array of signatures of tx_hash (v-component)
     * @param r array of signatures of tx_hash (r-component)
     * @param s array of signatures of tx_hash (s-component)
     */
    function receiveByEthereumAssetAddress(
        address tokenAddress,
        uint256 amount,
        address payable to,
        address from,
        bytes32 txHash,
        uint8[] calldata v,
        bytes32[] calldata r,
        bytes32[] calldata s
    ) external;

    /**
     * @dev Mint new Token
     * @param sidechainAssetId id of sidechainToken to mint
     * @param amount how much to mint
     * @param to destination address
     * @param from sender address
     * @param txHash hash of transaction from Iroha
     * @param v array of signatures of tx_hash (v-component)
     * @param r array of signatures of tx_hash (r-component)
     * @param s array of signatures of tx_hash (s-component)
     */
    function receiveBySidechainAssetId(
        bytes32 sidechainAssetId,
        uint256 amount,
        address to,
        address from,
        bytes32 txHash,
        uint8[] memory v,
        bytes32[] memory r,
        bytes32[] memory s
    ) external;

    function _sidechainTokensByAddress(address) external view returns (bytes32);
    function _sidechainTokens(bytes32) external view returns (address);
}