import { task } from 'hardhat/config';

task("deployWrapper", "Deploys bridge wrapper contract")
  .addParam("bridge", "The bridge's address")
  .addParam("admin", "The initial admin's address")
  .setAction(async (taskArgs, hre) => {
    const wrapperFactory = await hre.ethers.getContractFactory("BridgeWrapper");
    const wrapper = await wrapperFactory.deploy(taskArgs.bridge, taskArgs.admin);
    await wrapper.waitForDeployment();
    const wrapperAddress = await wrapper.getAddress();
    console.log("Wrapper was deployed to: ", wrapperAddress);
    await hre.run("verify:verify", {
        address: wrapperAddress,
        constructorArguments: [
            taskArgs.bridge,
            taskArgs.admin
        ],
    });
  });