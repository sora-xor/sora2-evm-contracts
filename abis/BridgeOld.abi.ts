const abi = [
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "initialPeers",
        "type": "address[]"
      },
      {
        "internalType": "address",
        "name": "addressVAL",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "addressXOR",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "networkId",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "peerId",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "removal",
        "type": "bool"
      }
    ],
    "name": "ChangePeers",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "destination",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "sidechainAsset",
        "type": "bytes32"
      }
    ],
    "name": "Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "Migrated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "PreparedForMigration",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "txHash",
        "type": "bytes32"
      }
    ],
    "name": "Withdrawal",
    "type": "event"
  },
  {
    "stateMutability": "nonpayable",
    "type": "fallback"
  },
  {
    "inputs": [],
    "name": "_addressVAL",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "_addressXOR",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "_networkId",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "_sidechainTokenAddressArray",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "_sidechainTokens",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "_sidechainTokensByAddress",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "_uniqueAddresses",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "acceptedEthTokens",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newToken",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "ticker",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "decimals",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "txHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint8[]",
        "name": "v",
        "type": "uint8[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "r",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "s",
        "type": "bytes32[]"
      }
    ],
    "name": "addEthNativeToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "decimals",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "sidechainAssetId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "txHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint8[]",
        "name": "v",
        "type": "uint8[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "r",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "s",
        "type": "bytes32[]"
      }
    ],
    "name": "addNewSidechainToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newPeerAddress",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "txHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint8[]",
        "name": "v",
        "type": "uint8[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "r",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "s",
        "type": "bytes32[]"
      }
    ],
    "name": "addPeerByPeer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isPeer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "peersCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "thisContractAddress",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      },
      {
        "internalType": "uint8[]",
        "name": "v",
        "type": "uint8[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "r",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "s",
        "type": "bytes32[]"
      }
    ],
    "name": "prepareForMigration",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "txHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint8[]",
        "name": "v",
        "type": "uint8[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "r",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "s",
        "type": "bytes32[]"
      }
    ],
    "name": "receiveByEthereumAssetAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "sidechainAssetId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "txHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint8[]",
        "name": "v",
        "type": "uint8[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "r",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "s",
        "type": "bytes32[]"
      }
    ],
    "name": "receiveBySidechainAssetId",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "receivePayment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "peerAddress",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "txHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint8[]",
        "name": "v",
        "type": "uint8[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "r",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "s",
        "type": "bytes32[]"
      }
    ],
    "name": "removePeerByPeer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "to",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      }
    ],
    "name": "sendERC20ToSidechain",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "to",
        "type": "bytes32"
      }
    ],
    "name": "sendEthToSidechain",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "thisContractAddress",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      },
      {
        "internalType": "address payable",
        "name": "newContractAddress",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "erc20nativeTokens",
        "type": "address[]"
      },
      {
        "internalType": "uint8[]",
        "name": "v",
        "type": "uint8[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "r",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "s",
        "type": "bytes32[]"
      }
    ],
    "name": "shutDownAndMigrate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "used",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]

export default abi;