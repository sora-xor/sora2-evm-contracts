class SidechainAsset {
    address: string;
    asset_id: string;
}

class DeployConfig {
    xorAddress: string;
    valAddress: string;
    erc20Addresses: string[];
    sidechainAssets: SidechainAsset[];
    peers: string[];
}

export default DeployConfig;