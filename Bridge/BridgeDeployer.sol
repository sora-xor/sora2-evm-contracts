// SPDX-License-Identifier: Apache 2.0

pragma solidity ^0.8.0;

import "./Bridge.sol";

contract BridgeDeployer {
    address public _addressVAL;
    address public _addressXOR;
    bytes32 public _networkId;
    address[] public _initialPeers;
    address[] public _sidechainTokenAddresses;
    bytes32[] public _sidechainAssetIds;
    address[] public _ERC20Addresses;
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
        address[] memory ERC20Addresses,
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
        _ERC20Addresses = ERC20Addresses;
    }

    function deployBridgeContract() external {
        _bridge = new Bridge(
            _initialPeers,
            _sidechainTokenAddresses,
            _sidechainAssetIds,
            _ERC20Addresses,
            _addressVAL,
            _addressXOR,
            _networkId
        );

        emit NewBridgeDeployed(address(_bridge));
    }
}
