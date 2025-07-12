#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Contract addresses
AIRDROP_CONTRACT="0x9F243180CCd5FeBf2c01fA9279D76a70Cf7Ee80d"
WTON_CONTRACT="0x79e0d92670106c85e9067b56b8f674340dca0bbd"

clear
echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           ${YELLOW}🎯 AIRDROP MANAGER  🎯${CYAN}          ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Load environment variables
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create a .env file with your configuration."
    exit 1
fi

source .env

# Display contract info
echo -e "${BLUE}📋 Contract Information:${NC}"
echo "├─ Airdrop: $AIRDROP_CONTRACT"
echo "├─ WTON: $WTON_CONTRACT"
echo "└─ Network: Sepolia"
echo ""

# Main menu
while true; do
    echo -e "${BLUE}📊 Main Menu:${NC}"
    echo "├─ [1] 👥 Manage Winners"
    echo "├─ [2] 💰 Execute Airdrop"
    echo "├─ [3] 📈 Check Status"
    echo "├─ [4] 🔧 Admin Functions"
    echo "└─ [0] 🚪 Exit"
    echo ""
    read -p "Select an option: " main_choice

    case $main_choice in
        1)
            # Winners Management Submenu
            clear
            echo -e "${YELLOW}👥 Winners Management${NC}"
            echo "────────────────────"
            echo "[1] Add test addresses (dummy proofs)"
            echo "[2] Add realistic addresses (dummy proofs)"
            echo "[3] Add addresses with VALID ZK proofs"
            echo "[4] Test proof verification"
            echo "[5] Remove a user"
            echo "[0] Back to main menu"
            echo ""
            read -p "Select an option: " winner_choice

            case $winner_choice in
                1|2|3)
                    if [ "$winner_choice" = "1" ]; then
                        SCRIPT_NAME="InputWinnersList"
                        DESC="test addresses with dummy proofs"
                    elif [ "$winner_choice" = "2" ]; then
                        SCRIPT_NAME="InputWinnersRealistic"
                        DESC="realistic addresses with dummy proofs"
                    else
                        SCRIPT_NAME="InputWinnersListWithValidProof"
                        DESC="addresses with VALID ZK proofs"
                    fi

                    echo -e "${YELLOW}⚠️  Adding 10 participants with $DESC${NC}"
                    read -p "Continue? (y/n): " confirm
                    
                    if [[ "$confirm" =~ ^[Yy]$ ]]; then
                        forge script ./script/${SCRIPT_NAME}.s.sol:${SCRIPT_NAME} \
                            --rpc-url $RPC_URL \
                            --broadcast \
                            -vvvv
                    fi
                    ;;
                4)
                    forge script ./script/TestProofVerification.s.sol:TestProofVerification \
                        --rpc-url $RPC_URL \
                        -vvvv
                    ;;
                5)
                    read -p "Enter user address to remove: " user_address
                    echo -e "${YELLOW}Removing user $user_address...${NC}"
                    cast send $AIRDROP_CONTRACT "removeUser(address)" $user_address \
                        --rpc-url $RPC_URL \
                        --private-key $PRIVATE_KEY
                    ;;
                0)
                    clear
                    continue
                    ;;
            esac
            echo ""
            read -p "Press Enter to continue..."
            clear
            ;;
            
        2)
            # Airdrop Execution Submenu
            clear
            echo -e "${YELLOW}💰 Airdrop Execution${NC}"
            echo "────────────────────"
            echo "${CYAN}[1]${NC} Execute airdrop for ALL users"
            echo "${CYAN}[2]${NC} Execute airdrop for SINGLE user"
            echo "${CYAN}[3]${NC} Check contract WTON balance"
            echo "${CYAN}[0]${NC} Back to main menu"
            echo ""
            read -p "Select an option: " exec_choice

            case $exec_choice in
                1)
                    echo -e "${YELLOW}⚠️  This will distribute tokens to all eligible users${NC}"
                    read -p "Continue? (y/n): " confirm
                    
                    if [[ "$confirm" =~ ^[Yy]$ ]]; then
                        forge script ./script/ExecuteAirdrop.s.sol:ExecuteAirdrop \
                            --rpc-url $RPC_URL \
                            --broadcast \
                            -vvvv
                    fi
                    ;;
                2)
                    read -p "Enter user address: " user_address
                    echo -e "${YELLOW}Executing airdrop for $user_address...${NC}"
                    cast send $AIRDROP_CONTRACT "verifyAndRewardSingle(address)" $user_address \
                        --rpc-url $RPC_URL \
                        --private-key $PRIVATE_KEY
                    ;;
                3)
                    balance=$(cast call $AIRDROP_CONTRACT "getContractBalance()" --rpc-url $RPC_URL)
                    balance_dec=$(cast --to-dec $balance)
                    balance_wton=$(echo "scale=2; $balance_dec / 1000000000000000000000000000" | bc)
                    echo -e "${GREEN}Contract WTON Balance: $balance_wton WTON${NC}"
                    ;;
                0)
                    clear
                    continue
                    ;;
            esac
            echo ""
            read -p "Press Enter to continue..."
            clear
            ;;
            
        3)
            # Status Check
            clear
            echo -e "${YELLOW}📈 Checking Airdrop Status...${NC}"
            echo "────────────────────────────"
            forge script ./script/TestProofVerification.s.sol:TestProofVerification \
                --rpc-url $RPC_URL \
                -vvvv
            echo ""
            read -p "Press Enter to continue..."
            clear
            ;;
            
        4)
            # Admin Functions Submenu
            clear
            echo -e "${YELLOW}🔧 Admin Functions${NC}"
            echo "──────────────────"
            echo "${CYAN}[1]${NC} Complete airdrop (finalize)"
            echo "${CYAN}[2]${NC} Withdraw remaining tokens"
            echo "${CYAN}[3]${NC} Update verifier contract"
            echo "${CYAN}[4]${NC} Transfer ownership"
            echo "${CYAN}[0]${NC} Back to main menu"
            echo ""
            read -p "Select an option: " admin_choice

            case $admin_choice in
                1)
                    echo -e "${RED}⚠️  WARNING: This will finalize the airdrop!${NC}"
                    echo "No new users can be added after this."
                    read -p "Are you sure? (y/n): " confirm
                    
                    if [[ "$confirm" =~ ^[Yy]$ ]]; then
                        cast send $AIRDROP_CONTRACT "completeAirdrop()" \
                            --rpc-url $RPC_URL \
                            --private-key $PRIVATE_KEY
                    fi
                    ;;
                2)
                    echo -e "${YELLOW}Withdrawing remaining tokens...${NC}"
                    cast send $AIRDROP_CONTRACT "withdrawRemainingTokens()" \
                        --rpc-url $RPC_URL \
                        --private-key $PRIVATE_KEY
                    ;;
                3)
                    read -p "Enter new verifier contract address: " verifier_address
                    echo -e "${YELLOW}Updating verifier to $verifier_address...${NC}"
                    cast send $AIRDROP_CONTRACT "updateVerifier(address)" $verifier_address \
                        --rpc-url $RPC_URL \
                        --private-key $PRIVATE_KEY
                    ;;
                4)
                    read -p "Enter new owner address: " new_owner
                    echo -e "${RED}⚠️  WARNING: This will transfer ownership!${NC}"
                    read -p "Are you sure? (y/n): " confirm
                    
                    if [[ "$confirm" =~ ^[Yy]$ ]]; then
                        cast send $AIRDROP_CONTRACT "transferOwnership(address)" $new_owner \
                            --rpc-url $RPC_URL \
                            --private-key $PRIVATE_KEY
                    fi
                    ;;
                0)
                    clear
                    continue
                    ;;
            esac
            echo ""
            read -p "Press Enter to continue..."
            clear
            ;;
            
        0)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
            
        *)
            echo -e "${RED}Invalid option!${NC}"
            sleep 1
            clear
            ;;
    esac
done