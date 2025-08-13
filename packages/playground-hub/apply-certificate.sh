#!/bin/bash

echo "🍎 Apple Developer Certificate Application Script"
echo "==============================================="

# 1. Check installed certificates
echo "1️⃣ Checking installed code signing certificates..."
CERTIFICATES=$(security find-identity -v -p codesigning | grep "Developer ID Application")

if [ -z "$CERTIFICATES" ]; then
    echo "❌ No Developer ID Application certificates found."
    echo "   Please create certificate in Apple Developer Portal and install in Keychain."
    echo "   See APPLE_CERTIFICATE_SETUP.md for detailed instructions."
    exit 1
fi

echo "✅ Found certificates:"
echo "$CERTIFICATES"
echo ""

# 2. Extract certificate name
IDENTITY=$(echo "$CERTIFICATES" | head -1 | sed 's/.*"\(.*\)".*/\1/')
echo "2️⃣ Using certificate: $IDENTITY"

# 3. Update forge.config.ts
echo "3️⃣ Updating forge.config.ts..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/identity: \"Developer ID Application: Tokamak Network\"/identity: \"$IDENTITY\"/" forge.config.ts
else
    # Linux
    sed -i "s/identity: \"Developer ID Application: Tokamak Network\"/identity: \"$IDENTITY\"/" forge.config.ts
fi

echo "✅ forge.config.ts update completed"

# 4. Test build
echo "4️⃣ Running test build..."
echo "   (This process may take several minutes)"

if npm run make:signed; then
    echo ""
    echo "🎉 Success! Signed app has been created!"
    echo ""
    echo "📁 Generated file location:"
    find out -name "*.app" -type d 2>/dev/null | head -1
    echo ""
    echo "🔍 Signature verification:"
    APP_PATH=$(find out -name "*.app" -type d 2>/dev/null | head -1)
    if [ -n "$APP_PATH" ]; then
        codesign -dv --verbose=4 "$APP_PATH" 2>&1 | grep "Authority=" | head -3
    fi
    echo ""
    echo "✨ Users can now run the app with just double-click!"
else
    echo ""
    echo "❌ Build failed. Please check the following:"
    echo "   - Certificate is properly installed"
    echo "   - Certificate is not expired"
    echo "   - Network connection status (for notarization)"
    echo ""
    echo "See APPLE_CERTIFICATE_SETUP.md for detailed troubleshooting."
    exit 1
fi 