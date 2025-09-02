# Apple Developer Certificate Setup Guide

## 🍎 **Steps After Apple Developer Program Enrollment**

### **Step 1: Certificate Generation**

#### **Generate CSR in Keychain Access:**

1. Open **Keychain Access** app
2. **Menu**: Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
3. **Enter Information**:
   - User Email: Developer email
   - Common Name: "Tokamak Network" (or developer name)
   - CA Email: Leave empty
   - Request is: Select "Saved to disk"
4. **Save**: Creates `CertificateSigningRequest.certSigningRequest` file

#### **Create Certificate in Apple Developer Portal:**

1. **developer.apple.com** → Account → Certificates
2. Click **"+" button**
3. Select **"Developer ID Application"** (for macOS app distribution)
4. **Upload CSR file** (created above)
5. **Download certificate**: `developerID_application.cer`
6. **Double-click to install** in Keychain

### **Step 2: Verify Certificate Name**

Run in terminal:

```bash
security find-identity -v -p codesigning
```

Example output:

```
1) ABCD1234EFGH5678 "Developer ID Application: Tokamak Network (TEAM123456)"
```

### **Step 3: Update forge.config.ts**

Update certificate name in `forge.config.ts` file:

```typescript
osxSign: {
  // Change to exact certificate name confirmed above
  identity: "Developer ID Application: Tokamak Network (TEAM123456)",
},
```

### **Step 4: Environment Variables Setup (for Notarization - REQUIRED for Distribution)**

#### **Generate App-Specific Password:**

1. Visit **appleid.apple.com**
2. **Sign-In and Security** → **App-Specific Passwords**
3. **Generate Password** → Name: "Electron Notarization"
4. **Store generated password in Keychain**:
   ```bash
   xcrun altool --store-password-in-keychain-item "AC_PASSWORD" -u "your-apple-id@example.com" -p "generated-app-specific-password"
   ```

#### **Set Environment Variables:**

```bash
# Add to ~/.zshrc or ~/.bashrc
export APPLE_ID="your-apple-id@example.com"
export APPLE_ID_PASSWORD="@keychain:AC_PASSWORD"
export APPLE_TEAM_ID="TEAM123456"  # Check in Developer Portal
```

### **Step 5: Complete Build & Notarization (ADMIN ONLY)**

#### **Run the integrated script:**

```bash
./apply-certificate.sh
```

This script will:

1. ✅ **Detect installed certificates automatically**
   - If multiple certificates are found, you'll be prompted to choose
   - If only one certificate exists, it's selected automatically
2. ✅ **Prompt for Apple Developer credentials**
3. ✅ **Set up notarization configuration**
4. ✅ **Update forge.config.ts with correct certificate**
5. ✅ **Build, sign, and notarize the app**
6. ✅ **Verify the final result**

#### **What the script asks for:**

- **Certificate Selection** (if multiple certificates are installed):
  - The script will list all available "Developer ID Application" certificates
  - Choose the one that matches your current Apple Developer account
- **Apple ID** (Developer Account Email)
- **Apple Team ID** (defaults to B5WMFK82H9)
- **App-Specific Password** (from appleid.apple.com)

#### **Expected output:**

```
🎉 SUCCESS! The app is now ready for distribution!

✨ Users can now:
   • Double-click the .app to run directly
   • Install from .dmg without security warnings
   • Extract and run from .zip without issues
```

### **Step 6: Distribution Testing**

1. **Test on different Mac**
2. **Verify double-click execution**
3. **Confirm no "unidentified developer" or "malicious software" warnings**

## 🎯 **Current Preparation Status**

- ✅ **forge.config.ts**: Apple Developer settings completed
- ✅ **package.json**: `make:signed` script added
- ✅ **entitlements.plist**: Permission settings completed
- ✅ **Certificate**: Applied and working (identity: 3524416ED3903027378EA41BB258070785F977F9)
- ⚠️ **Notarization**: REQUIRED for distribution - prevents "malicious software" warnings
- ⏳ **Environment Variables**: Required for notarization (see steps below)

## 🚀 **Changes After Complete Setup**

### **Before (Manual Process):**

```bash
# Users must run these commands every time
sudo xattr -rd com.apple.quarantine tokamak-zk-evm-playground-hub.app
codesign --force --deep --sign - tokamak-zk-evm-playground-hub.app
```

### **After (Certificate + Notarization):**

```bash
# Admin runs once (with Apple Developer credentials)
./apply-certificate.sh

# Users can run with double-click only ✨
# No security warnings, no manual commands needed
```

## 🔐 **Why Both Signing AND Notarization Are Required**

### **Code Signing Only (Previous State):**

- ✅ Proves app hasn't been tampered with
- ✅ Identifies the developer
- ❌ Still shows "unidentified developer" warnings
- ❌ Users get "malicious software" alerts

### **Code Signing + Notarization (Current Goal):**

- ✅ Proves app hasn't been tampered with
- ✅ Identifies the developer
- ✅ **Apple pre-approved the app as safe**
- ✅ **No security warnings for users**
- ✅ **Seamless installation and execution**

**Notarization = Apple's stamp of approval that the app is safe to run**

## 📞 **Troubleshooting**

### **Common Errors:**

1. **"No identity found"**

   - Certificate not properly installed in Keychain
   - Verify with `security find-identity -v -p codesigning`

2. **"Invalid signature"**

   - Incorrect certificate name
   - Re-check identity value in `forge.config.ts`

3. **"Multiple certificates - wrong one selected"**

   - When prompted, choose the certificate that matches your Apple Developer account
   - Look for the certificate with the correct Team ID in parentheses
   - Example: "Developer ID Application: Your Name (TEAM123456)"

4. **"Notarization failed"**
   - Apple ID or App-Specific Password error
   - Re-verify environment variables
   - Ensure the selected certificate matches the Apple ID being used

### **Help Resources:**

- Apple Developer Support: https://developer.apple.com/support/
- Electron Forge Documentation: https://www.electronforge.io/guides/code-signing

---

**Setup Complete! Ready to apply once certificate is generated! 🎉**
