export declare enum CircuitState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN"
}
export interface CircuitMetrics {
    successes: number;
    failures: number;
    timeouts: number;
    totalLatency: number;
    count: number;
}
export interface BreakerConfig {
    /** Rolling window size in milliseconds */
    windowSize: number;
    /** Minimum number of requests before triggering circuit logic */
    minRequests: number;
    /** Initial cooldown time in milliseconds */
    baseCooldown: number;
    /** Maximum cooldown time in milliseconds */
    maxCooldown: number;
    /** Failure rate threshold (0 to 1) */
    failureThreshold: number;
    /** Latency threshold in milliseconds */
    latencyThresholdMs: number;
}
export type FallbackFn<T> = () => T | Promise<T>;
export interface ExecutionOptions<T> {
    fallback?: FallbackFn<T>;
}
export type LifecycleHooks = {
    onStateChange?: (prev: CircuitState, next: CircuitState) => void;
    onTrip?: (error: Error) => void;
    onRecover?: () => void;
    onFailure?: (error: Error, latency: number) => void;
    onSuccess?: (latency: number) => void;
};
