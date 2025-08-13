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

### **Step 4: Environment Variables Setup (for Notarization - Optional)**

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

### **Step 5: Build and Test**

#### **Build signed app:**

```bash
npm run make:signed
```

#### **Verify signature:**

```bash
codesign -dv --verbose=4 out/tokamak-zk-evm-playground-hub-darwin-arm64/tokamak-zk-evm-playground-hub.app
```

Success output:

```
Authority=Developer ID Application: Tokamak Network (TEAM123456)
Authority=Developer ID Certification Authority
Authority=Apple Root CA
```

### **Step 6: Distribution Testing**

1. **Test on different Mac**
2. **Verify double-click execution**
3. **Confirm no "unidentified developer" warning**

## 🎯 **Current Preparation Status**

- ✅ **forge.config.ts**: Apple Developer settings completed
- ✅ **package.json**: `make:signed` script added
- ✅ **entitlements.plist**: Permission settings completed
- ⏳ **Certificate**: Needs creation after Apple Developer Program enrollment
- ⏳ **Environment Variables**: Required when using notarization

## 🚀 **Changes After Certificate Application**

### **Before (Current):**

```bash
# Users must run these commands every time
sudo xattr -rd com.apple.quarantine tokamak-zk-evm-playground-hub.app
codesign --force --deep --sign - tokamak-zk-evm-playground-hub.app
```

### **After (Certificate Applied):**

```bash
# Developer builds once
npm run make:signed

# Users can run with double-click only ✨
```

## 📞 **Troubleshooting**

### **Common Errors:**

1. **"No identity found"**

   - Certificate not properly installed in Keychain
   - Verify with `security find-identity -v -p codesigning`

2. **"Invalid signature"**

   - Incorrect certificate name
   - Re-check identity value in `forge.config.ts`

3. **"Notarization failed"**
   - Apple ID or App-Specific Password error
   - Re-verify environment variables

### **Help Resources:**

- Apple Developer Support: https://developer.apple.com/support/
- Electron Forge Documentation: https://www.electronforge.io/guides/code-signing

---

**Setup Complete! Ready to apply once certificate is generated! 🎉**
