// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";

import {ICrossChainNameServiceLookup} from "./ICrossChainNameServiceLookup.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
contract CrossChainNameServiceReceiver is CCIPReceiver {
    IRouterClient public immutable i_router;
    ICrossChainNameServiceLookup public immutable i_lookup;
    uint64 public immutable i_sourceChainSelector;

    error InvalidSourceChain(uint64 chainSelector);

    modifier onlyFromSourceChain(uint64 chainSelector) {
        if (chainSelector != i_sourceChainSelector)
            revert InvalidSourceChain(chainSelector);
        _;
    }

    constructor(
        address router,
        address lookup,
        uint64 sourceChainSelector
    ) CCIPReceiver(router) {
        i_router = IRouterClient(router);
        i_lookup = ICrossChainNameServiceLookup(lookup);
        i_sourceChainSelector = sourceChainSelector;
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override onlyFromSourceChain(message.sourceChainSelector) {
        (string memory _name, address _address) = abi.decode(
            message.data,
            (string, address)
        );

        i_lookup.register(_name, _address);
    }
}
