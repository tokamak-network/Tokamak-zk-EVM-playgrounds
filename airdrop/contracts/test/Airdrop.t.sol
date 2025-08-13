// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "forge-std/Test.sol";
import {Airdrop} from "../src/Airdrop.sol";
import {Verifier} from "../src/Verifier.sol";
import {IVerifier} from "../src/interface/IVerifier.sol";
import {IDepositManager} from "../src/interface/IDepositManager.sol";
import {DepositManagerMock} from "./mock/DepositManagerMock.sol";
import "@openzeppelin/token/ERC20/ERC20.sol";

// Mock ERC20 token for testing
contract MockWTON is ERC20 {
    constructor() ERC20("Wrapped TON", "WTON") {
        _mint(msg.sender, 1000000 * 10 ** 27);
    }
}

contract AirdropTest is Test {
    Airdrop public airdrop;
    MockWTON public wton;
    Verifier public verifier;
    MockVerifier public mockVerifier;
    DepositManagerMock public depositManager;

    address public owner = address(this);
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);
    address public layer2 = address(0x4);

    bytes32 public aliceSnsId = keccak256("alice123");
    bytes32 public bobSnsId = keccak256("bob456");
    bytes32 public charlieSnsId = keccak256("charlie789");

    bytes32 public dummyProofHash = keccak256("proofHash");

    uint128[] public serializedProofPart1;
    uint256[] public serializedProofPart2;
    uint128[] public wrongSerializedProofPart1;
    uint128[] public preprocessedPart1;
    uint256[] public preprocessedPart2;
    uint256[] public validPublicInputs;
    uint256 public smax;

    Airdrop.PublicInputs ValidPublicInputs;
    Airdrop.Proof validProof;
    Airdrop.Proof wrongProof;
    Airdrop.Preprocessed validPreprocessed;

    event UserRewarded(address indexed user, bytes32 snsId, bytes32 proofHash, uint256 amount);
    event WrongProofProvided(address indexed user, bytes32 snsId, bytes32 proofHash, uint256 amount);
    event VerifierUpdated(address indexed newVerifier);
    event WinnerListUpdated(uint256 numberOfWinners);
    event BatchRewardCompleted(uint256 successfulRewards, uint256 totalRewardAmount);

    function setUp() public {
        // Deploy mock contracts
        wton = new MockWTON();
        verifier = new Verifier();
        mockVerifier = new MockVerifier();
        depositManager = new DepositManagerMock(address(wton));

        // Deploy airdrop contract
        airdrop = new Airdrop(address(wton), address(verifier), address(depositManager), layer2);

        _initializeValidProofData();
        _initializeWrongProofData();

        // Setup valid proof
        validProof = Airdrop.Proof({proof_part1: serializedProofPart1, proof_part2: serializedProofPart2});
        wrongProof = Airdrop.Proof({proof_part1: wrongSerializedProofPart1, proof_part2: serializedProofPart2});
        ValidPublicInputs = Airdrop.PublicInputs({publicInputs: validPublicInputs});

        validPreprocessed =
            Airdrop.Preprocessed({preprocessedPart1: preprocessedPart1, preprocessedPart2: preprocessedPart2});

        // Fund airdrop contract
        wton.transfer(address(airdrop), 5000 * 10 ** 27);
    }

    // Test deployment
    function testDeployment() public view {
        assertEq(address(airdrop.wton()), address(wton));
        assertEq(address(airdrop.verifier()), address(verifier));
        assertEq(address(airdrop.depositManagerProxy()), address(depositManager));
        assertEq(airdrop.owner(), owner);
        assertFalse(airdrop.airdropCompleted());
    }

    function testDeploymentWithZeroAddresses() public {
        // Test with zero token address
        vm.expectRevert("Invalid token address");
        new Airdrop(address(0), address(verifier), address(depositManager), layer2);

        // Test with zero verifier address
        vm.expectRevert("Invalid proof verifier address");
        new Airdrop(address(wton), address(0), address(depositManager), layer2);
    }

    // Test inputWinnerList
    function testInputWinnerList() public {
        address[] memory users = new address[](2);
        users[0] = alice;
        users[1] = bob;

        bytes32[] memory snsIds = new bytes32[](2);
        snsIds[0] = aliceSnsId;
        snsIds[1] = bobSnsId;

        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](2);
        proofs[0] = validProof;
        proofs[1] = validProof;

        Airdrop.Preprocessed[] memory preprocess = new Airdrop.Preprocessed[](2);
        preprocess[0] = validPreprocessed;
        preprocess[1] = validPreprocessed;

        Airdrop.PublicInputs[] memory publicInputs = new Airdrop.PublicInputs[](2);
        publicInputs[0] = ValidPublicInputs;
        publicInputs[1] = ValidPublicInputs;

        bytes32[] memory proofHashes = new bytes32[](2);
        proofHashes[0] = dummyProofHash;
        proofHashes[1] = dummyProofHash;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100 * 10 ** 27;
        amounts[1] = 100 * 10 ** 27;

        bool[] memory stakes = new bool[](2);
        stakes[0] = true;
        stakes[1] = false;

        vm.expectEmit(true, true, true, true);
        emit WinnerListUpdated(2);

        airdrop.inputWinnerList(users, snsIds, proofs, preprocess, publicInputs, amounts, proofHashes, stakes);

        // Verify data
        (bytes32 snsId,, uint256 amountGranted, bool isValidProof, bool hasBeenRewarded, bool stake) =
            airdrop.eligibleUser(alice);
        assertEq(snsId, aliceSnsId);
        assertFalse(hasBeenRewarded);
        assertTrue(isValidProof);
        assertTrue(stake);
        assertEq(amountGranted, 100 * 10 ** 27);

        assertEq(airdrop.getEligibleUsersCount(), 2);
        assertEq(airdrop.getEligibleUserByIndex(0), alice);
    }

    function testInputWinnerListShouldNotRevertIfWrongProof() public {
        address[] memory users = new address[](2);
        users[0] = alice;
        users[1] = bob;

        bytes32[] memory snsIds = new bytes32[](2);
        snsIds[0] = aliceSnsId;
        snsIds[1] = bobSnsId;

        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](2);
        proofs[0] = wrongProof;
        proofs[1] = validProof;

        Airdrop.Preprocessed[] memory preprocess = new Airdrop.Preprocessed[](2);
        preprocess[0] = validPreprocessed;
        preprocess[1] = validPreprocessed;

        Airdrop.PublicInputs[] memory publicInputs = new Airdrop.PublicInputs[](2);
        publicInputs[0] = ValidPublicInputs;
        publicInputs[1] = ValidPublicInputs;

        bytes32[] memory proofHashes = new bytes32[](2);
        proofHashes[0] = dummyProofHash;
        proofHashes[1] = dummyProofHash;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100 * 10 ** 27;
        amounts[1] = 100 * 10 ** 27;

        bool[] memory stakes = new bool[](2);
        stakes[0] = true;
        stakes[1] = false;

        vm.expectEmit(true, true, true, true);
        emit WinnerListUpdated(2);

        airdrop.inputWinnerList(users, snsIds, proofs, preprocess, publicInputs, amounts, proofHashes, stakes);

        // Verify data
        (bytes32 snsId,, uint256 amountGranted, bool isValidProof, bool hasBeenRewarded, bool stake) =
            airdrop.eligibleUser(alice);
        assertEq(snsId, aliceSnsId);
        assertFalse(hasBeenRewarded);
        assertFalse(isValidProof);
        assertTrue(stake);
        assertEq(amountGranted, 100 * 10 ** 27);

        assertEq(airdrop.getEligibleUsersCount(), 2);
        assertEq(airdrop.getEligibleUserByIndex(0), alice);
    }

    function testMaximumParticipants() public {
        address[] memory users = new address[](101);
        bytes32[] memory snsIds = new bytes32[](101);
        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](101);
        Airdrop.Preprocessed[] memory preprocess = new Airdrop.Preprocessed[](101);
        Airdrop.PublicInputs[] memory publicInputs = new Airdrop.PublicInputs[](101);
        bytes32[] memory proofHashes = new bytes32[](101);
        bool[] memory stakes = new bool[](101);
        uint256[] memory amounts = new uint256[](101);

        for (uint256 i = 0; i < 51; i++) {
            users[i] = address(uint160(i + 1));
            snsIds[i] = keccak256(abi.encodePacked(i));
            proofs[i] = validProof;
            proofHashes[i] = dummyProofHash;
            stakes[i] = false;

            amounts[i] = 100 * 10 ** 27;
        }

        vm.expectRevert("maximum number of participants exceeded");
        airdrop.inputWinnerList(users, snsIds, proofs, preprocess, publicInputs, amounts, proofHashes, stakes);
    }

    // Test rewardAll
    function testrewardAll() public {
        _setupMultipleUsers();

        vm.expectEmit(true, true, true, true);
        emit UserRewarded(alice, aliceSnsId, dummyProofHash, 100 * 10 ** 27);
        vm.expectEmit(true, true, true, true);
        emit UserRewarded(bob, bobSnsId, dummyProofHash, 100 * 10 ** 27);
        vm.expectEmit(true, true, true, true);
        emit BatchRewardCompleted(2, 200 * 10 ** 27);

        airdrop.rewardAll();

        // Check balances
        assertEq(wton.balanceOf(address(depositManager)), 100 * 10 ** 27);
        assertEq(wton.balanceOf(bob), 100 * 10 ** 27);

        // Check states
        (,,, bool aliceRewarded,,) = airdrop.eligibleUser(alice);
        (,,, bool bobRewarded,,) = airdrop.eligibleUser(bob);
        assertTrue(aliceRewarded);
        assertTrue(bobRewarded);
    }

    // Test removeUser
    function testRemoveUser() public {
        _setupMultipleUsers();

        airdrop.removeUser(alice);

        // Check user is removed
        (bytes32 snsId,,,,,) = airdrop.eligibleUser(alice);
        assertEq(snsId, bytes32(0));
        assertEq(airdrop.getEligibleUsersCount(), 1);
        assertEq(airdrop.getEligibleUserByIndex(0), bob);
    }

    function testRemoveUserReverts() public {
        // User not found
        vm.expectRevert("User not found");
        airdrop.removeUser(alice);

        // User already rewarded
        _setupSingleUser(alice, aliceSnsId, 100 * 10 ** 18);
        airdrop.rewardAll();

        vm.expectRevert("Airdrop already completed");
        airdrop.removeUser(bob);
    }

    // Test airdrop completion
    function testCompleteAirdrop() public {
        assertFalse(airdrop.airdropCompleted());
        airdrop.completeAirdrop();
        assertTrue(airdrop.airdropCompleted());
    }

    function testActionsAfterCompletion() public {
        _setupSingleUser(alice, aliceSnsId, 100 * 10 ** 18);
        airdrop.completeAirdrop();

        // Cannot add new users
        address[] memory users = new address[](1);
        users[0] = bob;
        bytes32[] memory snsIds = new bytes32[](1);
        snsIds[0] = bobSnsId;
        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](1);
        proofs[0] = validProof;
        Airdrop.Preprocessed[] memory preprocess = new Airdrop.Preprocessed[](1);
        preprocess[0] = validPreprocessed;
        Airdrop.PublicInputs[] memory publicInputs = new Airdrop.PublicInputs[](1);
        publicInputs[0] = ValidPublicInputs;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 * 10 ** 18;
        bytes32[] memory proofHashes = new bytes32[](1);
        proofHashes[0] = dummyProofHash;
        bool[] memory stakes = new bool[](1);
        stakes[0] = false;

        vm.expectRevert("Airdrop event completed");
        airdrop.inputWinnerList(users, snsIds, proofs, preprocess, publicInputs, amounts, proofHashes, stakes);

        // Cannot verify and reward
        vm.expectRevert("Airdrop event completed");
        airdrop.rewardAll();

        vm.expectRevert("Airdrop event completed");
        airdrop.rewardAll();
    }

    // Test withdraw remaining tokens
    function testWithdrawRemainingTokens() public {
        _setupSingleUser(alice, aliceSnsId, 100 * 10 ** 27);
        airdrop.rewardAll();

        uint256 remainingBalance = wton.balanceOf(address(airdrop));
        uint256 ownerBalanceBefore = wton.balanceOf(owner);

        airdrop.completeAirdrop();
        airdrop.withdrawRemainingTokens();

        assertEq(wton.balanceOf(address(airdrop)), 0);
        assertEq(wton.balanceOf(owner), ownerBalanceBefore + remainingBalance);
    }

    // Test verifier update
    function testUpdateVerifier() public {
        address newVerifier = address(new Verifier());

        vm.expectEmit(true, true, true, true);
        emit VerifierUpdated(newVerifier);

        airdrop.updateVerifier(newVerifier);
        assertEq(address(airdrop.verifier()), newVerifier);
    }

    function testUpdateVerifierReverts() public {
        vm.expectRevert("Invalid verifier address");
        airdrop.updateVerifier(address(0));
    }

    function testGetRewardStats() public {
        _setupMultipleUsers();
        assertEq(airdrop.totalUserRewarded(), 0);
        airdrop.rewardAll();
        assertEq(airdrop.totalUserRewarded(), 2);
    }

    function testGetContractBalance() public view {
        assertEq(airdrop.getContractBalance(), 5000 * 10 ** 27);
    }

    // Helper functions
    function _setupSingleUser(address user, bytes32 snsId, uint256 amount) private {
        address[] memory users = new address[](1);
        users[0] = user;

        bytes32[] memory snsIds = new bytes32[](1);
        snsIds[0] = snsId;

        bytes32[] memory proofHashes = new bytes32[](1);
        proofHashes[0] = dummyProofHash;

        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](1);
        proofs[0] = validProof;

        Airdrop.Preprocessed[] memory preprocess = new Airdrop.Preprocessed[](1);
        preprocess[0] = validPreprocessed;

        Airdrop.PublicInputs[] memory publicInputs = new Airdrop.PublicInputs[](1);
        publicInputs[0] = ValidPublicInputs;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;

        bool[] memory stakes = new bool[](1);
        stakes[0] = false;

        airdrop.inputWinnerList(users, snsIds, proofs, preprocess, publicInputs, amounts, proofHashes, stakes);
    }

    function _setupMultipleUsers() private {
        address[] memory users = new address[](2);
        users[0] = alice;
        users[1] = bob;

        bytes32[] memory snsIds = new bytes32[](2);
        snsIds[0] = aliceSnsId;
        snsIds[1] = bobSnsId;

        bytes32[] memory proofHashes = new bytes32[](2);
        proofHashes[0] = dummyProofHash;
        proofHashes[1] = dummyProofHash;

        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](2);
        proofs[0] = validProof;
        proofs[1] = validProof;

        Airdrop.Preprocessed[] memory preprocess = new Airdrop.Preprocessed[](2);
        preprocess[0] = validPreprocessed;
        preprocess[1] = validPreprocessed;

        Airdrop.PublicInputs[] memory publicInputs = new Airdrop.PublicInputs[](2);
        publicInputs[0] = ValidPublicInputs;
        publicInputs[1] = ValidPublicInputs;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100 * 10 ** 27;
        amounts[1] = 100 * 10 ** 27;

        bool[] memory stakes = new bool[](2);
        stakes[0] = true;
        stakes[1] = false;

        airdrop.inputWinnerList(users, snsIds, proofs, preprocess, publicInputs, amounts, proofHashes, stakes);
    }

    function _initializeValidProofData() internal {
        // serializedProofPart1: First 16 bytes (32 hex chars) of each coordinate
        // serializedProofPart2: Last 32 bytes (64 hex chars) of each coordinate
        // preprocessedPart1: First 16 bytes (32 hex chars) of each preprocessed committment coordinate
        // preprocessedPart2: last 32 bytes (64 hex chars) of each preprocessed committment coordinate


        // PREPROCESSED PART 1 (First 16 bytes - 32 hex chars)
        preprocessedPart1.push(0x042df2d7ba82218503dbadeaa9e87792);
        preprocessedPart1.push(0x0801f08b0423c3bb6cc7640b59e2ad81);
        preprocessedPart1.push(0x14d6acdf7112c181e4b618ae54cf2dbb);
        preprocessedPart1.push(0x0620aa348ac912429c4397e4083ba707);

        // PREPROCESSED PART 2 (Last 32 bytes - 64 hex chars)
        preprocessedPart2.push(0xebcab00c3413baa3b039e936e26e87f30a8ed8e4260497bfd1dc2227674f0d02);
        preprocessedPart2.push(0xb3cb4d475bbb5b22058c8ce67c59d218277dbdb6ae79e1e083cc74bc2197b283);
        preprocessedPart2.push(0x9fde9d8a778d5c673020961f56a2976b4cde817a6b617b2dd830da65787a21cd);
        preprocessedPart2.push(0x8c800ff423029764962680ccc47ad3244a8669361f84ad5922f8659e5b8a678e);

        // SERIALIZED PROOF PART 1 (First 16 bytes - 32 hex chars)
        serializedProofPart1.push(0x0c24fdec12d53a11da4d980c17d4e1a0);
        serializedProofPart1.push(0x17a05805dfe64737462cc7905747825b);
        serializedProofPart1.push(0x0896a633d5adf4b47c13d51806d66a35);
        serializedProofPart1.push(0x0a083a0932bebfbe2075aaf972cc5af7);
        serializedProofPart1.push(0x0a28401cd04c6e2e0bf2677b09d43a4c);
        serializedProofPart1.push(0x182ee1ed2f42610a39b255b4a0e84ee5);
        serializedProofPart1.push(0x0bd00d0783c76029e7d10c85d8b7a054);
        serializedProofPart1.push(0x087cbceebc924fadbff19a7059e44a68);
        serializedProofPart1.push(0x0ab348bc443f0fae8b8cf657e1c970ce);
        serializedProofPart1.push(0x1445acc8d6f02dddd0e17eaafd98d200);
        serializedProofPart1.push(0x001708378a5785dc70d0e217112197b9);
        serializedProofPart1.push(0x0783caf01311feb7b0896a179ad220d2);
        serializedProofPart1.push(0x0c5479dab696569b5943662da9194b3b);
        serializedProofPart1.push(0x0cabc8d2b5e630fd8b5698e2d4ce9370);
        serializedProofPart1.push(0x11d4bbafa0da1fc302112e38300bd9a1);
        serializedProofPart1.push(0x0a3c0cc511d40fa513a97ab0fae9da99);
        serializedProofPart1.push(0x03dbeb7f79d515638ed23e5ce018f592);
        serializedProofPart1.push(0x0d1c6c26b1f7d69bb0441eb8fde52aa4);
        serializedProofPart1.push(0x04be84681792a0a5afabba29ed3fcfb8);
        serializedProofPart1.push(0x05fb88f7324750e43d173a23aee8181e);
        serializedProofPart1.push(0x170f46f976ef61677cbebcdefb74feeb);
        serializedProofPart1.push(0x0b17a6a12b6fb13eca79be94abc8582b);
        serializedProofPart1.push(0x064aac9536b7b2ce667f9ba6a28cb1d3);
        serializedProofPart1.push(0x15f89d14f23e7cd275787c22e59b7cfb);
        serializedProofPart1.push(0x1768019026542d286a58258435158b31);
        serializedProofPart1.push(0x0a61414b5c2ccfe907df78c2b39bcd2e);
        serializedProofPart1.push(0x04f4c3891678a4e32c90b78e11a6ade1);
        serializedProofPart1.push(0x1982759528c860a8757bc2afc9f7fda4);
        serializedProofPart1.push(0x158ca44f01aac0407705fe5cc4d44f5c);
        serializedProofPart1.push(0x0a03d544f26007212ab4d53d3a8fcb87);
        serializedProofPart1.push(0x086ece3d5d70f8815d8b1c3659ca8a8a);
        serializedProofPart1.push(0x10b90670319cd41cf4af3e0b474be4ca);
        serializedProofPart1.push(0x158ca44f01aac0407705fe5cc4d44f5c);
        serializedProofPart1.push(0x0a03d544f26007212ab4d53d3a8fcb87);
        serializedProofPart1.push(0x126cbc300279a36e774d9e1c1953e9dc);
        serializedProofPart1.push(0x0ee0a0e6d60e1f8527d56093560223f5);
        serializedProofPart1.push(0x18ab22994ea4cb2eb9ebea8af602f8dd);
        serializedProofPart1.push(0x129eab9c15fcd487d09de770171b6912);

        // SERIALIZED PROOF PART 2 (Last 32 bytes - 64 hex chars)
        serializedProofPart2.push(0x29afb6b437675cf15e0324fe3bad032c88bd9addc36ff22855acb73a5c3f4cef);
        serializedProofPart2.push(0xdd670e5cdb1a14f5842e418357b752ee2200d5eab40a3990615224f2467c985a);
        serializedProofPart2.push(0xa379b716417a5870cc2f334e28cd91a388c5e3f18012f24700a103ea0c2aacb2);
        serializedProofPart2.push(0xffaac16f6dc2f74a0e7e18fba4e5585b4e5d642ded1156a1f58f48853e59aa42);
        serializedProofPart2.push(0xa23bfdfdfca0f91636ecc5527ac26058e20d58bac954eb642bae8bd626ef7010);
        serializedProofPart2.push(0x6f9598e15cdb8c85c5ac7ac0a78e1385446815324b91f17efacada8c544d2196);
        serializedProofPart2.push(0xba1b4b3bc86fb24b15799faa6c863b93de799bcb6a7aa6b000dff5e3dab2471f);
        serializedProofPart2.push(0xec6e41cb9cf3cc5910993ea9f08f40bd100ddf83f93f04e6bdd316797ef0beb0);
        serializedProofPart2.push(0xe9df3c6debe8c19110bc1d660e4deb5a52301ac37ecc90879bd68ecc8d97bdd2);
        serializedProofPart2.push(0x00fc98c6635577ff28950f2143aa83508c93095237abd83d69e2b24886dea95a);
        serializedProofPart2.push(0x63914eaba1999e91128214fdc6658ecfbc495062ceef8457ca7a1ec6c0d0e0eb);
        serializedProofPart2.push(0xd5bbef14f885ccbe203d48b0014ffdb943845363b278c4ab5be13674a2378134);
        serializedProofPart2.push(0x3d07b6d0abc0874227371ff6317cac98105f2f6fc1181cd1d66a4e4ec946cc65);
        serializedProofPart2.push(0x3f31b28005195499d4af392ca85edb0cee55452f39d4237641476955548e12af);
        serializedProofPart2.push(0xa66c27ac6a19f296259e0979530c4fcd90cb9e74249871c0c6489485404d9063);
        serializedProofPart2.push(0xd72bca363ba9ae574db315d4336478d0042b3e0e61270a4792a28368185a3194);
        serializedProofPart2.push(0xed8921adcbf1cf3805b293511a1b11363907a3aac8f481d8fd94374c040e5d6b);
        serializedProofPart2.push(0xd434523ed473b876e8ec1d784d149db6f706deac4d472677587a1fce0a161b3b);
        serializedProofPart2.push(0x6ea759852f22461d6206b877123aa7b5e0c8c2f252bcfd67e7db9e270f4f89f0);
        serializedProofPart2.push(0x58673a8bd4ce54d417f3f4611f1a17babe9ae036c26dbd1c090b5aa21b103e7e);
        serializedProofPart2.push(0x795bb282127eb89f0f74f3ac4225110c7f6ba1d28ee3585c5d2f9fd87407a076);
        serializedProofPart2.push(0x1c5f55837e396d3133e3327a1d55181c43e70a40175eec9830f504196143addc);
        serializedProofPart2.push(0xd6f85a33ffc841e63ffb0f7397933fbc479255bc76350181f60e8a674ce4a511);
        serializedProofPart2.push(0x042e8d8894ad3c74b0a4e53b6d4ed6ef593d6c289192c995573db09388ff6d11);
        serializedProofPart2.push(0x1569d3423b1b51e0bc46ba0eb5cc6a5d85d824a38380712cc45cf82afaf207a5);
        serializedProofPart2.push(0x1ab0450608bd2e5ba51dc73326511bf150fc5641615ae710a50b693b243642c7);
        serializedProofPart2.push(0x08daa13bff0ada0a5bc43ed4d7cea70dd8f326ceb3b4e45c371dd2700ef6f0c6);
        serializedProofPart2.push(0x4b3655e123391a00b8d3071defdab3c8b8417c0f5a547d6b589dcd20ecd33e7e);
        serializedProofPart2.push(0xc6e1ae5fca24804ade878f6ef38651c10c05a135e3f97bfd2d904fda94c7a9b1);
        serializedProofPart2.push(0x7a4e463b9e70b0b696dfbdf889158587a97fef29a5ccec0e9280623518965f4d);
        serializedProofPart2.push(0xcc5b7968dccd9e745adadb83015cd9e23c93952cb531f2f4288da589c0069574);
        serializedProofPart2.push(0xe7f91b230e048be6e77b32dc40b244236168ca832273465751c4f2ccc01cbf64);
        serializedProofPart2.push(0xc6e1ae5fca24804ade878f6ef38651c10c05a135e3f97bfd2d904fda94c7a9b1);
        serializedProofPart2.push(0x7a4e463b9e70b0b696dfbdf889158587a97fef29a5ccec0e9280623518965f4d);
        serializedProofPart2.push(0xbaea13ee7c8871272649ac7715c915a9a56ed50a8dea0571e2eff309d40f58ab);
        serializedProofPart2.push(0x82225a228142d0995337f879f93baf9f33e98586d1fc033a7dacbef88a99fe20);
        serializedProofPart2.push(0x4f776b37f90ad57ce6ea738d9aa08ab70f7b59b4f3936d07b1232bb77dc23b49);
        serializedProofPart2.push(0x9186c52b1e29b407b2ced700d98969bd27ef020d51bedc925a12759bc01b277d);
        serializedProofPart2.push(0x5cbd85f2d305fe00912332e05075b9f0de9c10f44ec7ab91b1f62084281f248c);
        serializedProofPart2.push(0x72369709049708f987668022c05c3ff71329e24dbda58f5107687c2c1c019bc3);
        serializedProofPart2.push(0x54bf083810754a2f2e0ea1a9c2cc1cd0dff97d8fd62a463be309018d5e482d10);
        serializedProofPart2.push(0x4f95625e828ae72498ff9d6e15029b414cd6cc9a8ba6d8f1dc1366f2879c76a8);

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////             PUBLIC INPUTS             ////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        validPublicInputs.push(0x00000000000000000000000000000000ad92adf90254df20eb73f68015e9a000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000001e371b2);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x00000000000000000000000000000000ad92adf90254df20eb73f68015e9a000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000001e371b2);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x00000000000000000000000000000000bcbd36a06b28bf1d5459edbe7dea2c85);
        validPublicInputs.push(0x00000000000000000000000000000000000000000000000000000000fc284778);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x00000000000000000000000000000000bcbd36a06b28bf1d5459edbe7dea2c85);
        validPublicInputs.push(0x00000000000000000000000000000000000000000000000000000000fc284778);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x000000000000000000000000000000004c9920779783843241d6b450935960df);
        validPublicInputs.push(0x00000000000000000000000000000000e69a44d2db21957ed88948127ec06b10);
        validPublicInputs.push(0x000000000000000000000000000000004c9920779783843241d6b450935960df);
        validPublicInputs.push(0x00000000000000000000000000000000e69a44d2db21957ed88948127ec06b10);
        validPublicInputs.push(0x000000000000000000000000000000004cba917fb9796a16f3ca5bc38b943d00);
        validPublicInputs.push(0x0000000000000000000000000000000099377efdd5f7e86f7648b87c1eccd6a8);
        validPublicInputs.push(0x000000000000000000000000000000004cba917fb9796a16f3ca5bc38b943d00);
        validPublicInputs.push(0x0000000000000000000000000000000099377efdd5f7e86f7648b87c1eccd6a8);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);

        smax = 512;
    }

    function _initializeWrongProofData() internal {
        // serializedProofPart1: First 16 bytes (32 hex chars) of each coordinate
        // SERIALIZED PROOF PART 1 (First 16 bytes - 32 hex chars)
        wrongSerializedProofPart1.push(0x05b4f308ff64132b31b740431cee5d70); // U_X
        wrongSerializedProofPart1.push(0x12ae9a8d3ec9c65c98664e311e634d64); // U_Y
        wrongSerializedProofPart1.push(0x08e6d6c1e6691e932692e3942a6cbef7); // V_X
        wrongSerializedProofPart1.push(0x12cdafbf7bf8b80338459969b4c54bcb); // V_Y
        wrongSerializedProofPart1.push(0x0c2fe4549b4508fa6db64b438661f36c); // W_X
        wrongSerializedProofPart1.push(0x00ba5ce79b6c3ee1f9325076cd019f51); // W_Y
        wrongSerializedProofPart1.push(0x10d2a2a6b5d9b0f74e5ca7207cbb10b2); // O_mid_X
        wrongSerializedProofPart1.push(0x143fc4f52ca987f2e47a85310ca5693b); // O_mid_Y
        wrongSerializedProofPart1.push(0x0d0d110f829d162dc4e1e76a7544188b); // O_prv_X
        wrongSerializedProofPart1.push(0x01c43cc10d4ec71dd398bcdbbd6f8eb7); // O_prv_Y
        wrongSerializedProofPart1.push(0x180d963ee9bd02f3e93f7614105c95f3); // Q_{AX}_X
        wrongSerializedProofPart1.push(0x13efcb0e014478ce79000206e8b39ea5); // Q_{AX}_Y
        wrongSerializedProofPart1.push(0x0bc733812b8bba788f2f4fff4751f70d); // Q_{AY}_X
        wrongSerializedProofPart1.push(0x0afb2ae78cb743b453858f07e92b466a); // Q_{AY}_Y
        wrongSerializedProofPart1.push(0x04897b34fcba759c43efbe8834f279b3); // Q_{CX}_X
        wrongSerializedProofPart1.push(0x0af44a63032292984463891d0c1555ee); // Q_{CX}_Y
        wrongSerializedProofPart1.push(0x12e0faf1eaaca9e9e0f3be64eb013c9d); // Q_{CY}_X
        wrongSerializedProofPart1.push(0x151e4f845009fdef5cf50bde3c38d42c); // Q_{CY}_Y
        wrongSerializedProofPart1.push(0x07ec505b12d1d7337382721371829fa1); // Π_{χ}_X
        wrongSerializedProofPart1.push(0x167afb06ffb4c89b5e04a598139f20f0); // Π_{χ}_Y
        wrongSerializedProofPart1.push(0x09468040e794eaa40c964c3b8f4fa252); // Π_{ζ}_X
        wrongSerializedProofPart1.push(0x1395d5b79c0a1e3915974a4899d5b00b); // Π_{ζ}_Y
        wrongSerializedProofPart1.push(0x07ba876a95322207b596d39ed0490997); // B_X
        wrongSerializedProofPart1.push(0x13adce13779790b3bfbee74b54bfa42b); // B_Y
        wrongSerializedProofPart1.push(0x0516cebd5e7b3d9eca97a4959737c8af); // R_X
        wrongSerializedProofPart1.push(0x18d3891d0f746a6e4de8d9f0973c55f3); // R_Y
        wrongSerializedProofPart1.push(0x16911127fce9f466f95506edd9eae5ff); // M_ζ_X (M_Y_X)
        wrongSerializedProofPart1.push(0x05438bddfb750e22c41a713494c7c5e9); // M_ζ_Y (M_Y_Y)
        wrongSerializedProofPart1.push(0x0ac8be4b1cb6a9c8354fcf35e5d7a339); // M_χ_X (M_X_X)
        wrongSerializedProofPart1.push(0x16695706d77185cdfdad3d70e8d73e87); // M_χ_Y (M_X_Y)
        wrongSerializedProofPart1.push(0x172dfe9a0767dda975f5fbde45ed1ae0); // N_ζ_X (N_Y_X)
        wrongSerializedProofPart1.push(0x17b91c24ec6ce0e74426041d668c329a); // N_ζ_Y (N_Y_Y)
        wrongSerializedProofPart1.push(0x0ac8be4b1cb6a9c8354fcf35e5d7a339); // N_χ_X (N_X_X)
        wrongSerializedProofPart1.push(0x16695706d77185cdfdad3d70e8d73e87); // N_χ_Y (N_X_Y)
        wrongSerializedProofPart1.push(0x0883ed3c97b3e674ebfc683481742daa); // O_pub_X
        wrongSerializedProofPart1.push(0x0f697de543d92f067e8ff95912513e49); // O_pub_Y
        wrongSerializedProofPart1.push(0x097d7a0fe6430f3dfe4e10c2db6ec878); // A_X
        wrongSerializedProofPart1.push(0x104de32201c5ba649cc17df4cf759a1f); // A_Y

        smax = 64;
    }
}

// Mock Verifier contract
contract MockVerifier is IVerifier {
    bool public shouldVerify = false;

    function verify(uint128[] memory, uint256[] memory, uint128[] memory, uint256[] memory, uint256[] memory, uint256)
        external
        view
        returns (bool)
    {
        return shouldVerify;
    }
}
