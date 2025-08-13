// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script, console2} from "forge-std/Script.sol";
import {Airdrop} from "../src/Airdrop.sol";

contract InputWinnersList is Script {
    // Deployed Airdrop contract address
    address constant AIRDROP_CONTRACT = 0x4443f15b38382d97522bcE191709f2359f19A4D6;

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
        participantFiles[0] = "script/inputs/user1.json";
        participantFiles[1] = "script/inputs/user2.json";
        participantFiles[2] = "script/inputs/user3.json";
        participantFiles[3] = "script/inputs/user4.json";
        participantFiles[4] = "script/inputs/user5.json";
        participantFiles[5] = "script/inputs/user6.json";
        participantFiles[6] = "script/inputs/user7.json";
        participantFiles[7] = "script/inputs/user8.json";
        participantFiles[8] = "script/inputs/user9.json";
        participantFiles[9] = "script/inputs/user10.json";

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
        
        // Parse SNS ID - try as bytes32 first, if fails, parse as string and convert
        try vm.parseJsonBytes32(json, ".snsId[0]") returns (bytes32 snsIdBytes) {
            data.snsId = snsIdBytes;
        } catch {
            // If parsing as bytes32 fails, parse as string and convert
            string memory snsIdStr = vm.parseJsonString(json, ".snsId[0]");
            data.snsId = stringToBytes32(snsIdStr);
        }
        
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
        for (uint256 i = 0; i < 127; i++) {
            string memory key = string.concat(".public_inputs[", vm.toString(i), "]");
            data.publicInputsArray[i] = vm.parseJsonUint(json, key);
        }
        
        return data;
    }

    function stringToBytes32(string memory source) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    function _calculateTotalWTON(uint256[] memory amounts) private pure returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        return total / 10 ** WTON_DECIMALS;
    }
}