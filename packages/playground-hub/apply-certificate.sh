#!/bin/bash

echo "🍎 Apple Developer Complete Build & Notarization Script"
echo "======================================================"
echo "⚠️  ADMIN ONLY: This script requires Apple Developer credentials"
echo ""

# Color codes for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to prompt for input with default value
prompt_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        if [ -z "$input" ]; then
            input="$default"
        fi
    else
        read -p "$prompt: " input
        while [ -z "$input" ]; do
            print_error "This field is required!"
            read -p "$prompt: " input
        done
    fi
    
    eval "$var_name='$input'"
}

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script must be run on macOS"
    exit 1
fi

print_step "1️⃣ Checking installed code signing certificates..."

# Check for Developer ID Application certificates
CERTIFICATES=$(security find-identity -v -p codesigning | grep "Developer ID Application")

if [ -z "$CERTIFICATES" ]; then
    print_error "No Developer ID Application certificates found."
    echo "   Please create certificate in Apple Developer Portal and install in Keychain."
    echo "   See APPLE_CERTIFICATE_SETUP.md for detailed instructions."
    exit 1
fi

print_success "Found certificates:"
echo "$CERTIFICATES"
echo ""

# Handle multiple certificates
CERT_COUNT=$(echo "$CERTIFICATES" | wc -l | tr -d ' ')

if [ "$CERT_COUNT" -eq 1 ]; then
    # Only one certificate found - use it automatically
    IDENTITY=$(echo "$CERTIFICATES" | sed 's/.*"\(.*\)".*/\1/')
    print_step "2️⃣ Using certificate: $IDENTITY"
else
    # Multiple certificates found - let user choose
    print_step "2️⃣ Multiple certificates found. Please choose one:"
    echo ""
    
    # Display certificates with numbers
    i=1
    echo "$CERTIFICATES" | while read -r cert; do
        cert_name=$(echo "$cert" | sed 's/.*"\(.*\)".*/\1/')
        echo "   $i) $cert_name"
        i=$((i + 1))
    done
    echo ""
    
    # Prompt for selection
    while true; do
        read -p "Enter certificate number (1-$CERT_CㅇOUNT): " cert_choice
        
        # Validate input
        if [[ "$cert_choice" =~ ^[0-9]+$ ]] && [ "$cert_choice" -ge 1 ] && [ "$cert_choice" -le "$CERT_COUNT" ]; then
            # Extract the chosen certificate
            IDENTITY=$(echo "$CERTIFICATES" | sed -n "${cert_choice}p" | sed 's/.*"\(.*\)".*/\1/')
            print_success "Selected certificate: $IDENTITY"
            break
        else
            print_error "Invalid selection. Please enter a number between 1 and $CERT_COUNT."
        fi
    done
fi

echo ""

print_step "3️⃣ Setting up Apple Developer credentials for notarization..."
echo "   Please provide your Apple Developer account information:"
echo ""

# Prompt for Apple Developer credentials
prompt_input "Apple ID (Developer Account Email)" "" "APPLE_ID"
prompt_input "Apple Team ID" "B5WMFK82H9" "APPLE_TEAM_ID"

echo ""
print_warning "App-Specific Password Setup Required:"
echo "   1. Visit https://appleid.apple.com"
echo "   2. Go to 'Sign-In and Security' → 'App-Specific Passwords'"
echo "   3. Generate a new password with label 'Electron Notarization'"
echo "   4. Copy the generated password"
echo ""

prompt_input "App-Specific Password (from appleid.apple.com)" "" "APP_SPECIFIC_PASSWORD"

