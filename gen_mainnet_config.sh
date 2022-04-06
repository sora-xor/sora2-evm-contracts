#!/bin/bash -v

npx hardhat gen-config --network mainnet --contract-address 0x1485E9852ac841b52eD44D573036429504f4F602 --sora-endpoint wss://ws.alb.sora.org --peers 0x6C9E8391a0444c739e7e2edd37A2C6e3381b1cbF,0xEf22D478a53bc8BBe854ceF8bA2eb79C49A1a171 --output deploy-data/mainnet.ts
