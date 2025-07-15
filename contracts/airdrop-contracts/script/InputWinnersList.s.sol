// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script, console2} from "forge-std/Script.sol";
import {Airdrop} from "../src/Airdrop.sol";

contract InputWinnersListWithValidProof is Script {
    // Deployed Airdrop contract address
    address constant AIRDROP_CONTRACT = 0x5c0892AD2BDF1E9F52e5f6173B0Bb5A1df226D41;

    // WTON has 27 decimals
    uint256 constant WTON_DECIMALS = 27;

    struct ParticipantData {
        address user;
        bytes32 snsId;
        uint256 amountGranted;
        bool stake;
        bytes32 proofHash;
        Airdrop.Proof proof;
        Airdrop.Preprocessed preprocessed;
        uint256[] publicInputsArray;
    }

    function run() external {
        // Load private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Array of JSON file paths for each participant
        string[] memory participantFiles = new string[](10);
        participantFiles[0] = "inputs/user1.json";
        participantFiles[1] = "inputs/user2.json";
        participantFiles[2] = "inputs/user3.json";
        participantFiles[3] = "inputs/user4.json";
        participantFiles[4] = "inputs/user5.json";
        participantFiles[5] = "inputs/user6.json";
        participantFiles[6] = "inputs/user7.json";
        participantFiles[7] = "inputs/user8.json";
        participantFiles[8] = "inputs/user9.json";
        participantFiles[9] = "inputs/user10.json";

        // Load all participants data
        ParticipantData[] memory participants = new ParticipantData[](participantFiles.length);
        for (uint256 i = 0; i < participantFiles.length; i++) {
            participants[i] = loadParticipantFromJson(participantFiles[i]);
        }

        // Prepare arrays for contract call
        address[] memory users = new address[](participants.length);
        bytes32[] memory snsIds = new bytes32[](participants.length);
        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](participants.length);
        Airdrop.Preprocessed[] memory preprocessedArray = new Airdrop.Preprocessed[](participants.length);
        Airdrop.PublicInputs[] memory publicInputs = new Airdrop.PublicInputs[](participants.length);
        bytes32[] memory proofHashes = new bytes32[](participants.length);
        uint256[] memory amountsGranted = new uint256[](participants.length);
        bool[] memory stakes = new bool[](participants.length);

        // Fill arrays from participant data
        for (uint256 i = 0; i < participants.length; i++) {
            users[i] = participants[i].user;
            snsIds[i] = participants[i].snsId;
            proofs[i] = participants[i].proof;
            preprocessedArray[i] = participants[i].preprocessed;
            publicInputs[i] = Airdrop.PublicInputs({publicInputs: participants[i].publicInputsArray});
            proofHashes[i] = participants[i].proofHash;
            amountsGranted[i] = participants[i].amountGranted;
            stakes[i] = participants[i].stake;
        }

        console2.log("========================================");
        console2.log("Adding Winners with Valid ZK Proofs");
        console2.log("========================================");
        console2.log("Contract:", AIRDROP_CONTRACT);
        console2.log("Number of participants:", users.length);
        console2.log("Total WTON to distribute:", _calculateTotalWTON(amountsGranted));
        console2.log("========================================");

        // Log participant details
        for (uint256 i = 0; i < users.length; i++) {
            console2.log("Participant", i + 1, ":");
            console2.log("  Address:", users[i]);
            console2.log("  Amount:", amountsGranted[i] / 10 ** WTON_DECIMALS, "WTON");
            console2.log("  Stake:", stakes[i]);
        }

        // Start broadcast
        vm.startBroadcast(deployerPrivateKey);

        // Get the Airdrop contract instance
        Airdrop airdrop = Airdrop(AIRDROP_CONTRACT);

        // Call inputWinnerList
        airdrop.inputWinnerList(
            users, snsIds, proofs, preprocessedArray, publicInputs, amountsGranted, proofHashes, stakes
        );

        vm.stopBroadcast();

        console2.log("========================================");
        console2.log("Winners added successfully!");
        console2.log("========================================");

        // Verify the winners were added
        uint256 newCount = airdrop.getEligibleUsersCount();
        console2.log("Total eligible users:", newCount);
    }

    function loadParticipantFromJson(string memory filename) 
        private 
        view 
        returns (ParticipantData memory) 
    {
        // Read the JSON file
        string memory root = vm.projectRoot();
        string memory path = string.concat(root, "/", filename);
        string memory json = vm.readFile(path);
        
        ParticipantData memory data;
        
        // Parse user address (assuming single user in array)
        data.user = vm.parseJsonAddress(json, ".user[0]");
        
        // Parse SNS ID
        data.snsId = vm.parseJsonBytes32(json, ".snsId[0]");
        
        // Parse amount granted
        data.amountGranted = vm.parseJsonUint(json, ".amountGranted[0]");
        
        // Parse stake boolean
        string memory stakeStr = vm.parseJsonString(json, ".stake[0]");
        data.stake = keccak256(bytes(stakeStr)) == keccak256(bytes("true"));
        
        // Parse proof hash
        data.proofHash = vm.parseJsonBytes32(json, ".proofHash[0]");
        
        // Parse proof entries
        uint128[] memory proof_part1 = new uint128[](38);
        for (uint256 i = 0; i < 38; i++) {
            string memory key = string.concat(".proof_entries_part1[", vm.toString(i), "]");
            proof_part1[i] = uint128(vm.parseJsonUint(json, key));
        }
        
        uint256[] memory proof_part2 = new uint256[](42);
        for (uint256 i = 0; i < 42; i++) {
            string memory key = string.concat(".proof_entries_part2[", vm.toString(i), "]");
            proof_part2[i] = vm.parseJsonUint(json, key);
        }
        
        data.proof = Airdrop.Proof({
            proof_part1: proof_part1,
            proof_part2: proof_part2
        });
        
        // Parse preprocessed entries
        uint128[] memory preprocessedPart1 = new uint128[](4);
        for (uint256 i = 0; i < 4; i++) {
            string memory key = string.concat(".preprocess_entries_part1[", vm.toString(i), "]");
            preprocessedPart1[i] = uint128(vm.parseJsonUint(json, key));
        }
        
        uint256[] memory preprocessedPart2 = new uint256[](4);
        for (uint256 i = 0; i < 4; i++) {
            string memory key = string.concat(".preprocess_entries_part2[", vm.toString(i), "]");
            preprocessedPart2[i] = vm.parseJsonUint(json, key);
        }
        
        data.preprocessed = Airdrop.Preprocessed({
            preprocessedPart1: preprocessedPart1,
            preprocessedPart2: preprocessedPart2
        });
        
        // Parse public inputs array (128 elements)
        data.publicInputsArray = new uint256[](128);
        for (uint256 i = 0; i < 128; i++) {
            string memory key = string.concat(".public_inputs[", vm.toString(i), "]");
            data.publicInputsArray[i] = vm.parseJsonUint(json, key);
        }
        
        return data;
    }

    function _calculateTotalWTON(uint256[] memory amounts) private pure returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        return total / 10 ** WTON_DECIMALS;
    }
}