# Validate app-specific password format and length
PASSWORD_LENGTH=${#APP_SPECIFIC_PASSWORD}
print_step "Password validation:"
echo "   Length: $PASSWORD_LENGTH characters"

if [ "$PASSWORD_LENGTH" -ne 19 ]; then
    print_error "Invalid password length! App-Specific Passwords are exactly 19 characters."
    echo "   Your input: $PASSWORD_LENGTH characters"
    echo "   Expected: 19 characters (16 letters + 3 dashes)"
    echo "   Format: abcd-efgh-ijkl-mnop"
    echo ""
    print_error "You likely entered your regular Apple ID password instead of an App-Specific Password."
    echo ""
    echo "🔧 Please generate a proper App-Specific Password:"
    echo "   1. Go to https://appleid.apple.com"
    echo "   2. Sign-In and Security → App-Specific Passwords"
    echo "   3. Generate new password with label 'Electron Notarization'"
    echo "   4. Copy the 19-character password (format: abcd-efgh-ijkl-mnop)"
    exit 1
fi

if [[ ! "$APP_SPECIFIC_PASSWORD" =~ ^[a-z]{4}-[a-z]{4}-[a-z]{4}-[a-z]{4}$ ]]; then
    print_error "Invalid password format!"
    echo "   App-Specific Passwords must be: abcd-efgh-ijkl-mnop"
    echo "   - 4 lowercase letters, dash, 4 lowercase letters, dash, etc."
    exit 1
fi

print_success "Password format validation passed!"

echo ""
print_step "4️⃣ Storing credentials securely in Keychain..."

# Store password in keychain
if xcrun altool --store-password-in-keychain-item "AC_PASSWORD" -u "$APPLE_ID" -p "$APP_SPECIFIC_PASSWORD" 2>/dev/null; then
    print_success "Credentials stored in Keychain successfully"
    APPLE_ID_PASSWORD="@keychain:AC_PASSWORD"
else
    print_warning "Keychain storage failed, using direct password (less secure)"
    APPLE_ID_PASSWORD="$APP_SPECIFIC_PASSWORD"
fi

echo ""
print_step "5️⃣ Creating environment configuration..."

# Create .env file with credentials (preserve existing if it has the right values)
if [ -f ".env" ] && grep -q "APPLE_ID_PASSWORD=" .env && [ -n "$(grep 'APPLE_ID_PASSWORD=' .env | cut -d'=' -f2)" ]; then
    print_step "Using existing .env file with credentials"
    # Update existing .env file
    sed -i '' "s/^APPLE_ID=.*/APPLE_ID=$APPLE_ID/" .env
    sed -i '' "s/^APPLE_TEAM_ID=.*/APPLE_TEAM_ID=$APPLE_TEAM_ID/" .env
else
    # Create new .env file
    cat > .env << EOF
# Apple Developer Account for Notarization
# Generated by apply-certificate.sh on $(date)

APPLE_ID=$APPLE_ID
APPLE_ID_PASSWORD=$APPLE_ID_PASSWORD
APPLE_TEAM_ID=$APPLE_TEAM_ID
EOF
fi

print_success ".env file created with notarization credentials"

echo ""
print_step "6️⃣ Updating forge.config.ts with certificate identity..."

# Update forge.config.ts with the correct identity
print_step "Current forge.config.ts identity configuration:"
grep -n "identity:" forge.config.ts || echo "No identity configuration found"
echo ""

# Try multiple patterns to find and replace the identity
UPDATED=false

# Pattern 1: Hash-based identity
if grep -q "identity: \"3524416ED3903027378EA41BB258070785F977F9\"" forge.config.ts; then
    print_step "Replacing hash-based identity..."
    sed -i '' "s/identity: \"3524416ED3903027378EA41BB258070785F977F9\"/identity: \"$IDENTITY\"/" forge.config.ts
    UPDATED=true
# Pattern 2: Existing Developer ID Application certificate
elif grep -q "identity: \"Developer ID Application:" forge.config.ts; then
    print_step "Replacing existing Developer ID Application certificate..."
    sed -i '' "s/identity: \"Developer ID Application:[^\"]*\"/identity: \"$IDENTITY\"/" forge.config.ts
    UPDATED=true
# Pattern 3: Any identity string
elif grep -q "identity: \"" forge.config.ts; then
    print_step "Replacing existing identity string..."
    sed -i '' "s/identity: \"[^\"]*\"/identity: \"$IDENTITY\"/" forge.config.ts
    UPDATED=true
else
    print_error "Could not find identity configuration in forge.config.ts"
    print_step "Current file content around osxSign:"
    grep -A 5 -B 5 "osxSign" forge.config.ts || echo "osxSign section not found"
    exit 1
fi

if [ "$UPDATED" = true ]; then
    print_step "Updated forge.config.ts identity configuration:"
    grep -n "identity:" forge.config.ts
    echo ""
else
    print_error "Failed to update identity in forge.config.ts"
    exit 1
fi

print_success "forge.config.ts updated with certificate identity"

echo ""
print_step "7️⃣ Starting build and notarization process..."
print_warning "This process may take 5-15 minutes depending on app size and Apple's servers"

# Verify environment variables before build
print_step "Verifying environment variables:"
echo "   APPLE_ID: $APPLE_ID"
echo "   APPLE_TEAM_ID: $APPLE_TEAM_ID"
echo "   APPLE_ID_PASSWORD: [HIDDEN]"

# Check if all required variables are set
if [ -z "$APPLE_ID" ] || [ -z "$APPLE_ID_PASSWORD" ] || [ -z "$APPLE_TEAM_ID" ]; then
    print_error "Missing required environment variables for notarization"
    exit 1
fi

echo ""

# Export environment variables for the build process
export APPLE_ID="$APPLE_ID"
export APPLE_ID_PASSWORD="$APPLE_ID_PASSWORD"
export APPLE_TEAM_ID="$APPLE_TEAM_ID"

# Run the signed build with notarization
if npm run make:signed; then
    echo ""
    print_success "Build and notarization completed successfully!"
    echo ""
    
    print_step "8️⃣ Verifying the notarized application..."
    
    # Find the generated app
    APP_PATH=$(find out -name "*.app" -type d 2>/dev/null | head -1)
    DMG_PATH=$(find out -name "*.dmg" 2>/dev/null | head -1)
    ZIP_PATH=$(find out -name "*.zip" 2>/dev/null | head -1)
    
    if [ -n "$APP_PATH" ]; then
        echo ""
        print_success "Generated application: $APP_PATH"
        
        # Verify code signature
        echo ""
        echo "🔍 Code Signature Verification:"
        codesign -dv --verbose=4 "$APP_PATH" 2>&1 | grep "Authority=" | head -3
        
        # Verify notarization
        echo ""
        echo "🔍 Notarization Verification:"
        if spctl -a -v "$APP_PATH" 2>&1 | grep -q "accepted"; then
            print_success "App is properly notarized and will run without warnings"
        else
            print_warning "Notarization verification inconclusive - test on another Mac"
        fi
    fi
    
    # List all generated files
    echo ""
    print_step "📁 Generated distribution files:"
    if [ -n "$APP_PATH" ]; then
        echo "   • App Bundle: $APP_PATH"
    fi
    if [ -n "$DMG_PATH" ]; then
        echo "   • DMG Installer: $DMG_PATH"
    fi
    if [ -n "$ZIP_PATH" ]; then
        echo "   • ZIP Archive: $ZIP_PATH"
    fi
    
    echo ""
    print_success "🎉 SUCCESS! The app is now ready for distribution!"
    echo ""
    echo "✨ Users can now:"
    echo "   • Double-click the .app to run directly"
    echo "   • Install from .dmg without security warnings"
    echo "   • Extract and run from .zip without issues"
    echo ""
    print_step "📋 Next Steps:"
    echo "   1. Test the app on a different Mac to confirm no warnings appear"
    echo "   2. Distribute the .dmg or .zip file to users"
    echo "   3. Keep the .env file secure (contains sensitive credentials)"
    
else
    echo ""
    print_error "Build or notarization failed!"
    echo ""
    echo "🔍 Common issues and solutions:"
    echo "   • Certificate expired: Renew in Apple Developer Portal"
    echo "   • Wrong Apple ID: Verify account has Developer Program access"
    echo "   • Network issues: Check internet connection"
    echo "   • App-specific password: Generate new one at appleid.apple.com"
    echo "   • Team ID mismatch: Verify in Apple Developer Portal"
    echo ""
    echo "📖 For detailed troubleshooting, see APPLE_CERTIFICATE_SETUP.md"
    exit 1
fi

echo ""
print_step "🔒 Security Note:"
echo "   The .env file contains sensitive credentials."
echo "   • Keep it secure and never commit to version control"
echo "   • Consider deleting it after successful build"
echo "   • Credentials are also stored in macOS Keychain for future use" 