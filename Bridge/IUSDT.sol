// SPDX-License-Identifier: Apache 2.0

pragma solidity =0.8.17;

// Taken from https://etherscan.io/address/0xdac17f958d2ee523a2206206994597c13d831ec7#code

/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
interface IUSDT {
    function totalSupply() external returns (uint);

    function balanceOf(address who) external returns (uint);

    function transfer(address to, uint value) external;

    event Transfer(address indexed from, address indexed to, uint value);

    function allowance(address owner, address spender) external returns (uint);

    function transferFrom(
        address from,
        address to,
        uint value
    ) external;

    function approve(address spender, uint value) external;

    event Approval(address indexed owner, address indexed spender, uint value);
}
