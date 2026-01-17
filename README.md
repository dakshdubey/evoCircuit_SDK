# evoCircuit ⚡
### Adaptive Circuit Breaker SDK for Production-Grade Systems

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**evoCircuit** is a high-performance, zero-dependency circuit breaker designed for senior distributed-systems engineers. It protects services from cascading failures by using real-time latency signals to adaptively trip during service degradation.

---

## Why ecoCircuit?

Existing libraries often rely on fixed thresholds. In production, a "noisy neighbor" or a slow-burning database can cause system-wide brownouts without hitting a 50% failure rate. **evoCircuit** solves this by correlating **latency spikes** with **failure rates**.

### Core Pillars
- 📉 **Adaptive Detection**: Thresholds shift dynamically based on response times.
- 🚀 **Zero Latency Overhead**: $O(1)$ metric tracking via bucketed sliding windows.
- 📦 **Lean & Framework-Agnostic**: No Redis, no peer dependencies, 100% TypeScript.
- 🛠️ **Senior-Grade Control**: Full exposure to lifecycle hooks and specific timeout controls.

---

## Installation

```bash
npm install evocircuit
```

## Advanced Usage

```typescript
import { EvoCircuit } from 'evocircuit';

const breaker = new EvoCircuit({
  windowSize: 10000,       // 10s rolling window
  minRequests: 20,         // Prevent early noise tripping
  failureThreshold: 0.5,   // Trip at 50% failure...
  latencyThresholdMs: 400  // ...but trip SOONER if latency > 400ms
});

async function checkout() {
  return await breaker.execute("payments.v1", async () => {
    return await processPayment();
  }, {
    timeoutMs: 1000,
    fallback: () => ({ status: 'success_deferred' })
  });
}
```

## Configuration Schema

| Option | Default | Rationale |
| --- | --- | --- |
| `windowSize` | `10000ms` | Balancing sensitivity with metric accuracy. |
| `minRequests` | `10` | The statistical sample size required for stable tripping. |
| `baseCooldown` | `5000ms` | Initial sleep time before the first recovery attempt. |
| `maxCooldown` | `60000ms` | Prevents infinite exponential backoff. |
| `failureThreshold` | `0.5` | Standard 50% failure tolerance. |
| `latencyThresholdMs` | `1000ms` | Signal for "slow-burning" failure modes. |

---

## Developer Resources
- 📖 [Developer User Manual](./docs/USER_MANUAL.md) — Architectural deep dive and performance tuning.
- 🛡️ [License](./LICENSE) — MIT.

---

## Author
**Daksha Dubey** – Senior Systems Engineer.
