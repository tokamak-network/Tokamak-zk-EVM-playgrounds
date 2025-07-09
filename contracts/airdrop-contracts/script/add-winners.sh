#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🎯 Airdrop Winners Management Script${NC}"
echo "======================================"

# Load environment variables
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

source .env

# Contract address
AIRDROP_CONTRACT="0x9F243180CCd5FeBf2c01fA9279D76a70Cf7Ee80d"

echo "Airdrop Contract: $AIRDROP_CONTRACT"
echo ""

# Show options
echo "Select an option:"
echo -e "${BLUE}1)${NC} Test proof verification for existing users"
echo -e "${BLUE}2)${NC} Add test addresses with dummy proofs (InputWinners.s.sol)"
echo -e "${BLUE}3)${NC} Add realistic addresses with dummy proofs (InputWinnersRealistic.s.sol)"
echo -e "${BLUE}4)${NC} Add addresses with VALID ZK proofs (InputWinnersWithValidProof.s.sol)"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo -e "${YELLOW}Testing proof verification...${NC}"
        forge script ./script/TestProofVerification.s.sol:TestProofVerification \
            --rpc-url $RPC_URL \
            -vvvv
        exit 0
        ;;
    2)
        SCRIPT_NAME="InputWinners"
        echo -e "${YELLOW}Running test script with dummy addresses...${NC}"
        ;;
    3)
        SCRIPT_NAME="InputWinnersRealistic"
        echo -e "${YELLOW}Running realistic script...${NC}"
        ;;
    4)
        SCRIPT_NAME="InputWinnersWithValidProof"
        echo -e "${YELLOW}Running script with valid ZK proofs...${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice!${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}⚠️  This will add 10 participants to the airdrop contract.${NC}"
echo "Make sure you have enough ETH for gas fees."
echo ""
read -p "Continue? (y/n): " confirm

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 0
fi

# Run the script
echo ""
echo -e "${YELLOW}📝 Adding winners to contract...${NC}"

forge script ./script/${SCRIPT_NAME}.s.sol:${SCRIPT_NAME} \
    --rpc-url $RPC_URL \
    --broadcast \
    -vvvv

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Winners added successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Check the contract on Etherscan:"
    echo "   https://sepolia.etherscan.io/address/$AIRDROP_CONTRACT"
    echo ""
    echo "2. Test proof verification:"
    echo "   ./add-winners.sh (select option 1)"
    echo ""
    echo "3. Fund the contract with WTON tokens"
    echo ""
    echo "4. Execute the airdrop with:"
    echo "   ./execute-airdrop.sh"
else
    echo ""
    echo -e "${RED}❌ Failed to add winners${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⚠️  This will add 10 participants to the airdrop contract.${NC}"
echo "Make sure you have enough ETH for gas fees."
echo ""
read -p "Continue? (y/n): " confirm

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 0
fi

# Run the script
echo ""
echo -e "${YELLOW}📝 Adding winners to contract...${NC}"

forge script script/${SCRIPT_NAME}.s.sol:${SCRIPT_NAME} \
    --rpc-url $RPC_URL \
    --broadcast \
    -vvvv

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Winners added successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Check the contract on Etherscan:"
    echo "   https://sepolia.etherscan.io/address/$AIRDROP_CONTRACT"
    echo ""
    echo "2. Fund the contract with WTON tokens"
    echo ""
    echo "3. Execute the airdrop with:"
    echo "   ./execute-airdrop.sh"
else
    echo ""
    echo -e "${RED}❌ Failed to add winners${NC}"
    exit 1
fi