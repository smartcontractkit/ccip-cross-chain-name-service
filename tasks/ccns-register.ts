import { task } from "hardhat/config";
import { join } from 'path';
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { CrossChainNameServiceRegister, CrossChainNameServiceRegister__factory } from "../typechain-types";
import { __deploymentsPath, getDeploymentInfo } from "./utils";
import { Spinner } from '../utils/spinner'

task(`ccns-register`, `Register new .ccns name`)
    .addParam(`ccnsName`, `CCNS Name you want to register, it must ends with .ccns`)
    .addOptionalParam(`register`, `CrossChainNameServiceRegister smart contract address`)
    .setAction(async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
        if (hre.network.name !== hre.config.defaultNetwork) {
            console.error(`❌ Registering a new .ccns name must be done on the source chain. Source chain - ${hre.config.defaultNetwork}`);
            return 1;
        }

        if (!taskArguments.ccnsName.endsWith(`.ccns`)) {
            console.error(`❌ Name must ends with .ccns`)
            return 1;
        }

        const ccnsRegisterAddress = taskArguments.register ? taskArguments.register : getDeploymentInfo(hre.config.defaultNetwork).ccnsRegister;

        if (!ccnsRegisterAddress) {
            console.error(`❌ CrossChainNameServiceRegister address is undefined. Did you run the "npx hardhat deploy-source-chain" command? Was the "${join(__deploymentsPath, `${hre.config.defaultNetwork}.json`)}" file generated? Try to provide the address of a CrossChainNameServiceRegister smart contract via --register flag.`);
            return 1;
        }

        const [signer] = await hre.ethers.getSigners();

        const ccnsRegister: CrossChainNameServiceRegister = CrossChainNameServiceRegister__factory.connect(ccnsRegisterAddress, signer);

        const spinner: Spinner = new Spinner();

        console.log(`ℹ️  Attempting to call the register function on the CrossChainNameServiceRegister smart contract with the name ${taskArguments.ccnsName} on the ${hre.network.name} blockchain`);
        spinner.start();

        const tx = await ccnsRegister.register(taskArguments.ccnsName);
        await tx.wait();

        spinner.stop();
        console.log(`✅ Transaction hash: ${tx.hash}`);

        console.log(`✅ Task ccns-register finished with the execution`);
    })