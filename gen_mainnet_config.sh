#!/bin/bash -v

npx hardhat gen-config --network mainnet --contract-address 0x6f984c337ad5b7c2084805042ae942cef462e3ff --sora-endpoint wss://ws.mof.sora.org --peers 0x6C9E8391a0444c739e7e2edd37A2C6e3381b1cbF,0xEf22D478a53bc8BBe854ceF8bA2eb79C49A1a171,0x6219d0ba6a0bafa69cd2b1b15633a3fd864dd371 --output deploy-data/mainnet.ts
