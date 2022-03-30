pragma solidity ^0.7.4;
// "SPDX-License-Identifier: Apache License 2.0"

import "./Bridge.sol";

contract BridgeDeployer {
    address public _addressVAL;
    address public _addressXOR;
    bytes32 public _networkId;
    address[] public _initialPeers;
    address[] public _sidechainTokenAddresses;
    bytes32[] public _sidechainAssetIds;
    Bridge public _bridge;

    event NewBridgeDeployed(address bridgeAddress);

    /**
     * Constructor.
     * @param initialPeers - list of initial bridge validators on substrate side.
     * @param addressVAL address of VAL token Contract
     * @param addressXOR address of XOR token Contract
     * @param networkId id of current EVM network used for bridge purpose.
     */
    constructor(
        address[] memory initialPeers,
        address[] memory sidechainTokenAddresses,
        bytes32[] memory sidechainAssetIds,
        address addressVAL,
        address addressXOR,
        bytes32 networkId
    ) {
        _initialPeers = initialPeers;
        _addressXOR = addressXOR;
        _addressVAL = addressVAL;
        _networkId = networkId;
        _sidechainAssetIds = sidechainAssetIds;
        _sidechainTokenAddresses = sidechainTokenAddresses;
    }

    function deployBridgeContract() public {
        _bridge = new Bridge(
            _initialPeers,
            _sidechainTokenAddresses,
            _sidechainAssetIds,
            _addressVAL,
            _addressXOR,
            _networkId
        );

        emit NewBridgeDeployed(address(_bridge));
    }
}
