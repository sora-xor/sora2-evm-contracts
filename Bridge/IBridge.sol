// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

interface IBridge {
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