# Security Policy

> Security architecture, vulnerability reporting, and boundary controls for Factory Insight AI.

---

## 1. Supported Versions

Security updates and patches are actively applied to the following release lines:

| Version | Supported | Notes |
| :--- | :--- | :--- |
| `2.x` | :white_check_mark: | Current active release branch. |
| `< 2.0` | :x: | Legacy release branches; upgrade recommended. |

---

## 2. Reporting a Vulnerability

If you discover a potential security vulnerability in this project, please report it responsibly:

1. **Do not create a public GitHub issue** disclosing the vulnerability.
2. Email security details to `security@factoryinsight.ai` or submit a private report via GitHub Security Advisories.
3. Include the following details:
   - Description of the vulnerability and attack vector
   - Steps to reproduce or a proof of concept (PoC)
   - Potential impact on users, data, or host environments
4. You will receive an acknowledgment within 48 hours, followed by a status update once remediation has begun.

---

## 3. Security Architecture & Boundaries

### 3.1 Credential & API Key Isolation
- **Server-Side Containment**: The Google Gemini API key (`GEMINI_API_KEY`) is stored strictly in server-side process environment variables (`process.env.GEMINI_API_KEY`) and accessed solely inside `server.ts`.
- **Zero Browser Exposure**: Secret keys are never prefixed with `VITE_` and are never serialized into frontend responses or JavaScript bundles.
- **Offline Fallback Security**: When `GEMINI_API_KEY` is not present, backend routes execute deterministic static heuristic analysis rather than throwing unhandled exceptions or leaking server environment details.

### 3.2 Client-Side Data Ingestion Boundaries
- **Local Browser Processing**: User-uploaded CSV logs, operator notes, and Structured Text programs are processed directly within the client's browser memory or Web Worker threads.
- **Regex Safety**: Client-side regex transformations on ingested logs must be safely guarded with `try / catch` blocks to prevent malformed user patterns from triggering client-side denial of service (ReDoS).
- **Body Parser Payload Limits**: The Express backend limits JSON and URL-encoded request bodies to `10mb` to protect against memory exhaustion from oversized file payloads.

### 3.3 Simulated Industrial Protocol Sandboxing
- **Sandboxed Endpoints**: The OPC UA (`/api/opcua/*`) and MQTT Sparkplug B implementations are simulated demonstration endpoints executing purely in software.
- **No Direct Physical Access**: The server does not open unauthenticated raw TCP/IP sockets to physical factory machinery, protecting corporate networks from unintended plant floor traffic.

### 3.4 Operational Role-Based Access Control (RBAC)
- The application provides simulated role gates (`ADMIN`, `ANALYST`, `VIEWER`) to restrict access to live polling toggles, code editing, and data clearing actions.
