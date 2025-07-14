// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Script, console2} from "forge-std/Script.sol";
import {Airdrop} from "../src/Airdrop.sol";

contract InputWinnersListWithValidProof is Script {
    // Deployed Airdrop contract address
    address constant AIRDROP_CONTRACT = 0x5c0892AD2BDF1E9F52e5f6173B0Bb5A1df226D41;

    // WTON has 27 decimals
    uint256 constant WTON_DECIMALS = 27;

    function run() external {
        // Load private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Create arrays for 10 participants
        address[] memory users = new address[](10);
        bytes32[] memory snsIds = new bytes32[](10);
        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](10);
        bytes32[] memory proofHashes = new bytes32[](10);
        uint256[] memory amountsGranted = new uint256[](10);
        bool[] memory stakes = new bool[](10);

        stakes[0] = false;
        stakes[1] = false;
        stakes[2] = false;
        stakes[3] = false;
        stakes[4] = false;
        stakes[5] = false;
        stakes[6] = false;
        stakes[7] = false;
        stakes[8] = false;
        stakes[9] = false;

        // Use realistic test addresses
        users[0] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        users[1] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        users[2] = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
        users[3] = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;
        users[4] = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;
        users[5] = 0x976EA74026E726554dB657fA54763abd0C3a0aa9;
        users[6] = 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955;
        users[7] = 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f;
        users[8] = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;
        users[9] = 0xBcd4042DE499D14e55001CcbB24a551F3b954096;

        // Generate SNS IDs
        snsIds[0] = bytes32("@alice_crypto");
        snsIds[1] = bytes32("@bob_defi");
        snsIds[2] = bytes32("@charlie_web3");
        snsIds[3] = bytes32("@david_blockchain");
        snsIds[4] = bytes32("@eve_tokamak");
        snsIds[5] = bytes32("@frank_l2");
        snsIds[6] = bytes32("@grace_eth");
        snsIds[7] = bytes32("@henry_zk");
        snsIds[8] = bytes32("@iris_dao");
        snsIds[9] = bytes32("@jack_validator");

        // Create valid proof structure from test data
        (Airdrop.Proof memory validProof, Airdrop.Preprocessed memory validPreprocessed, uint256[] memory publicInputs)
        = _createValidProof();

        // Assign the same valid proof to all users (in production, each user would have their own proof)
        for (uint256 i = 0; i < 10; i++) {
            proofs[i] = validProof;
            proofHashes[i] = 0x42625bd95f626ea8629a0dcc327fda7d6dbf8218d78a510891d095b266344af3;

            // Grant amounts in WTON (varied amounts)
            if (i < 3) {
                // Top tier: 100 WTON
                amountsGranted[i] = 100 * 10 ** WTON_DECIMALS;
            } else if (i < 7) {
                // Mid tier: 50 WTON
                amountsGranted[i] = 50 * 10 ** WTON_DECIMALS;
            } else {
                // Base tier: 10 WTON
                amountsGranted[i] = 10 * 10 ** WTON_DECIMALS;
            }
        }

        console2.log("========================================");
        console2.log("Adding Winners with Valid ZK Proofs");
        console2.log("========================================");
        console2.log("Contract:", AIRDROP_CONTRACT);
        console2.log("Number of participants:", users.length);
        console2.log("Total WTON to distribute:", _calculateTotalWTON(amountsGranted));
        console2.log("========================================");

        // Start broadcast
        vm.startBroadcast(deployerPrivateKey);

        // Get the Airdrop contract instance
        Airdrop airdrop = Airdrop(AIRDROP_CONTRACT);

        // Call inputWinnerList
        airdrop.inputWinnerList(
            users, snsIds, proofs, validPreprocessed, publicInputs, amountsGranted, proofHashes, stakes
        );

        vm.stopBroadcast();

        console2.log("========================================");
        console2.log("Winners added successfully!");
        console2.log("========================================");

        // Verify the winners were added
        uint256 newCount = airdrop.getEligibleUsersCount();
        console2.log("Total eligible users:", newCount);
    }

    function _createValidProof()
        private
        pure
        returns (Airdrop.Proof memory, Airdrop.Preprocessed memory, uint256[] memory)
    {
        uint128[] memory proof_part1 = new uint128[](38);
        uint256[] memory proof_part2 = new uint256[](42);
        uint128[] memory preprocessedPart1 = new uint128[](4);
        uint256[] memory preprocessedPart2 = new uint256[](4);
        uint256[] memory publicInputs = new uint256[](128);

        preprocessedPart1[0] = 0x0d8838cc826baa7ccd8cfe0692e8a13d;
        preprocessedPart1[1] = 0x103aeb959c53fdd5f13b70a350363881;
        preprocessedPart1[2] = 0x09f0f94fd2dc8976bfeab5da30e1fa04;
        preprocessedPart1[3] = 0x17cb62f5e698fe087b0f334e2fb2439c;

        preprocessedPart2[0] = 0xbbae56c781b300594dac0753e75154a00b83cc4e6849ef3f07bb56610a02c828;
        preprocessedPart2[1] = 0xf3447285889202e7e24cd08a058a758a76ee4c8440131be202ad8bc0cc91ee70;
        preprocessedPart2[2] = 0x76e577ad778dc4476b10709945e71e289be5ca05c412ca04c133c485ae8bc757;
        preprocessedPart2[3] = 0x7ada41cb993109dc7c194693dbcc461f8512755054966319bcbdea3a1da86938;

        // Initialize proof_part1 from test data
        proof_part1[0] = 0x05b4f308ff641adb31b740431cee5d70;
        proof_part1[1] = 0x12ae9a8d3ec9c65c98664e311e634d64;
        proof_part1[2] = 0x08e6d6c1e6691e932692e3942a6cbef7;
        proof_part1[3] = 0x12cdafbf7bf8b80338459969b4c54bcb;
        proof_part1[4] = 0x0c2fe4549b4508fa6db64b438661f36c;
        proof_part1[5] = 0x00ba5ce79b6c3ee1f9323076cd019f51;
        proof_part1[6] = 0x10d2a2a6b5d9b0f74e5ca7207cbb10b2;
        proof_part1[7] = 0x143fc4f52ca987f2e47885310ca5693b;
        proof_part1[8] = 0x0d0d110f829d162dc4e1e76a7544188b;
        proof_part1[9] = 0x01c43cc10d4ec71dd398bcdbbd6f8eb7;
        proof_part1[10] = 0x180d963ee9bd02f3e9367614105c95f3;
        proof_part1[11] = 0x13efcb0e014478ce79000206e8b39ea5;
        proof_part1[12] = 0x0bc733812b8bba788f2f4fff4751f70d;
        proof_part1[13] = 0x0afb2ae78cb743b453868f07e92b466a;
        proof_part1[14] = 0x04897b34fcba759c43efbe8834f279b3;
        proof_part1[15] = 0x0af44a63032292984463891d0c1555ee;
        proof_part1[16] = 0x12e0faf1eaaca9e9e0f5be64eb013c9d;
        proof_part1[17] = 0x151e4f845009fdef5cf50bde3c38d42c;
        proof_part1[18] = 0x07ec505b12d1d7337382721371829fa1;
        proof_part1[19] = 0x167afb06ffb4c89b5e04a598139f20f0;
        proof_part1[20] = 0x09468040e794eaa40c964c3b8f4fa252;
        proof_part1[21] = 0x1395d5b79c0a1e3915974a4899d5b00b;
        proof_part1[22] = 0x07ba876a95322207b596d39ed0490997;
        proof_part1[23] = 0x13adce13779790b3bfbee74b54bfa42b;
        proof_part1[24] = 0x0516cebd5e7b3d9eca97a4959737c8af;
        proof_part1[25] = 0x18d3891d0f746a6e4de8d9f0973c55f3;
        proof_part1[26] = 0x16911127fce9f466f95506edd9eae5ff;
        proof_part1[27] = 0x05438bddfb750e22c41a713494c7c5e9;
        proof_part1[28] = 0x0ac8be4b1cb6a9c8354fcf35e5d7a339;
        proof_part1[29] = 0x16695706d77185cdfdad3d70e8d73e87;
        proof_part1[30] = 0x172dfe9a0767dda975f5fbde45ed1ae0;
        proof_part1[31] = 0x17b91c24ec6ce0e74426041d668c329a;
        proof_part1[32] = 0x0ac8be4b1cb6a9c8354fcf35e5d7a339;
        proof_part1[33] = 0x16695706d77185cdfdad3d70e8d73e87;
        proof_part1[34] = 0x0883ed3c97b3e674ebfc683481742daa;
        proof_part1[35] = 0x0f697de543d92f067e8ff95912513e49;
        proof_part1[36] = 0x097d7a0fe6430f3dfe4e10c2db6ec878;
        proof_part1[37] = 0x104de32201c5ba649cc17df4cf759a1f;

        // Initialize proof_part2 from test data
        proof_part2[0] = 0x12f31df6476c99289584549ae13292a824df5e10f546a9659d08479cf55b3bb2;
        proof_part2[1] = 0xd28e43565c5c0a0b6d625a4572e02fbb6de2b255911ebe90f551a43a48c52ec0;
        proof_part2[2] = 0x185457d5b78e0dd03fb83b4af872c2f9800e0d4d3bbb1e36ca85a9d8ce763e55;
        proof_part2[3] = 0x559b5cc09730db68b632e905b9ff96bbaffedfdf89e91dadbd7b49dbe2d89960;
        proof_part2[4] = 0xb0f667aff5ec036e5324a9e11b04f1390d31e422fb358943b6e9834ceafc2d45;
        proof_part2[5] = 0x5831b2fcca492d422c2c5b78cfd02bbb55bd9ef574d764400661c44345712a95;
        proof_part2[6] = 0xea67be102035f7f79a8e8ebd8cffb3ce8dd14458c20a93e1a99e31e6756f33ee;
        proof_part2[7] = 0x430617634aa53978ade5412f3ebdb29a91d21a1ddb39eab112df55ef2d2740e4;
        proof_part2[8] = 0x9a3aa207f182acea8ec2ab6fdbe9a293e2996e1770815135af9dc7dcab829cd5;
        proof_part2[9] = 0xe54e2e3f05333664792be98ebfe73b8b224acc83074196478593e852ceb2cbef;
        proof_part2[10] = 0x2a2f967e8490650c5dd5893db46c1f61a6bf38ead27c0065c44077656ac88e8d;
        proof_part2[11] = 0x3a25dec62a83cf44cb5356420caf0dcbc4d94b9a0025349a2680b67582d4ceef;
        proof_part2[12] = 0xec308bd22c38acd83cb466e91c0a977b03bc7ab87b5655e1a844c97fa1ad8bed;
        proof_part2[13] = 0xfddfd77793b5af2206625e7dbd3840d179aae985bf5673d02484a0685b803930;
        proof_part2[14] = 0x04acda4fdb36bb30b7aea7540d1fd469fdcb01b32b2ba74de53870a6fbd93dad;
        proof_part2[15] = 0x9e2b3794cd4fe439fe02788fac15f5d5de8a38a35431df4d17b817bd091ffdb1;
        proof_part2[16] = 0x38848585c4de95f0ccd6c77cbcb630593e9bf245e78d126978b1229e771580a4;
        proof_part2[17] = 0x8691e07a7670c43a463111b013e9050325b870219c35603d55bc09e800c0da61;
        proof_part2[18] = 0x99377148bd378731f820de792040dc114dbac2a120de8e26820cb39c24f2d255;
        proof_part2[19] = 0xffef9a993e7c0e2e1991d0722671e8c1544d336bbcaff45e94d80a2fd4a68a2b;
        proof_part2[20] = 0xca315029695dcddb58ec2ffab2e8931a9f0cdfe16456a5ddaa820f129566b3c2;
        proof_part2[21] = 0x6a5d94033876ebad48b9d9f3af72e0b39eac4d020bd642e21571e9eb88d918e9;
        proof_part2[22] = 0x31a915839974262e523f24f696dd93c7928481d3765e8f70454d3fe7ea9cc04d;
        proof_part2[23] = 0x88b8b73587f6030d3a536801b4376a684b428f0cf2c9a10b74b874e342bd9a33;
        proof_part2[24] = 0xa6237eb1a20b4a5602933a791965281782f0311ba6c490b6f3909ca35bfd0528;
        proof_part2[25] = 0xe6e0afccccf07f40dc377094e188610dd3fda0bc42131d84c3512ef14a7df6a4;
        proof_part2[26] = 0x953ba795920785f216d6016142f26c42c17ce081c0637c35b13f8896345f422d;
        proof_part2[27] = 0x6290c529a10345bc54f7ac860765dc9a6b1fbaf282e6e58ead695c718b484ecd;
        proof_part2[28] = 0x091e748f260d20003c2a1a29d6f58cfb8f28c065bbeee13a4a51d71e91922d17;
        proof_part2[29] = 0x92069bad6f6cf9ce5c4623a2799e610dbee116e00ca9247881d67ccd5b808bc7;
        proof_part2[30] = 0x36a63f824b54a0f7379d756244f27bbb31cefb4600be600034454e3d93f194a8;
        proof_part2[31] = 0xd53a583d68a44600fa4150e55c74c5def7a96ccc4ea89602f25942eb479e1d0e;
        proof_part2[32] = 0x091e748f260d20003c2a1a29d6f58cfb8f28c065bbeee13a4a51d71e91922d17;
        proof_part2[33] = 0x92069bad6f6cf9ce5c4623a2799e610dbee116e00ca9247881d67ccd5b808bc7;
        proof_part2[34] = 0xda9079a92f7bfe749313cd11fd1faf480cbd6829a27de4e182a9c699a459af59;
        proof_part2[35] = 0x9c500eac60a728c7e61f88269a1ed9317e763608e3917f78a9697bda457c9955;
        proof_part2[36] = 0x4d66b638321b58bbfdf6b0a17a44a9d9cda67b1a74eea5d0846a99769f18bb17;
        proof_part2[37] = 0x4109049c345548f5d1c05fc481a4594d4764dc966bb22dd42a45cc10cd38a7e2;

        // Evaluations
        proof_part2[38] = 0x556e7206f0462de3787e80eba2a7ea0eaced54f3bc4386e7f442a2227caafb5e;
        proof_part2[39] = 0x52b690b1abedd5d98d6dc1da501896a0d24d16b4ac50b2b91705c9eacbf4ac0b;
        proof_part2[40] = 0x416c2033250efefa6a38b627ba05c7ba67e800b681f9783a079f27c15f2aac32;
        proof_part2[41] = 0x130694604026116d02cbb135233c3219dce6a8527f02960cb4217dc0b8b17d17;

        // Initialize public inputs (first 72 elements shown, rest are zeros)
        publicInputs[0] = 0x00000000000000000000000000000000392a2d1a05288b172f205541a56fc20d;
        publicInputs[1] = 0x00000000000000000000000000000000000000000000000000000000c2c30e79;
        publicInputs[4] = 0x00000000000000000000000000000000392a2d1a05288b172f205541a56fc20d;
        publicInputs[5] = 0x00000000000000000000000000000000000000000000000000000000c2c30e79;
        publicInputs[8] = 0x00000000000000000000000000000000d4ad12e56e54018313761487d2d1fee9;
        publicInputs[9] = 0x000000000000000000000000000000000000000000000000000000000ce8f6c9;
        publicInputs[12] = 0x00000000000000000000000000000000d4ad12e56e54018313761487d2d1fee9;
        publicInputs[13] = 0x000000000000000000000000000000000000000000000000000000000ce8f6c9;
        publicInputs[64] = 0x0000000000000000000000000000000020af07748adbb0932a59cfb9ad012354;
        publicInputs[65] = 0x00000000000000000000000000000000f903343320db59a6e85d0dbb1bc7d722;
        publicInputs[66] = 0x0000000000000000000000000000000020af07748adbb0932a59cfb9ad012354;
        publicInputs[67] = 0x00000000000000000000000000000000f903343320db59a6e85d0dbb1bc7d722;
        publicInputs[68] = 0x000000000000000000000000000000001f924fe321c5cf7ad7a47b57891fbcb0;
        publicInputs[69] = 0x0000000000000000000000000000000081f4f96b68c216b824fb32a8c09bd5a8;
        publicInputs[70] = 0x000000000000000000000000000000001f924fe321c5cf7ad7a47b57891fbcb0;
        publicInputs[71] = 0x0000000000000000000000000000000081f4f96b68c216b824fb32a8c09bd5a8;

        return (
            Airdrop.Proof({proof_part1: proof_part1, proof_part2: proof_part2}),
            Airdrop.Preprocessed({preprocessedPart1: preprocessedPart1, preprocessedPart2: preprocessedPart2}),
            publicInputs
        );
    }

    function _calculateTotalWTON(uint256[] memory amounts) private pure returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        return total / 10 ** WTON_DECIMALS;
    }
}
