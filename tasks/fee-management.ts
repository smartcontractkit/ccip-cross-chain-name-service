import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { Spinner } from "../utils/spinner";
import { getDeploymentInfo } from "./utils";
import { CrossChainNameServiceRegister, CrossChainNameServiceRegister__factory } from "../typechain-types";


task(`fund`, `Transfers the provided amount to the CrossChainNameServiceRegister smart contracts for paying CCIP fees`)
    .addParam(`amount`, `Amount in wei`)
    .addOptionalParam(`register`, `CrossChainNameServiceRegister smart contract address`)
    .setAction(async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
        const { register, amount } = taskArguments;

        if (hre.network.name !== hre.config.defaultNetwork) {
            console.error(`❌ This action must be done on the source chain. Source chain - ${hre.config.defaultNetwork}`);
            return 1;
        }

        const [signer] = await hre.ethers.getSigners();
        const spinner: Spinner = new Spinner();

        const ccnsRegisterAddress = register ? register : getDeploymentInfo(hre.config.defaultNetwork).ccnsRegister;

        console.log(`ℹ️  Attempting to send ${amount} wei to CrossChainNameServiceRegister smart contract (${ccnsRegisterAddress}) on the ${hre.network.name} blockchain`);
        spinner.start();

        const tx = await signer.sendTransaction({ to: ccnsRegisterAddress, value: amount });
        await tx.wait();

        spinner.stop();
        console.log(`✅ Transaction hash: ${tx.hash}`);

        console.log(`✅ Task fund finished with the execution`);
    })


task(`get-balance`, `Gets balance of CrossChainNameServiceRegister smart contracts in wei`)
    .addOptionalParam(`register`, `CrossChainNameServiceRegister smart contract address`)
    .setAction(async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
        const { register } = taskArguments;

        if (hre.network.name !== hre.config.defaultNetwork) {
            console.error(`❌ This action must be done on the source chain. Source chain - ${hre.config.defaultNetwork}`);
            return 1;
        }

        const ccnsRegisterAddress = register ? register : getDeploymentInfo(hre.config.defaultNetwork).ccnsRegister;

        if (!ccnsRegisterAddress) {
            console.error(`❌ CrossChainNameServiceRegister address is undefined. Try to provide the address of a CrossChainNameServiceRegister smart contract via --register flag.`);
            return 1;
        }

        const balance = await hre.ethers.provider.getBalance(ccnsRegisterAddress);

        console.log(`ℹ️  CrossChainNameServiceRegister balance (in wei): ${balance}`);
    })


task(`withdraw`, `Withdraws all coins from the CrossChainNameServiceRegister smart contracts`)
    .addParam(`beneficiary`, `The address to withdraw to`)
    .addOptionalParam(`register`, `CrossChainNameServiceRegister smart contract address`)
    .setAction(async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
        const { beneficiary, register } = taskArguments;

        if (hre.network.name !== hre.config.defaultNetwork) {
            console.error(`❌ This action must be done on the source chain. Source chain - ${hre.config.defaultNetwork}`);
            return 1;
        }

        const ccnsRegisterAddress = register ? register : getDeploymentInfo(hre.config.defaultNetwork).ccnsRegister;

        if (!ccnsRegisterAddress) {
            console.error(`❌ CrossChainNameServiceRegister address is undefined. Try to provide the address of a CrossChainNameServiceRegister smart contract via --register flag.`);
            return 1;
        }

        const [owner] = await hre.ethers.getSigners();

        const ccnsRegister: CrossChainNameServiceRegister = CrossChainNameServiceRegister__factory.connect(ccnsRegisterAddress, owner);

        const spinner: Spinner = new Spinner();

        console.log(`ℹ️  Attempting to call the withdraw function on the CrossChainNameServiceRegister smart contract on the ${hre.network.name} blockchain`);
        spinner.start();

        const tx = await ccnsRegister.withdraw(beneficiary)
        await tx.wait();

        spinner.stop();
        console.log(`✅ Transaction hash: ${tx.hash}`);

        console.log(`✅ Task withdraw finished with the execution`);
    })