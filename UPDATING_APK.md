npm run build
npx cap add android skip this if exists
 npx cap sync android
 npx cap copy android
 npx cap open android



# Guide: Updating the Android APK

Follow these steps whenever you make changes to the web application and want to see them in your Android app.

## 1. Build the Web Application
This command generates the static files for your project in the `out/` directory.

```powershell
npm run build
```

## 2. Sync with Capacitor
This command copies the new web files from `out/` into the Android project's assets.

```powershell
npx cap sync android
```

## 3. Build the Android APK
You can build the APK using the command line. This requires pointing to the Java version bundled with Android Studio.

### Using PowerShell:
```powershell
# Set the Java path for the session
    $env:JAVA_HOME = "D:\program files\Android\Android Studio\jbr"

# Move to the android directory and build
cd android
./gradlew assembleDebug
cd ..
```

### Using Command Prompt (CMD):
```cmd
set "JAVA_HOME=D:\program files\Android\Android Studio\jbr"
cd android
gradlew assembleDebug
cd ..
```

## 4. Location of the APK
Once the build is successful, your fresh APK will be located here:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## Troubleshooting
- **Build Fails?**: Make sure you don't have any errors in your `npm run build` step first.
- **Java Error?**: Ensure the path `D:\program files\Android\Android Studio\jbr` is correct on your system.
- **Old Changes showing?**: Ensure you ran `npx cap sync android` *after* `npm run build`.

cleanr build apk
cd android; ./gradlew clean; ./gradlew assembleDebug; cd ..

