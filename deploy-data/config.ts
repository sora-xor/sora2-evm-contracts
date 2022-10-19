interface SidechainAsset {
    address: string;
    asset_id: string;
}

interface DeployConfig {
    xorAddress: string;
    valAddress: string;
    usdtAddress: string;
    erc20Addresses: string[];
    sidechainAssets: SidechainAsset[];
    peers: string[];
}

export default DeployConfig;