# Android App Build Guide

## 📱 Life Reset - Android App

Your web app has been converted to an Android app using Capacitor.

---

## 🚀 Quick Start

### Prerequisites

1. **Android Studio** - [Download here](https://developer.android.com/studio)
2. **Java JDK 17+** - Usually bundled with Android Studio
3. **Android SDK** - Installed via Android Studio

### Commands

```bash
# Build web assets and sync with Android
npm run sync

# Open in Android Studio
npm run android

# Run directly on connected device/emulator
npm run android:run
```

---

## 📂 Project Structure

```
life-reset/
├── android/                    # Native Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── assets/public/  # Your web app files
│   │   │   ├── java/           # Native Android code
│   │   │   ├── res/            # Android resources
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   └── build.gradle
├── www/                        # Built web assets (auto-generated)
├── capacitor.config.json       # Capacitor configuration
└── package.json                # NPM scripts
```

---

## 🔧 Development Workflow

### 1. Make Changes to Web App
Edit files in the root folder:
- `index.html`
- `css/` folder
- `js/` folder

### 2. Sync Changes to Android
```bash
npm run sync
```

### 3. Test in Android Studio
```bash
npm run android
```

Then click **Run** ▶️ in Android Studio.

---

## 📲 Running on Device

### Using Emulator
1. Open Android Studio
2. Go to **Tools → Device Manager**
3. Create a virtual device (Pixel 6 recommended)
4. Start the emulator
5. Run: `npm run android:run`

### Using Physical Device
1. Enable **Developer Options** on your phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable **USB Debugging** in Developer Options
3. Connect phone via USB
4. Run: `npm run android:run`

---

## 🏗️ Building APK/AAB

### Debug APK (for testing)
```bash
npm run sync
cd android
./gradlew assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release AAB (for Play Store)
```bash
npm run sync
cd android
./gradlew bundleRelease
```
AAB location: `android/app/build/outputs/bundle/release/app-release.aab`

### Signed Release APK
1. Generate a keystore:
```bash
keytool -genkey -v -keystore life-reset.keystore -alias life-reset -keyalg RSA -keysize 2048 -validity 10000
```

2. Create `android/keystore.properties`:
```properties
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=life-reset
storeFile=../life-reset.keystore
```

3. Build signed APK:
```bash
cd android
./gradlew assembleRelease
```

---

## ⚙️ Configuration

### App ID & Name
Edit `capacitor.config.json`:
```json
{
  "appId": "com.lifereset.app",
  "appName": "Life Reset",
  "webDir": "www"
}
```

### Theme Colors
Edit `android/app/src/main/res/values/colors.xml`:
```xml
<color name="colorPrimary">#4361ee</color>
<color name="colorPrimaryDark">#3a0ca3</color>
<color name="colorAccent">#7209b7</color>
```

### Permissions
Edit `android/app/src/main/AndroidManifest.xml`

Current permissions:
- `INTERNET` - Required for Firebase
- `ACCESS_NETWORK_STATE` - Check connectivity

---

## 🎨 App Icon

Replace the icon files in:
- `android/app/src/main/res/mipmap-hdpi/`
- `android/app/src/main/res/mipmap-mdpi/`
- `android/app/src/main/res/mipmap-xhdpi/`
- `android/app/src/main/res/mipmap-xxhdpi/`
- `android/app/src/main/res/mipmap-xxxhdpi/`

Or use [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html) to generate all sizes.

---

## 🔥 Firebase Configuration

Your app uses Firebase via the web SDK (CDN), which works out of the box.

For better Android integration, optionally add native Firebase:
1. Go to Firebase Console
2. Add Android app with package: `com.lifereset.app`
3. Download `google-services.json`
4. Place in `android/app/`

---

## 🐛 Troubleshooting

### "SDK location not found"
Create `android/local.properties`:
```properties
sdk.dir=/path/to/Android/Sdk
```
Common paths:
- Linux: `~/Android/Sdk`
- Mac: `~/Library/Android/sdk`
- Windows: `C:\\Users\\<user>\\AppData\\Local\\Android\\Sdk`

### Gradle sync failed
```bash
cd android
./gradlew clean
./gradlew build
```

### Web changes not showing
```bash
npm run sync
```
Then rebuild in Android Studio.

### White screen on launch
- Check browser console in Android Studio's Logcat
- Filter by "Capacitor" or "WebView"

---

## 📦 Play Store Publishing

1. Build release AAB (see above)
2. Create [Google Play Developer account](https://play.google.com/console)
3. Create new app in Play Console
4. Upload AAB to Production/Internal testing
5. Fill in store listing, screenshots, etc.
6. Submit for review

---

## 📚 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guides](https://developer.android.com/guide)
- [Firebase for Web](https://firebase.google.com/docs/web/setup)
