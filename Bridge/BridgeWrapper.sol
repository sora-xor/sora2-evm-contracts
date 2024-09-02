// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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
}

contract DraftBridgeWrapper is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IBridge public immutable bridgeContract;

    error BridgeTransferFailed();
    error DistributedAmountMismatch();

    constructor(address _bridgeAddress) {
        bridgeContract = IBridge(_bridgeAddress);
    }

    struct DistributionData {
        address tokenAddress;
        uint256 amount;
        address payable to;
        address from;
        bytes32 txHash;
        uint8[] v;
        bytes32[] r;
        bytes32[] s;
        address[] recipients;
        uint256[] amounts;
    }

    function receiveAndDistribute(
        bytes calldata encodedData
    ) external nonReentrant {
        DistributionData memory data = abi.decode(
            encodedData,
            (DistributionData)
        );
        bytes32 sidechainId = bridgeContract._sidechainTokensByAddress(
            data.tokenAddress
        );
        IERC20 token = IERC20(data.tokenAddress);
        uint256 currentBallance = token.balanceOf(address(this));
        if (sidechainId == bytes32(0)) {
            bridgeContract.receiveByEthereumAssetAddress(
                data.tokenAddress,
                data.amount,
                data.to,
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
                data.to,
                data.from,
                data.txHash,
                data.v,
                data.r,
                data.s
            );
        }

        if (token.balanceOf(address(this)) < currentBallance + data.amount)
            revert BridgeTransferFailed();

        uint256 totalDistributed = 0;
        for (uint i = 0; i < data.recipients.length; i++) {
            totalDistributed += data.amounts[i];
            token.safeTransfer(data.recipients[i], data.amounts[i]);
        }

        if (totalDistributed != data.amount) revert DistributedAmountMismatch();
    }
}
