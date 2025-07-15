// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script, console2} from "forge-std/Script.sol";
import {Airdrop} from "../src/Airdrop.sol";

contract DeployAirdrop is Script {
    function run() external returns (Airdrop) {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address wton = vm.envAddress("WTON_TOKEN_SEPOLIA");
        address verifier = vm.envAddress("VERIFIER_CONTRACT_SEPOLIA");
        address depositManagerProxy = vm.envAddress("DEPOSIT_MANAGER_PROXY_ADDRESS_SEPOLIA");
        address layer2 = vm.envAddress("LAYER2_ADDRESS_SEPOLIA");

        // Validate addresses
        require(wton != address(0), "WTON token address not set");
        require(verifier != address(0), "Verifier contract address not set");

        console2.log("Deploying Airdrop contract to Sepolia...");

        vm.startBroadcast(deployerPrivateKey);

        Airdrop airdrop = new Airdrop(wton, verifier, depositManagerProxy, layer2);

        vm.stopBroadcast();

        console2.log("Airdrop contract deployed at:", address(airdrop));
        console2.log("Owner:", airdrop.owner());

        return airdrop;
    }
}
