# Dynamic JDK Locator & APK Compiler
$javac = Get-ChildItem -Path "C:\Program Files", "C:\Program Files (x86)", "C:\Users" -Filter "javac.exe" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notlike "*jre*" } | Select-Object -First 1

if ($javac) {
    $jdkDir = $javac.Directory.Parent.FullName
    Write-Host "Discovered JDK Directory: $jdkDir"
    $env:JAVA_HOME = $jdkDir
    Write-Host "Setting JAVA_HOME = $env:JAVA_HOME"
    
    Set-Location android
    .\gradlew.bat assembleDebug
    Set-Location ..
    
    $apkSource = "android\app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkSource) {
        Copy-Item -Path $apkSource -Destination "Pawlytics-Android-v1.0.apk" -Force
        Write-Host "SUCCESS: Built APK -> Pawlytics-Android-v1.0.apk"
    } else {
        Write-Host "ERROR: Gradle completed but app-debug.apk was not created."
    }
} else {
    Write-Host "CRITICAL: No JDK (javac.exe) found on system."
}
