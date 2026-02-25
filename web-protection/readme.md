# 🛡️ Munetios Web Protection

© 2026 **Munetios**  
Licensed under the **Munetios License v1.5**

Munetios Web Protection is a **lightweight, client-side JavaScript security layer**
designed to reduce exposure to **malicious domains, scam infrastructure, phishing links,
cryptomining scripts, and invasive third-party tracking**.

The project runs **entirely in the browser**, performs **no network requests**, and
collects **no data of any kind**.

---

## 🔐 Key Features

- 🚫 Blocks known malicious, scam, phishing, and compromised domains
- 🛑 Optional blocking of common tracking and analytics providers (**Strict mode**)
- 🔐 Privacy-first YouTube embed handling with explicit user consent
- ⚡ Zero network requests or remote lookups
- ❌ No telemetry, analytics, cookies, or fingerprinting
- 🧠 Deterministic, transparent behavior

---

## 🛡️ Domain Blocklists

Munetios Web Protection includes **locally bundled blocklists** to help prevent
the browser from loading resources from **high-risk or untrusted domains**.

### 🚫 Malicious Domains

Domains in this list are associated with:

- Malware or exploit delivery
- Scam or phishing campaigns
- Cryptomining scripts
- Fake or compromised CDNs
- Known supply-chain attacks

**Example (simplified):**

```js
const MALICIOUS_DOMAINS = [
  "get-free-minecoins.xyz",
  "free-crypto-reward.xyz",
  "wallet-verify.net",
  "polyfill.io",
  "coinhive.com",
  "cryptoloot.pro",
  "fakecdn.io",
  "malwarecdn.net"
];
```

When matched, affected iframes or embeds are **blocked or removed before execution**.

---

### 🛑 Tracking & Analytics Domains (Strict Mode)

When running in `mode: "strict"`, additional domains commonly used for:

- Cross-site tracking
- Advertising networks
- Behavioral analytics
- Session replay and monitoring tools

are blocked to reduce tracking, fingerprinting, and privacy exposure.

This mode is recommended for **privacy-focused**, **GDPR-sensitive**, **kids**, and
**school** environments.

---

## 🧠 How Blocking Works

- Domain checks use **exact hostname matching**
- Subdomains of blocked domains are also blocked
- No wildcard or pattern-based overblocking is used
- All checks are performed **locally in the browser**
- No external services are contacted

> ⚠️ Blocklists are **preventive**, not antivirus software.

---

## 🔐 YouTube Privacy Protection

Embedded YouTube iframes are replaced with a **privacy warning** before loading.

Users must explicitly choose to:

- ▶ Load the embedded video, or
- 🔗 Open the video directly on YouTube

This helps reduce passive tracking and aligns with **privacy-by-design** and
**GDPR consent** principles.

---

## ⚙️ Configuration

Behavior can be customized using a global configuration object:

```js
window.MunetiosProtection = {
  mode: "strict" // "strict" | "warn" | "off"
};
```

### Modes
- **strict** – Block malicious + tracking domains (default)
- **warn** – Block malicious domains only
- **off** – Disable all protections

---

## 🧪 Security Guarantees

Munetios Web Protection guarantees:

- ❌ No `eval`, `Function`, or dynamic code execution
- ❌ No cookies, localStorage, IndexedDB, or sessionStorage usage
- ❌ No fingerprinting or analytics
- ❌ No external requests or background connections
- ✔️ Runs fully client-side

---

## 📄 Security Policy

Please see [`SECURITY.md`](./SECURITY.md) for details on:

- Responsible vulnerability disclosure
- Supported versions
- Security design principles

---

## 📜 License

This project is licensed under the **MIT License**.  
See the [`LICENSE`](./LICENSE) file for details.
