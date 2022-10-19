
import DeployConfig from "./config";

const config: DeployConfig = {
    "xorAddress": "0x83ba842e5e26a4eda2466891221187aabbc33692",
    "valAddress": "0x7fcb82ab5a4762f0f18287ece64d4ec74b6071c0",
    usdtAddress: undefined,
    "sidechainAssets": [
        {
            "address": "0x4c8886E4B8d4bb146cbC03B851307FDDf869fe8B",
            "asset_id": "0x003ae6414d8672adcc534ba4df4e1195e915ef24aec74406b86a4d878903ba30"
        }
    ],
    "erc20Addresses": [
        "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea"
    ],
    "peers": [
        "0x981bccf6d8593dc49c22cf744a59afa5a2b23118",
        "0x90dca3c91c10e802093318123ad8bb8809061765",
        "0x457d710255184dbf63c019ab50f65743c6cb072f"
    ]
};

export default config;
