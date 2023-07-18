## CCIP Cross Chain Name Service

> **Note**
>
> _This repository represents an example of using a Chainlink product or service. It is provided to help you understand how to interact with Chainlink’s systems so that you can integrate them into your own. This template is provided "AS IS" without warranties of any kind, has not been audited, and may be missing key checks or error handling to make the usage of the product more clear. Take everything in this repository as an example and not something to be copy pasted into a production ready service._

This project is an educational example of how to create a minimal cross-chain name service using Chainlink CCIP.

## Prerequisites

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Current LTS Node.js version](https://nodejs.org/en/about/releases/)

Verify installation by typing:

```shell
node -v
```

and

```shell
npm -v
```

## Getting Started

1. Clone the repository

```
git clone https://github.com/smartcontractkit/ccip-cross-chain-name-service.git
cd ccip-cross-chain-name-service
```

2. Install packages

```
npm install
```

3. Compile contracts

```
npx hardhat compile
```

## What are we building?

![diagram](./img/ccns.png)

This is a basic architecture diagram, this project can have as many Chainlink CCIP-supported blockchains as possible, it is not limited to three as the diagram may suggest.

There is only one source blockchain on which we can register our `.ccns` handles. It is set by default to `ethereumSepolia` but you can change it by adjusting the `defaultNetwork` property of the `config` object in the `hardhat.config.ts` file:

```ts
const config: HardhatUserConfig = {
  solidity: "0.8.19",
  defaultNetwork: 'ethereumSepolia', // Source Chain
  ...
}
```

There can be as many Chainlink CCIP-supported destination blockchains as possible.

There are two CrossChainNameService smart contracts per blockchain:

1. On the source blockchain, [`CrossChainNameServiceRegister`](./contracts/CrossChainNameServiceRegister.sol) and [`CrossChainNameServiceLookup`](./contracts/CrossChainNameServiceLookup.sol)
2. On each of the destination blockchains, [`CrossChainNameServiceReceiver`](./contracts/CrossChainNameServiceReceiver.sol) and [`CrossChainNameServiceLookup`](./contracts/CrossChainNameServiceLookup.sol)

To register a new `.ccns` handle, you need to call the `register()` function of the [`CrossChainNameServiceRegister`](./contracts/CrossChainNameServiceRegister.sol) smart contract. It will send the CCIP message to all [`CrossChainNameServiceReceiver`](./contracts/CrossChainNameServiceReceiver.sol)s on each destination blockchain.

To resolve any give `.ccns` name, you just need to call a free view `lookup(name)` function of [`CrossChainNameServiceLookup`](./contracts/CrossChainNameServiceLookup.sol) **on any blockchain**. Because it is a cross-chain system, it will be exactly the same on all supported blockchains.

## Usage

There are several Hardhat tasks available for deployment and interaction with this project. But before that, you need to set up some environment variables.

We are going to use the [`@chainlink/env-enc`](https://www.npmjs.com/package/@chainlink/env-enc) package for extra security. It encrypts sensitive data instead of storing them as plain text in the `.env` file, by creating a new, `.env.enc` file. Although it's not recommended to push this file online, if that accidentally happens your secrets will still be encrypted.

1. Set a password for encrypting and decrypting the environment variable file. You can change it later by typing the same command.

```
npx env-enc set-pw
```

2. Now set the following environment variables: `PRIVATE_KEY`, Source Blockchain RPC URL, Destination Blockchain RPC URL. You can see available options in the `.env.example` file:

```
PRIVATE_KEY=""
ETHEREUM_SEPOLIA_RPC_URL=""
OPTIMISM_GOERLI_RPC_URL=""
ARBITRUM_TESTNET_RPC_URL=""
AVALANCHE_FUJI_RPC_URL=""
POLYGON_MUMBAI_RPC_URL=""
```

To set these variables, type the following command and follow the instructions in the terminal:

```
npx env-enc set
```

After you are done, the `.env.enc` file will be automatically generated.

If you want to validate your inputs you can always run the next command:

```shell
npx env-enc view
```

### Deployment

#### Source Chain (Only Once)

As being said, on the source blockchain there are [`CrossChainNameServiceRegister`](./contracts/CrossChainNameServiceRegister.sol) and [`CrossChainNameServiceLookup`](./contracts/CrossChainNameServiceLookup.sol) smart contracts. To deploy them we are going to use the `deploy-source-chain` task.

```shell
npx hardhat deploy-source-chain
--router <SOURCE_CHAIN_ROUTER_ADDRESS> # Optional
```

As being said, the source chain is set up as `defaultNetwork` property of the `config` object in the `hardhat.config.ts` file.

For example, to deploy these two contracts on ethereumSepolia (default source chain), run:

```shell
npx hardhat deploy-source-chain
```

Optionally, if you want to manually provide the CCIP Router.sol smart contract address, use the `--router` flag:

```shell
npx hardhat deploy-source-chain --router <SOURCE_CHAIN_ROUTER_ADDRESS>
```

#### Destination Chain (Each time you want to enable a new blockchain)

As being said, on each destination blockchain there are [`CrossChainNameServiceReceiver`](./contracts/CrossChainNameServiceReceiver.sol) and [`CrossChainNameServiceLookup`](./contracts/CrossChainNameServiceLookup.sol) smart contracts. To deploy them we are going to use two tasks:
`deploy-destination-chain-step1` & `deploy-destination-chain-step2`

To deploy these two smart contracts on the destination blockchain, you need to use the `deploy-destination-chain-step1` task:

```shell
npx hardhat deploy-destination-chain-step1
--router <DESTINATION_CHAIN_ROUTER_ADDRESS> # Optional
--register <SOURCE_CHAIN_CCNS_REGISTER> # Optional
--source-chain-selector <SOURCE_CHAIN_SELECTOR> # Optional
```

For example, if you want to deploy them to Avalanche Fuji testnet, run:

```shell
npx hardhat deploy-destination-chain-step1 --network avalancheFuji
```

To link these two contracts with the CrossChainNameServiceRegister smart contract on the source blockchain, you need to use the `deploy-destination-chain-step2` task:

```shell
npx hardhat deploy-destination-chain-step2
--receiver-network <CCNS_RECEIVER_BLOCKCHAIN>
--register <CCNS_REGISTER_ADDRESS> # Optional
--receiver <CCNS_RECEIVER_ADDRESS> # Optional
--destination-chain-selector <DESTINATION_CHAIN_SELECTOR> # Optional
```

For example, to enable Avalanche Fuji as a new network in the Cross Chain Name Service project, run:

```shell
npx hardhat deploy-destination-chain-step2 --receiver-network avalancheFuji
```

**Each time you want to enable a new blockchain, repeat the previous two steps.**

### Fee Management

For simplicity, this project supports paying for CCIP fees in native coins only.

#### Funding

To fund the CrossChainNameServiceRegister contract, we are going to use the `fund` task:

```shell
npx hardhat fund
--amount <AMOUNT_IN_WEI>
--register <CCNS_REGISTER_ADDRESS> # Optional
```

For example, to fund your CrossChainNameServiceRegister smart contract on Ethereum Sepolia with 0.1 ether (in wei), run:

```shell
npx hardhat fund --amount 100000000000000000
```

#### Checking balance

To check the balance (in wei) of CrossChainNameServiceRegister smart contract, you can use the `get-balance` task:

```shell
npx hardhat get-balance
--register <CCNS_REGISTER_ADDRESS> # Optional
```

For example, to check the balance of CrossChainNameServiceRegister smart contract, run:

```shell
npx hardhat get-balance
```

#### Withdrawing

To withdraw all of the locked funds in the CrossChainNameServiceRegister contract, you can use the `withdraw` task:

```shell
npx hardhat withdraw
--beneficiary <ADDRESS_TO_WITHDRAW_FUNDS_TO>
--register <CCNS_REGISTER_ADDRESS> # Optional
```

For example, to withdraw everything from CrossChainNameServiceRegister, run:

```shell
npx hardhat fund --beneficiary <PUT_YOUR_ADDRESS_HERE>
```

### Interaction

Now comes the fun part, using the project!

#### Register New CCNS Handle

To register a new CCNS handle we are going to use the `ccns-register` task. Keep in mind that provided handle must end with `.ccns``:

```shell
npx hardhat ccns-register
--ccns-name <NAME.CCNS>
--register <CCNS_REGISTER_ADDRESS> # Optional
```

For example, if you want to register the `anon.ccns` handle, run:

```shell
npx hardhat ccns-register --ccns-name anon.ccns
```

The task will output the transaction hash in the terminal. Using it, search for your CCIP message(s) in the [CCIP Explorer](https://ccip.chain.link), one per destination blockchain. Once all of them are finalized, you have successfully registered your new & unique `.ccns` handle.

![ccip-explorer](./img/ccip-explorer.png)

#### Resolve CCNS Handle to the actual wallet address

To check which address is associated with which `.ccns` handle you can use the `ccns-lookup` task or query the [`CrossChainNameServiceLookup`](./contracts/CrossChainNameServiceLookup.sol) smart contract manually on each supported blockchain:

```shell
npx hardhat ccns-lookup
--ccns-name <NAME.CCNS>
--lookup <CCNS_LOOKUP_ADDRESS> # Optional
```

To resolve the `anon.ccns` handle to an actual address on Ethereum Sepolia, run:

```shell
npx hardhat ccns-lookup --ccns-name anon.ccns --network ethereumSepolia
```

To do the same thing on Avalanche Fuji, run:

```shell
npx hardhat ccns-lookup --ccns-name anon.ccns --network avalancheFuji
```

It should log the same address. If it logs the zero address on any of the destination blockchains double-check the CCIP explorer to confirm that the `register` message is being finalized.
