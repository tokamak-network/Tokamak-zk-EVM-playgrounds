# Airdrop Contract

A secure and efficient smart contract for distributing WTON tokens to eligible users through zero-knowledge proof verification.

## Overview

The Airdrop contract enables administrators to distribute tokens to a whitelist of users who must provide valid zero-knowledge proofs to claim their rewards. The contract supports both individual and batch reward distribution, with built-in security features and administrative controls.

## Features

- **Zero-Knowledge Proof Verification**: Users must provide valid proofs to claim rewards
- **Batch Processing**: Efficiently distribute rewards to multiple users in a single transaction
- **Individual Claims**: Support for processing individual user claims
- **Security Features**:
  - Reentrancy protection
  - Owner-only administrative functions
  - Maximum participant limit (100 users)
  - Proof verification before token transfer
- **Administrative Controls**:
  - Add/remove eligible users
  - Update verifier contract
  - Complete airdrop and withdraw remaining tokens
  - Emergency user removal

## Contract Architecture

### Dependencies

- OpenZeppelin Contracts:
  - `IERC20`: Token interface for WTON
  - `Ownable`: Access control
  - `ReentrancyGuard`: Reentrancy protection
- Custom `IVerifier` interface for proof verification

### Key Components

1. **UserInfo Structure**
   ```solidity
   struct UserInfo {
       bytes32 snsId;          // User's SNS identifier
       Proof proof;            // Zero-knowledge proof
       bool hasBeenRewarded;   // Claim status
       uint256 amountGranted;  // Token amount to receive
   }
   ```

2. **Proof Structure**
   ```solidity
   struct Proof {
       uint128[] proof_part1;  // First part of proof data
       uint256[] proof_part2;  // Second part of proof data
       uint256[] publicInputs; // Public inputs for verification
       uint256 smax;          // Maximum value parameter
   }
   ```

## Installation

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js and npm (for OpenZeppelin contracts)

### Setup

1. Install dependencies:
   ```bash
   forge install OpenZeppelin/openzeppelin-contracts
   ```

2. Compile contracts:
   ```bash
   forge build
   ```

## Usage

### Deployment

Deploy the contract with the WTON token address and verifier contract address:

```solidity
Airdrop airdrop = new Airdrop(wtonAddress, verifierAddress);
```

### Adding Eligible Users

The owner can add eligible users with their proofs and reward amounts:

```solidity
address[] memory users = [user1, user2, user3];
bytes32[] memory snsIds = [snsId1, snsId2, snsId3];
Proof[] memory proofs = [proof1, proof2, proof3];
uint256[] memory amounts = [amount1, amount2, amount3];

airdrop.inputWinnerList(users, snsIds, proofs, amounts);
```

### Claiming Rewards

**Individual Claims:**
```solidity
airdrop.verifyAndRewardSingle(userAddress);
```

**Batch Claims:**
```solidity
airdrop.verifyAndRewardAll();
```

### Administrative Functions

**Update Verifier:**
```solidity
airdrop.updateVerifier(newVerifierAddress);
```

**Remove User (Emergency):**
```solidity
airdrop.removeUser(userAddress);
```

**Complete Airdrop:**
```solidity
airdrop.completeAirdrop();
```

**Withdraw Remaining Tokens:**
```solidity
airdrop.withdrawRemainingTokens();
```

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test testVerifyAndRewardAll

# Gas report
forge test --gas-report
```

### Test Coverage

The test suite covers:
- Deployment validation
- User management (add/remove)
- Proof verification (valid/invalid)
- Token distribution (single/batch)
- Access control
- Reentrancy protection
- Edge cases and error conditions

## Security Considerations

1. **Access Control**: All administrative functions are protected with the `onlyOwner` modifier
2. **Reentrancy Protection**: `ReentrancyGuard` prevents reentrancy attacks during token transfers
3. **Proof Verification**: Tokens are only transferred after successful proof verification
4. **Double Claim Prevention**: Users cannot claim rewards multiple times
5. **Maximum Participants**: Limited to 100 users to prevent gas limit issues

## Gas Optimization

- Batch processing reduces transaction costs for multiple rewards
- Efficient storage patterns minimize gas usage
- Early validation prevents unnecessary computation

## Events

The contract emits the following events:

- `UserRewarded(address indexed user, bytes32 snsId, uint256 amount)`
- `WrongProofProvided(address indexed user, bytes32 snsId, uint256 amount)`
- `VerifierUpdated(address indexed newVerifier)`
- `WinnerListUpdated(uint256 numberOfWinners)`
- `BatchRewardCompleted(uint256 successfulRewards, uint256 totalRewardAmount)`

## View Functions

- `eligibleUser(address)`: Get user information
- `getEligibleUsersCount()`: Total number of eligible users
- `getEligibleUserByIndex(uint256)`: Get user address by index
- `getRewardStats()`: Get reward distribution statistics
- `getContractBalance()`: Current WTON balance
- `testProofVerification(address)`: Test if a user's proof would verify

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Audit Status

⚠️ **This contract has not been audited. Use at your own risk.**

Before deploying to mainnet:
1. Conduct a professional security audit
2. Test thoroughly on testnet
3. Consider a bug bounty program
4. Implement monitoring and emergency pause mechanisms

## Support

For questions or issues, please open an issue in the repository or contact the development team.