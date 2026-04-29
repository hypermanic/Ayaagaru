# Testing Pantulugaru Android App

This guide explains how to test and debug the Pantulugaru mobile application using Capacitor, and how to distribute and test your app using Firebase services.

---

## 📱 Physical Device Setup

To test the app on your real phone instead of an emulator:

1.  **Enable Developer Options:**
    *   Go to **Settings** > **About Phone**.
    *   Find **Build Number** and tap it 7 times.
2.  **Enable USB Debugging:**
    *   Go to **Settings** > **System** > **Developer Options**.
    *   Switch on **USB Debugging**.
3.  **Connect your phone:**
    *   Plug your phone into your computer via a USB cable.
    *   Check **"Always allow from this computer"** on your phone's prompt.
4.  **Verify connection:**
    ```bash
    adb devices
    ```
    *   You should see your device listed as `device`. 
5.  **Network Setup (for Live Reload):**
    *   Connect your phone and computer to the **same WiFi network**.
    *   This is required for the [Live Reload](#-quick-testing-live-reload) feature.
    *   Find your IP (usually `192.168.x.x`,192.168.56.1) by running `ipconfig` (Windows).

> [!TIP]
> If you have multiple devices connected, run `npx cap run android --list` to see available targets and use `npx cap run android --target <device-id>` to select one.

---

## 🚀 Quick Testing (Live Reload)

Live reload is the fastest way to test changes. It allows you to see updates instantly without rebuilding the entire Android project.

1.  **Start the Next.js development server:**
    ```bash
    npm run dev
    ```
2.  **Run the app on your device/emulator:**
    ```bash
    npx cap run android -l --host 192.168.0.141
    ```
    *   `-l`: Enables Live Reload.
    *   `--host`: Specifies your computer's local IP so the device can connect.

---

## 📦 Production-like Testing

Use this method to test the app as a standalone package, or to verify native features like splash screens and plugins.

1.  **Build the web project:**
    ```bash
    npm run build
    ```
2.  **Sync the web files to the Android project:**
    ```bash
    npx cap sync android
    ```
3.  **Open in Android Studio:**
    ```bash
    npx cap open android
    ```
4.  **Run the app:** Click the **Run** button (green arrow) in Android Studio.

---

## 🔥 Cloud Testing with Firebase

Testing with Firebase allows you to test on various real devices in the cloud and distribute your beta builds to team members.

### 1. Firebase Project Setup

Ensure your Android app is connected to your Firebase project **pantulugaru**.

1.  **Download `google-services.json`:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Select your project (**pantulugaru**).
    *   Find the Android app and download the `google-services.json` file.
2.  **Add to project:**
    *   Place the file in `e:\praveen\ayyaruapp_v1\android\app\google-services.json`.
3.  **Add SHA Fingerprints:**
    *   Features like Firebase Auth require your developer's SHA-1 and SHA-256 fingerprints.
    *   In Android Studio, click **Gradle** (right sidebar) > **app** > **Tasks** > **android** > **signingReport**.
    *   Copy the SHA-1 and SHA-256 keys and add them to your [Firebase Project Settings](https://console.firebase.google.com/project/_/settings/general/android:com.pantulugaru.devotional).

### 2. Firebase App Distribution (Beta Testing)

Use this to share your app with other testers or team members without going through the Play Store.

1.  **Build your APK:**
    *   In Android Studio: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
    *   The file will be located at `android/app/build/outputs/apk/debug/app-debug.apk`.
2.  **Upload to Firebase:**
    *   Go to **App Distribution** in the Firebase Console.
    *   Drag and drop your `.apk` file.
    *   Add tester emails and click **Distribute**.
3.  **Tester action:** Testers will receive an email to download and install the app using the App Tester app.

### 3. Firebase Test Lab (Automated Testing)

Run automated tests on multiple real and virtual devices in Google's cloud.

1.  **Prepare your APK:** Same as step 2.1.
2.  **Run a "Robo Test":**
    *   Go to **Test Lab** in the Firebase Console.
    *   Click **Run a test** > **Robo test**.
    *   Upload your `.apk`.
    *   Choose the device names and Android versions to test on.
3.  **Analyze Results:** Firebase will record a video and log any crashes or UI issues it finds during the automated crawl.

---

## 🔍 Debugging Tools

### Chrome DevTools
Since Capacitor uses a WebView, you can debug it just like a website:
1.  Open Chrome on your computer.
2.  Go to `chrome://inspect/#devices`.
3.  Find your device/emulator and click **inspect**.

### Android Studio Logs
For native errors (e.g., Firebase initialization issues), check the **Logcat** tab at the bottom of Android Studio. Filter by `Capacitor` or your app's package name (`com.pantulugaru.devotional`).

---

## 🛠 Prerequisites

*   **Android Studio**: Installed and configured.
*   **Android SDK**: API level 30 or higher recommended.
*   **Physical Device**: USB Debugging enabled in Developer Options.
*   **Emulator**: A Virtual Device (AVD) created in Android Studio.
*   **Firebase Account**: With access to the **pantulugaru** project.



How to Update Your APK:
To sync your latest web changes into the Android app and generate a new APK, you need to follow these steps:

Build the Web App:

powershell
npm run build
(This updates the out/ folder with your latest React/Next.js changes.)

Sync with Capacitor:

powershell
npx cap sync android
(This copies the out/ folder into the Android project's assets.)

Build the APK: You can build it via the command line (if Gradle is configured) or by opening the project in Android Studio.

To build via command line:

powershell
cd android; ./gradlew assembleDebug; cd ..
Would you like me to run the build and sync commands for you now? (Note: I can run the web build and sync, but the final APK build usually works best in your local Android Studio environment unless your command line is fully set up for Android builds.)