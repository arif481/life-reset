# Life Reset Android App - Build Guide

## 🚀 Quick Start

Your app is now ready to be built into an Android APK! All the necessary configurations have been made.

### What's Been Implemented:

1. **Offline Support** ✅
   - Service Worker (`sw.js`) caches all UI assets
   - Firestore offline persistence enabled
   - IndexedDB backup for data when offline
   - Automatic sync when back online
   - Offline indicator shows when disconnected

2. **Mobile Optimizations** ✅
   - Touch-optimized UI (44px+ touch targets)
   - Safe area insets for notched devices
   - Smooth scrolling and momentum
   - No zoom on input focus (iOS fix)
   - Pull-to-refresh ready
   - Responsive layout improvements

3. **Google Sign-In Fix** ✅
   - Supports redirect method for WebView
   - Fallback to email/password auth
   - Native Capacitor plugin ready
   - Anonymous guest sign-in works everywhere

4. **PWA Ready** ✅
   - Web manifest for installability
   - App icons configured
   - Theme colors set

---

## 📱 Building the APK

### Option 1: Build on Your Machine (Recommended)

**Prerequisites:**
1. Install Android Studio: https://developer.android.com/studio
2. Install JDK 17+
3. Set environment variables:
   ```bash
   export ANDROID_SDK_ROOT=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin
   ```

**Build Commands:**
```bash
cd /home/stressuwu/Desktop/life-reset/life-reset

# Build web assets and sync
npm run sync

# Open in Android Studio
npm run android

# OR build APK directly
cd android && ./gradlew assembleDebug
```

**APK Location:** `android/app/build/outputs/apk/debug/app-debug.apk`

---

### Option 2: Build with GitHub Actions (Cloud Build)

Create `.github/workflows/android.yml`:

```yaml
name: Build Android APK

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    
    - name: Setup JDK 17
      uses: actions/setup-java@v4
      with:
        distribution: 'temurin'
        java-version: '17'
    
    - name: Setup Android SDK
      uses: android-actions/setup-android@v3
    
    - name: Install dependencies
      run: npm ci || npm install
    
    - name: Build web assets
      run: npm run build
    
    - name: Sync Capacitor
      run: npx cap sync android
    
    - name: Build Debug APK
      run: |
        cd android
        chmod +x gradlew
        ./gradlew assembleDebug
    
    - name: Upload APK
      uses: actions/upload-artifact@v4
      with:
        name: app-debug
        path: android/app/build/outputs/apk/debug/app-debug.apk
```

Then:
1. Push to GitHub
2. Go to Actions tab
3. Run the workflow
4. Download the APK from artifacts

---

### Option 3: Use Online Build Service

**AppGyver / Volt MX / Similar Services:**
1. Upload your `www/` folder
2. Configure app settings
3. Build APK in cloud

---

## 🔐 For Production (Play Store)

### Generate Signing Key:
```bash
keytool -genkey -v -keystore life-reset.keystore -alias life-reset -keyalg RSA -keysize 2048 -validity 10000
```

### Build Signed APK:
```bash
cd android
./gradlew assembleRelease
```

### Sign with your keystore:
Update `android/app/build.gradle` with signing config.

---

## 🧪 Testing

### Run on Connected Device:
```bash
npm run android:run
```

### Run on Emulator:
```bash
# Start emulator first via Android Studio
npm run android:run
```

---

## 📁 Project Structure

```
life-reset/
├── index.html          # Main HTML
├── manifest.webmanifest # PWA manifest
├── sw.js               # Service worker
├── firebase-config.js  # Firebase setup with offline
├── capacitor.config.json
├── package.json
├── css/
│   ├── mobile.css      # Mobile optimizations
│   └── ...
├── js/
│   ├── offline-manager.js  # Offline data sync
│   ├── auth.js         # Auth with WebView fixes
│   └── ...
├── icons/
│   └── icon.svg        # App icon source
├── www/                # Built assets (synced to Android)
└── android/            # Android project
    └── app/
        └── build/
            └── outputs/
                └── apk/  # Built APKs go here
```

---

## ⚡ Features Working Offline

- ✅ View dashboard
- ✅ Complete daily tasks (queued for sync)
- ✅ Log mood entries (queued for sync)
- ✅ Write journal entries (queued for sync)
- ✅ Track goals progress
- ✅ View analytics (cached data)
- ✅ All UI interactions

---

## 🔄 Auto-Sync Behavior

1. **When Offline:**
   - All changes saved to IndexedDB
   - Changes queued for sync
   - Offline indicator shown
   - Cached data displayed

2. **When Back Online:**
   - Pending changes synced automatically
   - Cache updated with fresh data
   - Indicator disappears
   - Toast notification shown

---

## 📱 Install on Device

### Debug APK (Testing):
1. Build APK
2. Transfer to device
3. Enable "Install from unknown sources"
4. Install APK

### Release APK (Production):
1. Build signed release APK
2. Upload to Play Store / direct distribute

---

## Need Help?

- Capacitor Docs: https://capacitorjs.com/docs
- Firebase Auth: https://firebase.google.com/docs/auth
- Android Build: https://developer.android.com/build
