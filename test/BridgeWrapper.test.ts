import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Bridge, BridgeWrapper, MasterToken, ERC20MockToken } from "../typechain";


describe("BridgeWrapper", function () {
  let bridge: Bridge;
  let bridgeWrapper: BridgeWrapper;
  let sidechainAsset: MasterToken;
  let erc20Asset: ERC20MockToken;
  let owner: HardhatEthersSigner;
  let admin: HardhatEthersSigner;
  let peer: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let recipient1: HardhatEthersSigner
  let recipient2: HardhatEthersSigner;

  let coder = ethers.AbiCoder.defaultAbiCoder();

  before(async function () {
    [owner, admin, peer, user1, user2, recipient1, recipient2] = await ethers.getSigners();

    let SidechainTokenFactory = await ethers.getContractFactory("MasterToken");
    let ERC20TokenFactory = await ethers.getContractFactory("ERC20MockToken");
    sidechainAsset = await SidechainTokenFactory.deploy('TestSidechain', 'STST', 18, owner.address, ethers.parseEther("10000"), "0x008bcfd2387d3fc453333557eecb0efe59fcba128769b2feefdd306e98e66440");
    erc20Asset = await ERC20TokenFactory.deploy('TestToken', 'TST');

    let BridgeFactory = await ethers.getContractFactory("Bridge");
    bridge = await BridgeFactory.deploy([peer.address], [await sidechainAsset.getAddress()], ['0x008bcfd2387d3fc453333557eecb0efe59fcba128769b2feefdd306e98e66440'], [await erc20Asset.getAddress()], await sidechainAsset.getAddress(), await sidechainAsset.getAddress(), ethers.ZeroHash);
    await bridge.waitForDeployment();

    await bridge.receivePayment({ from: owner, value: ethers.parseEther("3") });

    let BridgeWrapper = await ethers.getContractFactory("BridgeWrapper");
    bridgeWrapper = await BridgeWrapper.deploy(await bridge.getAddress(), owner.address);
    await bridgeWrapper.waitForDeployment();

    await sidechainAsset.transferOwnership(await bridge.getAddress());
    await erc20Asset.mint(await bridge.getAddress(), ethers.parseEther("1000"));

  });

  describe("Admin Management", function () {
    it("should add an admin", async function () {
      await bridgeWrapper.addAdmin(admin.address);
      expect(await bridgeWrapper.admins(admin.address)).to.be.equal(true);
    });

    it("should not add an admin with address 0x0", async function () {
      await expect(bridgeWrapper.addAdmin(ethers.ZeroAddress)).to.be.revertedWithCustomError(bridgeWrapper, "InvalidAdminAddress");
    });

    it("should not add a duplicate admin", async function () {
      await expect(bridgeWrapper.addAdmin(admin.address)).to.be.revertedWithCustomError(bridgeWrapper, "AdminAlreadyExists");
    });

    it("should not add an if a caller is not autorized", async function () {
      await expect(bridgeWrapper.connect(user1).addAdmin(user1.address)).to.be.revertedWithCustomError(bridgeWrapper, "NotAdmin");
    });

    it("should remove an admin", async function () {
      await bridgeWrapper.removeAdmin(admin.address);
      expect(await bridgeWrapper.admins(admin.address)).to.be.equal(false);
    });

    it("should not remove an admin with address 0x0", async function () {
      await expect(bridgeWrapper.removeAdmin(ethers.ZeroAddress)).to.be.revertedWithCustomError(bridgeWrapper, "InvalidAdminAddress");
    });

    it("should not remove a non-existent admin", async function () {
      await expect(bridgeWrapper.removeAdmin(admin.address)).to.be.revertedWithCustomError(bridgeWrapper, "AdminDoesNotExist");
    });

    it("should not remove the last admin", async function () {
      await expect(bridgeWrapper.removeAdmin(owner.address)).to.be.revertedWithCustomError(bridgeWrapper, "CannotRemoveLastAdmin");
    });
  });

  describe("Asset Management", function () {
    it("should receive and distribute erc20 assets", async function () {
      const BridgeReceipt = {
        tokenAddress: await erc20Asset.getAddress(),
        amount: ethers.parseEther("100"),
        from: admin.address,
        to: await bridgeWrapper.getAddress(),
        txHash: ethers.keccak256("0x1337"),
      };

      const encodedBridgeReciept = ethers.keccak256(coder.encode(
        ["string", "address", "address", "uint256", "address", "address", "bytes32", "bytes32"],
        ["transfer", await bridge.getAddress(), BridgeReceipt.tokenAddress, BridgeReceipt.amount, BridgeReceipt.to, BridgeReceipt.from, BridgeReceipt.txHash, await bridge._networkId()]
      ));

      let signature = ethers.Signature.from(await peer.signMessage(ethers.getBytes(encodedBridgeReciept)));

      const BridgeWrapperReceipt = {
        tokenAddress: BridgeReceipt.tokenAddress,
        amount: BridgeReceipt.amount,
        from: BridgeReceipt.from,
        txHash: BridgeReceipt.txHash,
        v: [signature.v],
        r: [signature.r],
        s: [signature.s]
      };

      const encodedData = coder.encode(
        ["tuple(address tokenAddress, uint256 amount, address from, bytes32 txHash, uint8[] v, bytes32[] r, bytes32[] s)"],
        [BridgeWrapperReceipt]
      );

      const recipients = [recipient1.address, recipient2.address];
      const amounts = [ethers.parseEther("50"), ethers.parseEther("50")];

      expect(await erc20Asset.balanceOf(recipient1.address)).to.equal(ethers.parseEther("0"));
      expect(await erc20Asset.balanceOf(recipient2.address)).to.equal(ethers.parseEther("0"));

      await bridgeWrapper.receiveAndDistribute(encodedData, recipients, amounts);

      expect(await erc20Asset.balanceOf(recipient1.address)).to.equal(ethers.parseEther("50"));
      expect(await erc20Asset.balanceOf(recipient2.address)).to.equal(ethers.parseEther("50"));
    });

    it("should receive and distribute eth", async function () {
      const BridgeReceipt = {
        tokenAddress: ethers.ZeroAddress,
        amount: ethers.parseEther("2"),
        from: admin.address,
        to: await bridgeWrapper.getAddress(),
        txHash: ethers.keccak256("0x1338"),
      };

      const encodedBridgeReciept = ethers.keccak256(coder.encode(
        ["string", "address", "address", "uint256", "address", "address", "bytes32", "bytes32"],
        ["transfer", await bridge.getAddress(), BridgeReceipt.tokenAddress, BridgeReceipt.amount, BridgeReceipt.to, BridgeReceipt.from, BridgeReceipt.txHash, await bridge._networkId()]
      ));

      let signature = ethers.Signature.from(await peer.signMessage(ethers.getBytes(encodedBridgeReciept)));

      const BridgeWrapperReceipt = {
        tokenAddress: BridgeReceipt.tokenAddress,
        amount: BridgeReceipt.amount,
        from: BridgeReceipt.from,
        txHash: BridgeReceipt.txHash,
        v: [signature.v],
        r: [signature.r],
        s: [signature.s]
      };

      const encodedData = coder.encode(
        ["tuple(address tokenAddress, uint256 amount, address from, bytes32 txHash, uint8[] v, bytes32[] r, bytes32[] s)"],
        [BridgeWrapperReceipt]
      );

      const recipients = [recipient1.address, recipient2.address];
      const amounts = [ethers.parseEther("1"), ethers.parseEther("1")];

      expect(await ethers.provider.getBalance(await bridge.getAddress())).to.equal(ethers.parseEther("3"));
      expect(await bridgeWrapper.getBalance(ethers.ZeroAddress)).to.equal(ethers.parseEther("0"));
      expect(await ethers.provider.getBalance(recipient1.address)).to.equal(ethers.parseEther("10000"));
      expect(await ethers.provider.getBalance(recipient2.address)).to.equal(ethers.parseEther("10000"));

      await bridgeWrapper.receiveAndDistribute(encodedData, recipients, amounts);

      expect(await bridgeWrapper.getBalance(ethers.ZeroAddress)).to.equal(ethers.parseEther("0"));
      expect(await ethers.provider.getBalance(await bridge.getAddress())).to.equal(ethers.parseEther("1"));
      expect(await ethers.provider.getBalance(recipient1.address)).to.equal(ethers.parseEther("10001"));
      expect(await ethers.provider.getBalance(recipient2.address)).to.equal(ethers.parseEther("10001"));
    });

    it("should receive from wallet and distribute Ether", async function () {
      const recipients = [recipient1.address, recipient2.address];
      const amounts = [ethers.parseEther("1"), ethers.parseEther("1")];

      expect(await ethers.provider.getBalance(recipient1.address)).to.equal(ethers.parseEther("10001"));
      expect(await ethers.provider.getBalance(recipient2.address)).to.equal(ethers.parseEther("10001"));

      await bridgeWrapper.receiveFromWalletAndDistribute(
        ethers.ZeroAddress,
        ethers.parseEther("2"),
        recipients,
        amounts,
        { value: ethers.parseEther("2") }
      );

      expect(await ethers.provider.getBalance(recipient1.address)).to.equal(ethers.parseEther("10002"));
      expect(await ethers.provider.getBalance(recipient2.address)).to.equal(ethers.parseEther("10002"));
    });

    it("should receive from wallet and distribute ERC20 tokens", async function () {
      await erc20Asset.mint(admin.address, ethers.parseEther("200"));
      const recipients = [recipient1.address, recipient2.address];
      const amounts = [ethers.parseEther("100"), ethers.parseEther("100")];

      expect(await erc20Asset.balanceOf(admin.address)).to.equal(ethers.parseEther("200"));
      expect(await erc20Asset.balanceOf(recipient1.address)).to.equal(ethers.parseEther("50"));
      expect(await erc20Asset.balanceOf(recipient2.address)).to.equal(ethers.parseEther("50"));

      await erc20Asset.connect(admin).approve(await bridgeWrapper.getAddress(), ethers.parseEther("200"));

      await bridgeWrapper.connect(admin).receiveFromWalletAndDistribute(
        await erc20Asset.getAddress(),
        ethers.parseEther("200"),
        recipients,
        amounts
      );

      expect(await erc20Asset.balanceOf(admin.address)).to.equal(ethers.parseEther("0"));
      expect(await erc20Asset.balanceOf(recipient1.address)).to.equal(ethers.parseEther("150"));
      expect(await erc20Asset.balanceOf(recipient2.address)).to.equal(ethers.parseEther("150"));
    });

    it("should not receive from wallet with mismatched msg.value and amount", async function () {
      const recipients = [recipient1.address, recipient2.address];
      const amounts = [ethers.parseEther("0.5"), ethers.parseEther("0.5")];

      await expect(
        bridgeWrapper.receiveFromWalletAndDistribute(
          ethers.ZeroAddress,
          ethers.parseEther("1"),
          recipients,
          amounts,
          { value: ethers.parseEther("0.5") }
        )
      ).to.be.revertedWithCustomError(bridgeWrapper, "InvalidDistributionAmount");
    });

    it("should not receive and distribute with mismatched lengths of recipients and amounts", async function () {
      const BridgeReceipt = {
        tokenAddress: await erc20Asset.getAddress(),
        amount: ethers.parseEther("100"),
        from: admin.address,
        to: await bridgeWrapper.getAddress(),
        txHash: ethers.keccak256("0x1337"),
      };

      const encodedBridgeReciept = ethers.keccak256(coder.encode(
        ["string", "address", "address", "uint256", "address", "address", "bytes32", "bytes32"],
        ["transfer", await bridge.getAddress(), BridgeReceipt.tokenAddress, BridgeReceipt.amount, BridgeReceipt.to, BridgeReceipt.from, BridgeReceipt.txHash, await bridge._networkId()]
      ));

      let signature = ethers.Signature.from(await peer.signMessage(ethers.getBytes(encodedBridgeReciept)));

      const BridgeWrapperReceipt = {
        tokenAddress: BridgeReceipt.tokenAddress,
        amount: BridgeReceipt.amount,
        from: BridgeReceipt.from,
        txHash: BridgeReceipt.txHash,
        v: [signature.v],
        r: [signature.r],
        s: [signature.s]
      };

      const encodedData = coder.encode(
        ["tuple(address tokenAddress, uint256 amount, address from, bytes32 txHash, uint8[] v, bytes32[] r, bytes32[] s)"],
        [BridgeWrapperReceipt]
      );

      const recipients = [recipient1.address];
      const amounts = [ethers.parseEther("0.5"), ethers.parseEther("0.5")];

      await expect(
        bridgeWrapper.receiveAndDistribute(encodedData, recipients, amounts)
      ).to.be.revertedWithCustomError(bridgeWrapper, "ArrayLengthMismatch");
    });

    it("should sweep ERC20 tokens", async function () {
      const TokenMock = await ethers.getContractFactory("ERC20MockToken");
      const token = await TokenMock.deploy("SweepToken", "SWPT");
      let bridgeAdress = await bridgeWrapper.getAddress();
      await token.mint(bridgeAdress, ethers.parseEther("200"));
      expect(await token.balanceOf(bridgeAdress)).to.equal(ethers.parseEther("200"));
      await bridgeWrapper.sweep(await token.getAddress(), admin.address);
      expect(await token.balanceOf(admin.address)).to.equal(ethers.parseEther("200"));
      expect(await token.balanceOf(bridgeAdress)).to.equal(ethers.parseEther("0"));
    });

    it("should not sweep to address 0x0", async function () {
      const BridgeReceipt = {
        tokenAddress: ethers.ZeroAddress,
        amount: ethers.parseEther("0.5"),
        from: admin.address,
        to: await bridgeWrapper.getAddress(),
        txHash: ethers.keccak256("0x1339"),
      };

      const encodedBridgeReciept = ethers.keccak256(coder.encode(
        ["string", "address", "address", "uint256", "address", "address", "bytes32", "bytes32"],
        ["transfer", await bridge.getAddress(), BridgeReceipt.tokenAddress, BridgeReceipt.amount, BridgeReceipt.to, BridgeReceipt.from, BridgeReceipt.txHash, await bridge._networkId()]
      ));

      let signature = ethers.Signature.from(await peer.signMessage(ethers.getBytes(encodedBridgeReciept)));

      expect(await bridgeWrapper.getBalance(ethers.ZeroAddress)).to.equal(ethers.parseEther("0"));

      await bridge.receiveByEthereumAssetAddress(BridgeReceipt.tokenAddress, BridgeReceipt.amount, BridgeReceipt.to, BridgeReceipt.from, BridgeReceipt.txHash, [signature.v], [signature.r], [signature.s]);

      expect(await bridgeWrapper.getBalance(ethers.ZeroAddress)).to.equal(ethers.parseEther("0.5"));

      await expect(
        bridgeWrapper.sweep(ethers.ZeroAddress, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(bridgeWrapper, "RecipientZeroAddress");
    });

    it("should not sweep to an invalid address", async function () {
      expect(await bridgeWrapper.getBalance(ethers.ZeroAddress)).to.equal(ethers.parseEther("0.5"));
      await expect(
        bridgeWrapper.sweep(ethers.ZeroAddress, await bridge.getAddress())
      ).to.be.revertedWithCustomError(bridgeWrapper, "SendEtherFailed");
      expect(await bridgeWrapper.getBalance(ethers.ZeroAddress)).to.equal(ethers.parseEther("0.5"));
    });

    it("should sweep ETH", async function () {
      expect(await bridgeWrapper.getBalance(ethers.ZeroAddress)).to.equal(ethers.parseEther("0.5"));
      expect(await ethers.provider.getBalance(user2.address)).to.equal(ethers.parseEther("10000"));
      await bridgeWrapper.sweep(ethers.ZeroAddress, user2.address);
      expect(await ethers.provider.getBalance(user2.address)).to.equal(ethers.parseEther("10000.5"));
      expect(await bridgeWrapper.getBalance(ethers.ZeroAddress)).to.equal(ethers.parseEther("0"));
    });

  });

  describe("Balance and Token Information", function () {

    it("should return ERC20 token balance", async function () {
      const balance = await bridgeWrapper.getBalance(await erc20Asset.getAddress());
      expect(balance).to.equal(0);
    });

    it("should not return balance for non-existent token", async function () {
      await expect(bridgeWrapper.getBalance("0x0000000000000000000000000000000000000001")).to.be.reverted;
    });

    it("should return sidechain token ID", async function () {
      const sidechainTokenId = "0x008bcfd2387d3fc453333557eecb0efe59fcba128769b2feefdd306e98e66440";
      const result = await bridgeWrapper.getSidechainTokenId(await sidechainAsset.getAddress());
      expect(result).to.equal(sidechainTokenId);
    });

    it("should return sidechain token address", async function () {
      const sidechainTokenId = "0x008bcfd2387d3fc453333557eecb0efe59fcba128769b2feefdd306e98e66440";
      const result = await bridgeWrapper.getSidechainTokenAddress(sidechainTokenId);
      expect(result).to.equal(await sidechainAsset.getAddress());
    });
  });

  describe("Fallback Functions", function () {
    it("should revert on direct Ether transfer", async function () {
      await expect(
        owner.sendTransaction({
          to: await bridgeWrapper.getAddress(),
          value: ethers.parseEther("1"),
        })
      ).to.be.revertedWith("Direct Ether transfers are not allowed");
    });

    it("should revert on calling non-existent function", async function () {
      await expect(
        admin.sendTransaction({ to: await bridgeWrapper.getAddress(), data: "0x008bcfd2387d3fc453333557eecb0efe59fcba128769b2feefdd306e98e66440" })
      ).to.be.revertedWith("Fallback function called: function does not exist");
    });
  });

  describe("Edge Case", function () {
    it("should handle high volume distribution", async function () {
      const recipients = [];
      const amounts = [];
      for (let i = 0; i < 1000; i++) {
        recipients.push(ethers.Wallet.createRandom().address);
        amounts.push(ethers.parseEther("0.001"));
      }

      await erc20Asset.connect(recipient1).approve(await bridgeWrapper.getAddress(), ethers.parseEther("1"));

      await expect(
        bridgeWrapper.connect(recipient1).receiveFromWalletAndDistribute(await erc20Asset.getAddress(), ethers.parseEther("1"), recipients, amounts)
      ).not.to.be.reverted;
    });
  });
});