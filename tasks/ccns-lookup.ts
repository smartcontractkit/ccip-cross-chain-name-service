import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { CrossChainNameServiceLookup, CrossChainNameServiceLookup__factory } from "../typechain-types";
import { __deploymentsPath, getDeploymentInfo } from "./utils";


task(`ccns-lookup`, `Register new .ccns name`)
    .addParam(`ccnsName`, `CCNS Name you want to register, it must ends with .ccns`)
    .addOptionalParam(`lookup`, `CrossChainNameServiceLookup smart contract address`)
    .setAction(async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {

        const ccnsLookupAddress = taskArguments.lookup ? taskArguments.lookup : getDeploymentInfo(hre.network.name).ccnsLookup;

        if (!ccnsLookupAddress) {
            console.error(`❌ CrossChainNameServiceLookup address is undefined. Try to provide the address of a CrossChainNameServiceLookup smart contract via --lookup flag.`);
            return 1;
        }

        const ccnsLookup: CrossChainNameServiceLookup = CrossChainNameServiceLookup__factory.connect(ccnsLookupAddress, hre.ethers.provider);

        const address = await ccnsLookup.lookup(taskArguments.ccnsName);

        console.log(`ℹ️  ${taskArguments.ccnsName} resolved with ${address}`);
    })