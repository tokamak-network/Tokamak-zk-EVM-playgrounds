// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/token/ERC20/IERC20.sol";
import "@openzeppelin/access/Ownable.sol";
import "@openzeppelin/utils/ReentrancyGuard.sol";
import {IVerifier} from "./interface/IVerifier.sol";

contract Airdrop is Ownable, ReentrancyGuard {
    struct UserInfo {
        bytes32 snsId;
        bytes32 proofHash;
        uint256 amountGranted;
        bool isProofValid;
        bool hasBeenRewarded;
    }

    struct Proof {
        uint128[] proof_part1;
        uint256[] proof_part2;
    }

    struct Preprocessed {
        uint128[] preprocessedPart1;
        uint256[] preprocessedPart2;
    }

    // wton token
    IERC20 public immutable wton;

    // The proof verification contract
    IVerifier public verifier;

    mapping(address => UserInfo) public eligibleUser;
    address[] public eligibleUsers;
    uint256 public totalUserRewarded;
    uint256 public totalAmountDistributed;
    uint256 public smax;

    uint256 public constant MAXIMUM_PARTICIPANTS = 50;

    bool public airdropCompleted;

    // Events
    event UserRewarded(address indexed user, bytes32 snsId, uint256 amount);
    event WrongProofProvided(address indexed user, bytes32 snsId, uint256 amount);
    event VerifierUpdated(address indexed newVerifier);
    event WinnerListUpdated(uint256 numberOfWinners);
    event BatchRewardCompleted(uint256 successfulRewards, uint256 totalRewardAmount);
    event SmaxUpdated(uint256 newSmax);

    constructor(address _wton, address _verifier) Ownable(msg.sender) {
        require(_wton != address(0), "Invalid token address");
        require(_verifier != address(0), "Invalid proof verifier address");

        wton = IERC20(_wton);
        verifier = IVerifier(_verifier);
        airdropCompleted = false;
        smax = 64;
    }

    function inputWinnerList(
        address[] calldata users,
        bytes32[] calldata snsIds,
        Proof[] calldata proofs,
        Preprocessed calldata preprocessed,
        uint256[] calldata publicInputs,
        uint256[] calldata amountsGranted,
        bytes32[] calldata proofHashes
    ) external onlyOwner {
        require(users.length == snsIds.length, "Users and SNS IDs length mismatch");
        require(users.length == proofs.length, "Users and proofs length mismatch");
        require(users.length == amountsGranted.length, "Users and amounts length mismatch");
        require(users.length == proofHashes.length, "Users and proof hashes lengh mismatch");
        require(users.length > 0, "Empty arrays not allowed");
        require(!airdropCompleted, "Airdrop event completed");

        for (uint256 i = 0; i < users.length; i++) {
            require(users[i] != address(0), "Invalid user address");
            require(snsIds[i] != bytes32(0), "Invalid SNS ID");
            require(amountsGranted[i] <= 100 * 10 ** 27, "max granted amount per user exceeded");

            // Check if user is already in the list
            require(eligibleUser[users[i]].snsId == bytes32(0), "User already exists");

            // Store user information

            if (
                verifier.verify(
                    proofs[i].proof_part1,
                    proofs[i].proof_part2,
                    preprocessed.preprocessedPart1,
                    preprocessed.preprocessedPart2,
                    publicInputs,
                    smax
                )
            ) {
                eligibleUser[users[i]] = UserInfo({
                    snsId: snsIds[i],
                    proofHash: proofHashes[i],
                    hasBeenRewarded: false,
                    amountGranted: amountsGranted[i],
                    isProofValid: true
                });
            } else {
                eligibleUser[users[i]] = UserInfo({
                    snsId: snsIds[i],
                    proofHash: proofHashes[i],
                    hasBeenRewarded: false,
                    amountGranted: amountsGranted[i],
                    isProofValid: false
                });
            }

            // array for iteration
            eligibleUsers.push(users[i]);
            require(eligibleUsers.length <= MAXIMUM_PARTICIPANTS, "maximum number of participants exceeded");
        }

        emit WinnerListUpdated(users.length);
    }

    /**
     * @dev Verify proofs and transfer tokens to all eligible users who haven't been rewarded
     */
    function rewardAll() external nonReentrant onlyOwner {
        require(eligibleUsers.length > 0, "No eligible users");
        require(!airdropCompleted, "Airdrop event completed");

        uint256 successfulRewards = 0;
        uint256 totalRewardAmount = 0;

        for (uint256 i = 0; i < eligibleUsers.length; i++) {
            address user = eligibleUsers[i];

            // Skip if already rewarded
            if (eligibleUser[user].hasBeenRewarded) {
                continue;
            }

            // Skip users associated with a wrong proof
            if (!eligibleUser[user].isProofValid) {
                emit WrongProofProvided(user, eligibleUser[user].snsId, eligibleUser[user].amountGranted);
                continue;
            }

            // Check if contract has enough tokens for this reward
            if (wton.balanceOf(address(this)) < eligibleUser[user].amountGranted) {
                break; // Stop if insufficient tokens
            }

            // Mark as rewarded
            eligibleUser[user].hasBeenRewarded = true;

            successfulRewards++;
            totalRewardAmount += eligibleUser[user].amountGranted;

            // Transfer tokens
            require(wton.transfer(user, eligibleUser[user].amountGranted), "Token transfer failed");

            emit UserRewarded(user, eligibleUser[user].snsId, eligibleUser[user].amountGranted);
        }

        airdropCompleted = true;
        emit BatchRewardCompleted(successfulRewards, totalRewardAmount);
    }

    /**
     * @dev update granted amount for specific users
     */
    function updateGrantedAmount(address[] calldata users, uint256[] calldata amountsGranted) external onlyOwner {
        require(users.length == amountsGranted.length, "Users and amounts length mismatch");
        require(users.length > 0, "Empty arrays not allowed");
        require(!airdropCompleted, "Airdrop already completed");

        for (uint256 i = 0; i < users.length; i++) {
            // Check if user exists
            require(eligibleUser[users[i]].snsId != bytes32(0), "User not found");

            // Check if user hasn't been rewarded yet
            require(!eligibleUser[users[i]].hasBeenRewarded, "User already rewarded");

            // Check new amount doesn't exceed maximum
            require(amountsGranted[i] <= 100 * 10 ** 27, "max granted amount per user reached");

            // Update the granted amount
            eligibleUser[users[i]].amountGranted = amountsGranted[i];
        }

        emit WinnerListUpdated(users.length);
    }

    // emergency functions
    function removeUser(address user) external onlyOwner {
        require(!airdropCompleted, "Airdrop already completed");
        require(eligibleUser[user].snsId != bytes32(0), "User not found");
        require(!eligibleUser[user].hasBeenRewarded, "User already rewarded");

        // Remove from mapping
        delete eligibleUser[user];

        // Remove from array - find and replace with last element
        for (uint256 i = 0; i < eligibleUsers.length; i++) {
            if (eligibleUsers[i] == user) {
                eligibleUsers[i] = eligibleUsers[eligibleUsers.length - 1];
                eligibleUsers.pop();
                break;
            }
        }
    }

    /**
     * @dev mark the event as completed
     */
    function completeAirdrop() external onlyOwner {
        airdropCompleted = true;
    }

    function setSmax(uint256 _smax) external onlyOwner {
        smax = _smax;
        emit SmaxUpdated(_smax);
    }

    /**
     * @dev withdraw remaining reward
     */
    function withdrawRemainingTokens() external onlyOwner {
        require(airdropCompleted, "Airdrop not completed yet");
        uint256 balance = wton.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(wton.transfer(owner(), balance), "Token transfer failed");
    }

    /**
     * @dev Get the number of eligible users
     */
    function getEligibleUsersCount() external view returns (uint256) {
        return eligibleUsers.length;
    }

    /**
     * @dev Get eligible user address by index
     */
    function getEligibleUserByIndex(uint256 index) external view returns (address) {
        require(index < eligibleUsers.length, "Index out of bounds");
        return eligibleUsers[index];
    }

    /**
     * @dev Get reward statistics
     */
    function getRewardStats()
        external
        view
        returns (uint256 totalEligible, uint256 totalRewarded, uint256 pendingRewards)
    {
        totalEligible = eligibleUsers.length;

        for (uint256 i = 0; i < eligibleUsers.length; i++) {
            if (eligibleUser[eligibleUsers[i]].hasBeenRewarded) {
                totalRewarded++;
            }
        }

        pendingRewards = totalEligible - totalRewarded;
    }

    /**
     * @dev Get the contract's token balance
     * @return uint256 current token balance
     */
    function getContractBalance() external view returns (uint256) {
        return wton.balanceOf(address(this));
    }

    /**
     * @dev Update the proof verifier contract (only owner)
     * @param _newVerifier New proof verifier contract address
     */
    function updateVerifier(address _newVerifier) external onlyOwner {
        require(_newVerifier != address(0), "Invalid verifier address");
        verifier = IVerifier(_newVerifier);
        emit VerifierUpdated(_newVerifier);
    }
}
