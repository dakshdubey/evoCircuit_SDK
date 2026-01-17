# evoCircuit Developer Manual

## Technical Overview
evoCircuit is a high-performance, in-memory circuit breaker designed for distributed systems. It emphasizes **low latency**, **adaptive detection**, and **isolation**.

### Architecture
The SDK is built on three core pillars:
1.  **Sliding Window Engine**: Uses bucketed time-slices to track metrics with $O(1)$ complexity for writes and reads.
2.  **Adaptive Thresholding**: Dynamically adjusts the failure threshold based on real-time latency signals.
3.  **Linear & Exponential Recovery**: Combines deterministic state transitions with exponential backoff during recovery to prevent system flapping.

---

## Production Guarantees

### Memory Efficiency
Since evoCircuit runs entirely in-memory without external dependencies (like Redis), it is designed to keep a minimal memory footprint.
- **Eviction**: Old buckets are automatically evicted during the write/read cycle.
- **Leak Prevention**: Use `breaker.reset(key)` for dynamic endpoints that are no longer in use to prevent the circuit map from growing indefinitely.

### Concurrency & Thread Safety
While Node.js is single-threaded, concurrency issues arise from asynchronous operations. evoCircuit ensures:
- **Atomic Transitions**: State changes happen synchronously before yielding to the next microtask.
- **Race Condition Prevention**: The internal state machine handles concurrent requests during `HALF_OPEN` by ensuring only the first successful recovery closes the circuit.

---

## Advanced Feature: Adaptive Tripping
Usually, circuit breakers use a fixed failure rate (e.g., 50%). evoCircuit goes further:

> [!IMPORTANT]
> If `avgLatency > latencyThresholdMs`, the failure threshold is lowered.
> This means if your service is slow, the circuit will trip even at a 20% or 30% failure rate to prioritize system health over partial availability.

---

## Performance Tuning for Senior Devs

### 1. High-Load Microservices
For services handling >5k RPS:
- **Increase `minRequests`**: Prevent transient blips from tripping the circuit.
- **Small `windowSize`**: React faster to infrastructure failures.

### 2. Cascading Failure Prevention
Always use the `timeoutMs` option. By default, it is set to $5 \times$ your `latencyThresholdMs`.
```typescript
await breaker.execute("api", task, { timeoutMs: 500 });
```

### 3. Monitoring (Integration)
Use the Lifecycle Hooks to export metrics to Prometheus or Datadog:
```typescript
{
  onTrip: (err) => metrics.increment("circuit_tripped", { key: this.key }),
  onFailure: (err, lat) => metrics.histogram("circuit_latency", lat)
}
```

---

## Security Considerations
- **No External IO**: Because it doesn't call databases or Redis, it doesn't introduce new failure domains.
- **Error Transparency**: The SDK never swallows original error stacks unless a fallback is provided.

Written by **Daksha Dubey**, Senior Systems Engineer.
