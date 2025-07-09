// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "forge-std/Test.sol";
import {Airdrop} from "../src/Airdrop.sol";
import {Verifier} from "../src/Verifier.sol";
import {IVerifier} from "../src/interface/IVerifier.sol";
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

    address public owner = address(this);
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);

    bytes32 public aliceSnsId = keccak256("alice123");
    bytes32 public bobSnsId = keccak256("bob456");
    bytes32 public charlieSnsId = keccak256("charlie789");

    uint128[] public serializedProofPart1;
    uint256[] public serializedProofPart2;
    uint256[] public publicInputs;
    uint256 public smax;

    Airdrop.Proof public validProof;

    event UserRewarded(address indexed user, bytes32 snsId, uint256 amount);
    event WrongProofProvided(address indexed user, bytes32 snsId, uint256 amount);
    event VerifierUpdated(address indexed newVerifier);
    event WinnerListUpdated(uint256 numberOfWinners);
    event BatchRewardCompleted(uint256 successfulRewards, uint256 totalRewardAmount);

    function setUp() public {
        // Deploy mock contracts
        wton = new MockWTON();
        verifier = new Verifier();
        mockVerifier = new MockVerifier();

        // Deploy airdrop contract
        airdrop = new Airdrop(address(wton), address(verifier));

        _initializeValidProofData();

        // Setup valid proof
        validProof = Airdrop.Proof({
            proof_part1: serializedProofPart1,
            proof_part2: serializedProofPart2,
            publicInputs: publicInputs,
            smax: smax
        });

        // Fund airdrop contract
        wton.transfer(address(airdrop), 5000 * 10 ** 27);
    }

    // Test deployment
    function testDeployment() public view {
        assertEq(address(airdrop.wton()), address(wton));
        assertEq(address(airdrop.verifier()), address(verifier));
        assertEq(airdrop.owner(), owner);
        assertFalse(airdrop.airdropCompleted());
    }

    function testDeploymentWithZeroAddresses() public {
        // Test with zero token address
        vm.expectRevert("Invalid token address");
        new Airdrop(address(0), address(verifier));

        // Test with zero verifier address
        vm.expectRevert("Invalid proof verifier address");
        new Airdrop(address(wton), address(0));
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

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100 * 10 ** 18;
        amounts[1] = 100 * 10 ** 18;

        vm.expectEmit(true, true, true, true);
        emit WinnerListUpdated(2);

        airdrop.inputWinnerList(users, snsIds, proofs, amounts);

        // Verify data
        (bytes32 snsId, uint256 amountGranted, , bool hasBeenRewarded) = airdrop.eligibleUser(alice);
        assertEq(snsId, aliceSnsId);
        assertFalse(hasBeenRewarded);
        assertEq(amountGranted, 100 * 10 ** 18);

        assertEq(airdrop.getEligibleUsersCount(), 2);
        assertEq(airdrop.getEligibleUserByIndex(0), alice);
    }

    function testInputWinnerListReverts() public {
        address[] memory users = new address[](2);
        bytes32[] memory snsIds = new bytes32[](1);
        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](2);
        uint256[] memory amounts = new uint256[](2);

        // Length mismatch
        vm.expectRevert("Users and SNS IDs length mismatch");
        airdrop.inputWinnerList(users, snsIds, proofs, amounts);

        // Empty arrays
        address[] memory emptyUsers = new address[](0);
        bytes32[] memory emptySnsIds = new bytes32[](0);
        Airdrop.Proof[] memory emptyProofs = new Airdrop.Proof[](0);
        uint256[] memory emptyAmounts = new uint256[](0);

        vm.expectRevert("Empty arrays not allowed");
        airdrop.inputWinnerList(emptyUsers, emptySnsIds, emptyProofs, emptyAmounts);

        // Invalid user address
        users[0] = address(0);
        users[1] = alice;
        snsIds = new bytes32[](2);
        snsIds[0] = aliceSnsId;
        snsIds[1] = bobSnsId;

        vm.expectRevert("Invalid user address");
        airdrop.inputWinnerList(users, snsIds, proofs, amounts);

        // Invalid SNS ID
        users[0] = alice;
        snsIds[0] = bytes32(0);

        vm.expectRevert("Invalid SNS ID");
        airdrop.inputWinnerList(users, snsIds, proofs, amounts);

        // Duplicate user
        users[0] = alice;
        users[1] = alice;
        snsIds[0] = aliceSnsId;
        snsIds[1] = aliceSnsId;

        vm.expectRevert("User already exists");
        airdrop.inputWinnerList(users, snsIds, proofs, amounts);
    }

    function testMaximumParticipants() public {
        address[] memory users = new address[](101);
        bytes32[] memory snsIds = new bytes32[](101);
        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](101);
        uint256[] memory amounts = new uint256[](101);

        for (uint256 i = 0; i < 51; i++) {
            users[i] = address(uint160(i + 1));
            snsIds[i] = keccak256(abi.encodePacked(i));
            proofs[i] = validProof;
            amounts[i] = 100 * 10 ** 27;
        }

        vm.expectRevert("maximum number of participants reached");
        airdrop.inputWinnerList(users, snsIds, proofs, amounts);
    }

    // Test verifyAndRewardSingle
    function testVerifyAndRewardSingle() public {
        // Setup eligible user
        _setupSingleUser(alice, aliceSnsId, 100 * 10 ** 27);

        vm.expectEmit(true, true, true, true);
        emit UserRewarded(alice, aliceSnsId, 100 * 10 ** 27);

        airdrop.verifyAndRewardSingle(alice);

        // Check state
        (,, bool rewarded,) = airdrop.eligibleUser(alice);
        assertTrue(rewarded);
        assertEq(wton.balanceOf(alice), 100 * 10 ** 27);
    }

    function testVerifyAndRewardSingleWithInvalidProof() public {
        _setupSingleUser(alice, aliceSnsId, 100 * 10 ** 27);

        airdrop.updateVerifier(address(mockVerifier)); // will return false everytime
        vm.expectRevert("Invalid proof");
        airdrop.verifyAndRewardSingle(alice);
    }

    function testVerifyAndRewardSingleReverts() public {
        // User not eligible
        vm.expectRevert("User not eligible");
        airdrop.verifyAndRewardSingle(alice);

        // Already rewarded
        _setupSingleUser(alice, aliceSnsId, 100 * 10 ** 27);
        airdrop.verifyAndRewardSingle(alice);

        vm.expectRevert("Already rewarded");
        airdrop.verifyAndRewardSingle(alice);

        // Insufficient tokens
        vm.expectRevert("max granted amount per user reached");
        _setupSingleUser(bob, bobSnsId, 1000000 * 10 ** 27);
    }

    // Test verifyAndRewardAll
    function testVerifyAndRewardAll() public {
        _setupMultipleUsers();

        vm.expectEmit(true, true, true, true);
        emit UserRewarded(alice, aliceSnsId, 100 * 10 ** 27);
        vm.expectEmit(true, true, true, true);
        emit UserRewarded(bob, bobSnsId, 100 * 10 ** 27);
        vm.expectEmit(true, true, true, true);
        emit BatchRewardCompleted(2, 200 * 10 ** 27);

        airdrop.verifyAndRewardAll();

        // Check balances
        assertEq(wton.balanceOf(alice), 100 * 10 ** 27);
        assertEq(wton.balanceOf(bob), 100 * 10 ** 27);

        // Check states
        (,, bool aliceRewarded,) = airdrop.eligibleUser(alice);
        (,, bool bobRewarded,) = airdrop.eligibleUser(bob);
        assertTrue(aliceRewarded);
        assertTrue(bobRewarded);
    }

    function testVerifyAndRewardAllWithInvalidProof() public {
        _setupMultipleUsers();

        // Make bob's proof invalid
        airdrop.verifyAndRewardSingle(alice);

        airdrop.updateVerifier(address(mockVerifier)); // will return false everytime

        vm.expectEmit(true, true, true, true);
        emit WrongProofProvided(bob, bobSnsId, 100 * 10 ** 27);
        vm.expectEmit(true, true, true, true);
        emit BatchRewardCompleted(0, 0);

        airdrop.verifyAndRewardAll();

        // Bob should be marked as rewarded but no tokens transferred
        (,, bool bobRewarded,) = airdrop.eligibleUser(bob);
        assertTrue(bobRewarded);
        assertEq(wton.balanceOf(bob), 0);
    }

    function testVerifyAndRewardAllSkipsRewarded() public {
        _setupMultipleUsers();

        // Reward alice first
        airdrop.verifyAndRewardSingle(alice);

        // Call verifyAndRewardAll
        vm.expectEmit(true, true, true, true);
        emit UserRewarded(bob, bobSnsId, 100 * 10 ** 27);
        vm.expectEmit(true, true, true, true);
        emit BatchRewardCompleted(1, 100 * 10 ** 27);

        airdrop.verifyAndRewardAll();
    }

    // Test removeUser
    function testRemoveUser() public {
        _setupMultipleUsers();

        airdrop.removeUser(alice);

        // Check user is removed
        (bytes32 snsId,,,) = airdrop.eligibleUser(alice);
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
        airdrop.verifyAndRewardSingle(alice);

        vm.expectRevert("User already rewarded");
        airdrop.removeUser(alice);

        // Airdrop completed
        _setupSingleUser(bob, bobSnsId, 100 * 10 ** 18);
        airdrop.completeAirdrop();

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
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 * 10 ** 18;

        vm.expectRevert("Airdrop event completed");
        airdrop.inputWinnerList(users, snsIds, proofs, amounts);

        // Cannot verify and reward
        vm.expectRevert("Airdrop event completed");
        airdrop.verifyAndRewardSingle(alice);

        vm.expectRevert("Airdrop event completed");
        airdrop.verifyAndRewardAll();
    }

    // Test withdraw remaining tokens
    function testWithdrawRemainingTokens() public {
        _setupSingleUser(alice, aliceSnsId, 100 * 10 ** 18);
        airdrop.verifyAndRewardSingle(alice);

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

        (uint256 total, uint256 rewarded, uint256 pending) = airdrop.getRewardStats();
        assertEq(total, 2);
        assertEq(rewarded, 0);
        assertEq(pending, 2);

        airdrop.verifyAndRewardSingle(alice);

        (total, rewarded, pending) = airdrop.getRewardStats();
        assertEq(total, 2);
        assertEq(rewarded, 1);
        assertEq(pending, 1);
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

        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](1);
        proofs[0] = validProof;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;

        airdrop.inputWinnerList(users, snsIds, proofs, amounts);
    }

    function _setupMultipleUsers() private {
        address[] memory users = new address[](2);
        users[0] = alice;
        users[1] = bob;

        bytes32[] memory snsIds = new bytes32[](2);
        snsIds[0] = aliceSnsId;
        snsIds[1] = bobSnsId;

        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](2);
        proofs[0] = validProof;
        proofs[1] = validProof;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100 * 10 ** 27;
        amounts[1] = 100 * 10 ** 27;

        airdrop.inputWinnerList(users, snsIds, proofs, amounts);
    }

    function _initializeValidProofData() internal {
        // serializedProofPart1: First 16 bytes (32 hex chars) of each coordinate
        // serializedProofPart2: Last 32 bytes (64 hex chars) of each coordinate

        // SERIALIZED PROOF PART 1 (First 16 bytes - 32 hex chars)
        serializedProofPart1.push(0x0d8838cc826baa7ccd8cfe0692e8a13d); // s^{(0)}(x,y)_X
        serializedProofPart1.push(0x103aeb959c53fdd5f13b70a350363881); // s^{(0)}(x,y)_Y
        serializedProofPart1.push(0x09f0f94fd2dc8976bfeab5da30e1fa04); // s^{(1)}(x,y)_X
        serializedProofPart1.push(0x17cb62f5e698fe087b0f334e2fb2439c); // s^{(1)}(x,y)_Y
        serializedProofPart1.push(0x05b4f308ff641adb31b740431cee5d70); // U_X
        serializedProofPart1.push(0x12ae9a8d3ec9c65c98664e311e634d64); // U_Y
        serializedProofPart1.push(0x08e6d6c1e6691e932692e3942a6cbef7); // V_X
        serializedProofPart1.push(0x12cdafbf7bf8b80338459969b4c54bcb); // V_Y
        serializedProofPart1.push(0x0c2fe4549b4508fa6db64b438661f36c); // W_X
        serializedProofPart1.push(0x00ba5ce79b6c3ee1f9323076cd019f51); // W_Y
        serializedProofPart1.push(0x10d2a2a6b5d9b0f74e5ca7207cbb10b2); // O_mid_X
        serializedProofPart1.push(0x143fc4f52ca987f2e47885310ca5693b); // O_mid_Y
        serializedProofPart1.push(0x0d0d110f829d162dc4e1e76a7544188b); // O_prv_X
        serializedProofPart1.push(0x01c43cc10d4ec71dd398bcdbbd6f8eb7); // O_prv_Y
        serializedProofPart1.push(0x180d963ee9bd02f3e9367614105c95f3); // Q_{AX}_X
        serializedProofPart1.push(0x13efcb0e014478ce79000206e8b39ea5); // Q_{AX}_Y
        serializedProofPart1.push(0x0bc733812b8bba788f2f4fff4751f70d); // Q_{AY}_X
        serializedProofPart1.push(0x0afb2ae78cb743b453868f07e92b466a); // Q_{AY}_Y
        serializedProofPart1.push(0x04897b34fcba759c43efbe8834f279b3); // Q_{CX}_X
        serializedProofPart1.push(0x0af44a63032292984463891d0c1555ee); // Q_{CX}_Y
        serializedProofPart1.push(0x12e0faf1eaaca9e9e0f5be64eb013c9d); // Q_{CY}_X
        serializedProofPart1.push(0x151e4f845009fdef5cf50bde3c38d42c); // Q_{CY}_Y
        serializedProofPart1.push(0x07ec505b12d1d7337382721371829fa1); // Π_{χ}_X
        serializedProofPart1.push(0x167afb06ffb4c89b5e04a598139f20f0); // Π_{χ}_Y
        serializedProofPart1.push(0x09468040e794eaa40c964c3b8f4fa252); // Π_{ζ}_X
        serializedProofPart1.push(0x1395d5b79c0a1e3915974a4899d5b00b); // Π_{ζ}_Y
        serializedProofPart1.push(0x07ba876a95322207b596d39ed0490997); // B_X
        serializedProofPart1.push(0x13adce13779790b3bfbee74b54bfa42b); // B_Y
        serializedProofPart1.push(0x0516cebd5e7b3d9eca97a4959737c8af); // R_X
        serializedProofPart1.push(0x18d3891d0f746a6e4de8d9f0973c55f3); // R_Y
        serializedProofPart1.push(0x16911127fce9f466f95506edd9eae5ff); // M_ζ_X (M_Y_X)
        serializedProofPart1.push(0x05438bddfb750e22c41a713494c7c5e9); // M_ζ_Y (M_Y_Y)
        serializedProofPart1.push(0x0ac8be4b1cb6a9c8354fcf35e5d7a339); // M_χ_X (M_X_X)
        serializedProofPart1.push(0x16695706d77185cdfdad3d70e8d73e87); // M_χ_Y (M_X_Y)
        serializedProofPart1.push(0x172dfe9a0767dda975f5fbde45ed1ae0); // N_ζ_X (N_Y_X)
        serializedProofPart1.push(0x17b91c24ec6ce0e74426041d668c329a); // N_ζ_Y (N_Y_Y)
        serializedProofPart1.push(0x0ac8be4b1cb6a9c8354fcf35e5d7a339); // N_χ_X (N_X_X)
        serializedProofPart1.push(0x16695706d77185cdfdad3d70e8d73e87); // N_χ_Y (N_X_Y)
        serializedProofPart1.push(0x0883ed3c97b3e674ebfc683481742daa); // O_pub_X
        serializedProofPart1.push(0x0f697de543d92f067e8ff95912513e49); // O_pub_Y
        serializedProofPart1.push(0x097d7a0fe6430f3dfe4e10c2db6ec878); // A_X
        serializedProofPart1.push(0x104de32201c5ba649cc17df4cf759a1f); // A_Y

        // SERIALIZED PROOF PART 2 (Last 32 bytes - 64 hex chars)
        serializedProofPart2.push(0xbbae56c781b300594dac0753e75154a00b83cc4e6849ef3f07bb56610a02c828); // s^{(0)}(x,y)_X
        serializedProofPart2.push(0xf3447285889202e7e24cd08a058a758a76ee4c8440131be202ad8bc0cc91ee70); // s^{(0)}(x,y)_Y
        serializedProofPart2.push(0x76e577ad778dc4476b10709945e71e289be5ca05c412ca04c133c485ae8bc757); // s^{(1)}(x,y)_X
        serializedProofPart2.push(0x7ada41cb993109dc7c194693dbcc461f8512755054966319bcbdea3a1da86938); // s^{(1)}(x,y)_Y
        serializedProofPart2.push(0x12f31df6476c99289584549ae13292a824df5e10f546a9659d08479cf55b3bb2); // U_X
        serializedProofPart2.push(0xd28e43565c5c0a0b6d625a4572e02fbb6de2b255911ebe90f551a43a48c52ec0); // U_Y
        serializedProofPart2.push(0x185457d5b78e0dd03fb83b4af872c2f9800e0d4d3bbb1e36ca85a9d8ce763e55); // V_X
        serializedProofPart2.push(0x559b5cc09730db68b632e905b9ff96bbaffedfdf89e91dadbd7b49dbe2d89960); // V_Y
        serializedProofPart2.push(0xb0f667aff5ec036e5324a9e11b04f1390d31e422fb358943b6e9834ceafc2d45); // W_X
        serializedProofPart2.push(0x5831b2fcca492d422c2c5b78cfd02bbb55bd9ef574d764400661c44345712a95); // W_Y
        serializedProofPart2.push(0xea67be102035f7f79a8e8ebd8cffb3ce8dd14458c20a93e1a99e31e6756f33ee); // O_mid_X
        serializedProofPart2.push(0x430617634aa53978ade5412f3ebdb29a91d21a1ddb39eab112df55ef2d2740e4); // O_mid_Y
        serializedProofPart2.push(0x9a3aa207f182acea8ec2ab6fdbe9a293e2996e1770815135af9dc7dcab829cd5); // O_prv_X
        serializedProofPart2.push(0xe54e2e3f05333664792be98ebfe73b8b224acc83074196478593e852ceb2cbef); // O_prv_Y
        serializedProofPart2.push(0x2a2f967e8490650c5dd5893db46c1f61a6bf38ead27c0065c44077656ac88e8d); // Q_{AX}_X
        serializedProofPart2.push(0x3a25dec62a83cf44cb5356420caf0dcbc4d94b9a0025349a2680b67582d4ceef); // Q_{AX}_Y
        serializedProofPart2.push(0xec308bd22c38acd83cb466e91c0a977b03bc7ab87b5655e1a844c97fa1ad8bed); // Q_{AY}_X
        serializedProofPart2.push(0xfddfd77793b5af2206625e7dbd3840d179aae985bf5673d02484a0685b803930); // Q_{AY}_Y
        serializedProofPart2.push(0x04acda4fdb36bb30b7aea7540d1fd469fdcb01b32b2ba74de53870a6fbd93dad); // Q_{CX}_X
        serializedProofPart2.push(0x9e2b3794cd4fe439fe02788fac15f5d5de8a38a35431df4d17b817bd091ffdb1); // Q_{CX}_Y
        serializedProofPart2.push(0x38848585c4de95f0ccd6c77cbcb630593e9bf245e78d126978b1229e771580a4); // Q_{CY}_X
        serializedProofPart2.push(0x8691e07a7670c43a463111b013e9050325b870219c35603d55bc09e800c0da61); // Q_{CY}_Y
        serializedProofPart2.push(0x99377148bd378731f820de792040dc114dbac2a120de8e26820cb39c24f2d255); // Π_{χ}_X
        serializedProofPart2.push(0xffef9a993e7c0e2e1991d0722671e8c1544d336bbcaff45e94d80a2fd4a68a2b); // Π_{χ}_Y
        serializedProofPart2.push(0xca315029695dcddb58ec2ffab2e8931a9f0cdfe16456a5ddaa820f129566b3c2); // Π_{ζ}_X
        serializedProofPart2.push(0x6a5d94033876ebad48b9d9f3af72e0b39eac4d020bd642e21571e9eb88d918e9); // Π_{ζ}_Y
        serializedProofPart2.push(0x31a915839974262e523f24f696dd93c7928481d3765e8f70454d3fe7ea9cc04d); // B_X
        serializedProofPart2.push(0x88b8b73587f6030d3a536801b4376a684b428f0cf2c9a10b74b874e342bd9a33); // B_Y
        serializedProofPart2.push(0xa6237eb1a20b4a5602933a791965281782f0311ba6c490b6f3909ca35bfd0528); // R_X
        serializedProofPart2.push(0xe6e0afccccf07f40dc377094e188610dd3fda0bc42131d84c3512ef14a7df6a4); // R_Y
        serializedProofPart2.push(0x953ba795920785f216d6016142f26c42c17ce081c0637c35b13f8896345f422d); // M_ζ_X
        serializedProofPart2.push(0x6290c529a10345bc54f7ac860765dc9a6b1fbaf282e6e58ead695c718b484ecd); // M_ζ_Y
        serializedProofPart2.push(0x091e748f260d20003c2a1a29d6f58cfb8f28c065bbeee13a4a51d71e91922d17); // M_χ_X
        serializedProofPart2.push(0x92069bad6f6cf9ce5c4623a2799e610dbee116e00ca9247881d67ccd5b808bc7); // M_χ_Y
        serializedProofPart2.push(0x36a63f824b54a0f7379d756244f27bbb31cefb4600be600034454e3d93f194a8); // N_ζ_X
        serializedProofPart2.push(0xd53a583d68a44600fa4150e55c74c5def7a96ccc4ea89602f25942eb479e1d0e); // N_ζ_Y
        serializedProofPart2.push(0x091e748f260d20003c2a1a29d6f58cfb8f28c065bbeee13a4a51d71e91922d17); // N_χ_X
        serializedProofPart2.push(0x92069bad6f6cf9ce5c4623a2799e610dbee116e00ca9247881d67ccd5b808bc7); // N_χ_Y
        serializedProofPart2.push(0xda9079a92f7bfe749313cd11fd1faf480cbd6829a27de4e182a9c699a459af59); // O_pub_X
        serializedProofPart2.push(0x9c500eac60a728c7e61f88269a1ed9317e763608e3917f78a9697bda457c9955); // O_pub_Y
        serializedProofPart2.push(0x4d66b638321b58bbfdf6b0a17a44a9d9cda67b1a74eea5d0846a99769f18bb17); // A_X
        serializedProofPart2.push(0x4109049c345548f5d1c05fc481a4594d4764dc966bb22dd42a45cc10cd38a7e2); // A_Y

        // evaluations
        serializedProofPart2.push(0x556e7206f0462de3787e80eba2a7ea0eaced54f3bc4386e7f442a2227caafb5e); // R_eval
        serializedProofPart2.push(0x52b690b1abedd5d98d6dc1da501896a0d24d16b4ac50b2b91705c9eacbf4ac0b); // R_omegaX_eval
        serializedProofPart2.push(0x416c2033250efefa6a38b627ba05c7ba67e800b681f9783a079f27c15f2aac32); // R_omegaX_omegaY_eval
        serializedProofPart2.push(0x130694604026116d02cbb135233c3219dce6a8527f02960cb4217dc0b8b17d17); // V_eval

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////             PUBLIC INPUTS             ////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Elements 0-31
        publicInputs.push(0x00000000000000000000000000000000392a2d1a05288b172f205541a56fc20d);
        publicInputs.push(0x00000000000000000000000000000000000000000000000000000000c2c30e79);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x00000000000000000000000000000000392a2d1a05288b172f205541a56fc20d);
        publicInputs.push(0x00000000000000000000000000000000000000000000000000000000c2c30e79);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x00000000000000000000000000000000d4ad12e56e54018313761487d2d1fee9);
        publicInputs.push(0x000000000000000000000000000000000000000000000000000000000ce8f6c9);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x00000000000000000000000000000000d4ad12e56e54018313761487d2d1fee9);
        publicInputs.push(0x000000000000000000000000000000000000000000000000000000000ce8f6c9);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);

        // Elements 32-63 (all zeros)
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);

        // Elements 64-71 (non-zero values)
        publicInputs.push(0x0000000000000000000000000000000020af07748adbb0932a59cfb9ad012354);
        publicInputs.push(0x00000000000000000000000000000000f903343320db59a6e85d0dbb1bc7d722);
        publicInputs.push(0x0000000000000000000000000000000020af07748adbb0932a59cfb9ad012354);
        publicInputs.push(0x00000000000000000000000000000000f903343320db59a6e85d0dbb1bc7d722);
        publicInputs.push(0x000000000000000000000000000000001f924fe321c5cf7ad7a47b57891fbcb0);
        publicInputs.push(0x0000000000000000000000000000000081f4f96b68c216b824fb32a8c09bd5a8);
        publicInputs.push(0x000000000000000000000000000000001f924fe321c5cf7ad7a47b57891fbcb0);
        publicInputs.push(0x0000000000000000000000000000000081f4f96b68c216b824fb32a8c09bd5a8);

        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        publicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);

        smax = 64;
    }
}

// Mock Verifier contract
contract MockVerifier is IVerifier {
    bool public shouldVerify = false;

    function verify(uint128[] memory, uint256[] memory, uint256[] memory, uint256) external view returns (bool) {
        return shouldVerify;
    }
}
