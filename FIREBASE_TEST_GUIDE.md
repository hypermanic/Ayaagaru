# 🔥 Firebase Android Testing Guide

This guide describes how to build, sync, and run automated tests for your Android application on **Firebase Test Lab**.

---

## 🛠 Prerequisites

1.  **GCloud SDK**: Already installed at:
    `C:\Users\prave\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd`
2.  **Authentication**: If you ever get logged out, run:
    `& "C:\Users\prave\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" auth login`
3.  **Project Configuration**: Already set to `pantulugaru`.

---

## 🚀 The Execution Workflow

Run these commands in order carefully to ensure the latest code is tested.

### 1. Build the Web Application
Generates the latest static build from Next.js.
```powershell
npm run build
```

### 2. Sync with Android Project
Copies the web code into the native Android structure.
```powershell
npx cap sync android
```

### 3. Generate Android APK
Builds the final package for testing.
```powershell
cd android; .\gradlew assembleDebug; cd ..
```

### 4. Trigger Firebase Test Lab
Triggers an automated "Robo" crawl on cloud devices.
```powershell
& "C:\Users\prave\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" firebase test android run --app android/app/build/outputs/apk/debug/app-debug.apk --type robo
```

---

## 🔍 Result Interpretation

Once triggered, you can find your results at:
👉 **[Firebase Test Lab Console](https://console.firebase.google.com/project/pantulugaru/testlab)**

- **Robo Test**: An automated crawler that explores your UI to find crashes.
- **Videos/Screenshots**: Watch how the app behaves and identify UI bugs.
- **Logcat**: Real-time native logs for debugging Firebase or plugin issues.

---

> [!TIP]
> **Automation Script**: You can save the above 4 commands into a file called `run-test.ps1` to automate the whole process with one command!
