
import DeployConfig from "./config";

const config: DeployConfig = {
    "xorAddress": "0x9826ecfcd937c4518e1c42b3703c7cb908b61197",
    "valAddress": "0x88ee18defc56d78417b0d331e794ef75799ca6d1",
    usdtAddress: undefined,
    "sidechainAssets": [
        {
            "address": "0x37F93FD8A3c606B3a8cceB84e8613238707137ee",
            "asset_id": "0x0200050000000000000000000000000000000000000000000000000000000000"
        },
        {
            "address": "0x59f012ed3Bc3B7c039Dd42a6941dFAF5429f3db2",
            "asset_id": "0x008bcfd2387d3fc453333557eecb0efe59fcba128769b2feefdd306e98e66440"
        }
    ],
    "erc20Addresses": [
        "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
        "0xdc2e1034f6e37e9cd7027750a076268a9d66657e",
        "0x5be8675460a385f3daecdd7f4bbc16779250ac56"
    ],
    "peers": [
        "0x981bccf6d8593dc49c22cf744a59afa5a2b23118",
        "0x90dca3c91c10e802093318123ad8bb8809061765",
        "0x457d710255184dbf63c019ab50f65743c6cb072f"
    ]
};

export default config;
