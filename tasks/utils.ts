import { readFileSync } from 'fs'
import { join } from 'path';

const ethereumSepolia = {
    address: "0xd0daae2231e9cb96b94c8512223533293c3693bf",
    chainSelector: "16015286601757825753",
    feeTokens: ['0x779877A7B0D9E8603169DdbD7836e478b4624789']
};

const optimismGoerli = {
    address: "0xeb52e9ae4a9fb37172978642d4c141ef53876f26",
    chainSelector: "2664363617261496610",
    feeTokens: ['0xdc2CC710e42857672E7907CF474a69B63B93089f']
};

const avalancheFuji = {
    address: "0x554472a2720e5e7d5d3c817529aba05eed5f82d8",
    chainSelector: "14767482510784806043",
    feeTokens: ['0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846']
};

const arbitrumTestnet = {
    address: "0x88e492127709447a5abefdab8788a15b4567589e",
    chainSelector: "6101244977088475029",
    feeTokens: ['0xd14838A68E8AFBAdE5efb411d5871ea0011AFd28']
};

const polygonMumbai = {
    address: "0x70499c328e1e2a3c41108bd3730f6670a44595d1",
    chainSelector: "12532609583862916517",
    feeTokens: ['0x326C977E6efc84E512bB9C30f76E30c160eD06FB']
};


export const __deploymentsPath = './deployments';


export const getRouterConfig = (network: string) => {
    switch (network) {
        case "ethereumSepolia":
            return ethereumSepolia;
        case "optimismGoerli":
            return optimismGoerli;
        case "arbitrumTestnet":
            return arbitrumTestnet;
        case "avalancheFuji":
            return avalancheFuji;
        case "polygonMumbai":
            return polygonMumbai;
        default:
            throw new Error("Unknown network: " + network);
    }
};


export const getDeploymentInfo = (network: string) => {
    try {
        const networkDeploymentInfo = JSON.parse(readFileSync(join(__deploymentsPath, `${network}.json`), `utf-8`));
        return networkDeploymentInfo;
    } catch (e) {
        console.error(e);
    }
}
