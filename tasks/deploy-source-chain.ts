import { task } from "hardhat/config";
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path';
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { CrossChainNameServiceLookup, CrossChainNameServiceLookup__factory, CrossChainNameServiceRegister, CrossChainNameServiceRegister__factory } from "../typechain-types";
import { __deploymentsPath, getRouterConfig } from "./utils";
import { Spinner } from '../utils/spinner'

task(`deploy-source-chain`, `Sets up the Cross Chain Name Service on the source network by deploying Lookup and Register smart contracts and linking them`)
    .addOptionalParam(`router`, `The address of the Chainlink CCIP Router contract on the source blockchain`)
    .setAction(async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
        if (hre.network.name !== hre.config.defaultNetwork) {
            console.error(`❌ CrossChainNameServiceRegister can be deployed on the source chain only. Source chain - ${hre.config.defaultNetwork}`);
            return 1;
        }

        const spinner: Spinner = new Spinner();
        const [deployer] = await hre.ethers.getSigners();

        console.log(`ℹ️  Attempting to deploy CrossChainNameServiceLookup on the ${hre.network.name} blockchain using ${deployer.address} address`);
        spinner.start();

        const ccnsLookupFactory: CrossChainNameServiceLookup__factory = await hre.ethers.getContractFactory('CrossChainNameServiceLookup');
        const ccnsLookup: CrossChainNameServiceLookup = await ccnsLookupFactory.deploy();
        await ccnsLookup.deployed();

        spinner.stop();
        console.log(`✅ CrossChainNameServiceLookup deployed at address ${ccnsLookup.address} on ${hre.network.name} blockchain`);

        console.log(`ℹ️  Attempting to deploy CrossChainNameServiceRegister on the ${hre.network.name} blockchain using ${deployer.address} address`);
        spinner.start();

        const routerAddress = taskArguments.router ? taskArguments.router : getRouterConfig(hre.network.name).address;

        const ccnsRegisterFactory: CrossChainNameServiceRegister__factory = await hre.ethers.getContractFactory('CrossChainNameServiceRegister');
        const ccnsRegister: CrossChainNameServiceRegister = await ccnsRegisterFactory.deploy(routerAddress, ccnsLookup.address);
        await ccnsRegister.deployed();

        spinner.stop();
        console.log(`✅ CrossChainNameServiceRegister deployed at address ${ccnsRegister.address} on ${hre.network.name} blockchain`);


        const filePath = join(__deploymentsPath, `${hre.network.name}.json`);
        !existsSync(__deploymentsPath) && mkdirSync(__deploymentsPath);

        try {
            const data = {
                "network": hre.network.name,
                "ccnsRegister": ccnsRegister.address,
                "ccnsLookup": ccnsLookup.address
            };

            writeFileSync(filePath, JSON.stringify(data));
        } catch (error) {
            console.log(`ℹ️  Saving the CrossChainNameRegister address to ${filePath} file failed, please save it manually from previous log, you will need it for further tasks`);
            console.error(`Error: ${error}`);
        }


        console.log(`ℹ️  Attempting to call the setCrossChainNameServiceAddress function on the CrossChainNameServiceLookup smart contract`);
        spinner.start();

        const tx = await ccnsLookup.setCrossChainNameServiceAddress(ccnsRegister.address);
        await tx.wait();

        spinner.stop();
        console.log(`✅ CCNS Address set, transaction hash: ${tx.hash}`);

        console.log(`✅ Task deploy-source-chain finished with the execution`);
    })