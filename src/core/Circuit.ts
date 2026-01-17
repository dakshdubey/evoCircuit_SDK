import { SlidingWindow } from '../metrics/SlidingWindow.js';
import { StateMachine } from '../state/StateMachine.js';
import { CircuitState, BreakerConfig, LifecycleHooks, CircuitMetrics } from '../types/index.js';
import { CircuitOpenError } from './Errors.js';

export class Circuit {
    private readonly metrics: SlidingWindow;
    private readonly stateMachine: StateMachine;

    constructor(
        public readonly key: string,
        private readonly config: BreakerConfig,
        private readonly hooks: LifecycleHooks = {}
    ) {
        this.metrics = new SlidingWindow(config.windowSize);
        this.stateMachine = new StateMachine(config, hooks);
    }

    public async execute<T>(
        fn: () => Promise<T>,
        options: { fallback?: () => T | Promise<T>; timeoutMs?: number } = {}
    ): Promise<T> {
        const { fallback, timeoutMs = this.config.latencyThresholdMs * 5 } = options;

        if (!this.stateMachine.isExecutionAllowed()) {
            if (fallback) {
                return fallback();
            }
            throw new CircuitOpenError(this.key, this.stateMachine.getState());
        }

        const start = Date.now();
        let timeoutId: any;

        try {
            const executionPromise = fn();
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
            });

            const result = await Promise.race([executionPromise, timeoutPromise]);
            clearTimeout(timeoutId);

            const latency = Date.now() - start;
            this.handleSuccess(latency);
            return result;
        } catch (error: any) {
            clearTimeout(timeoutId);
            const latency = Date.now() - start;
            const isTimeout = error.message === 'TIMEOUT';

            const effectiveError = isTimeout ? new Error(`Execution timed out after ${timeoutMs}ms`) : error;
            this.handleFailure(effectiveError, latency);

            if (fallback) {
                return fallback();
            }
            throw effectiveError;
        }
    }

    private handleSuccess(latency: number): void {
        this.metrics.recordSuccess(latency);
        this.hooks.onSuccess?.(latency);

        if (this.stateMachine.getState() === CircuitState.HALF_OPEN) {
            this.stateMachine.transitionTo(CircuitState.CLOSED);
            this.hooks.onRecover?.();
        }
    }

    private handleFailure(error: Error, latency: number): void {
        this.metrics.recordFailure(latency);
        this.stateMachine.incrementFailure();
        this.hooks.onFailure?.(error, latency);

        const state = this.stateMachine.getState();
        if (state === CircuitState.HALF_OPEN) {
            this.stateMachine.transitionTo(CircuitState.OPEN);
            this.hooks.onTrip?.(error);
            return;
        }

        this.checkThresholds(error);
    }

    private checkThresholds(error: Error): void {
        const totals = this.metrics.getTotals();

        if (totals.count < this.config.minRequests) {
            return;
        }

        const failureRate = totals.failures / totals.count;
        const avgLatency = totals.totalLatency / totals.count;

        // Adaptive threshold: if latency is high, we lower the failure threshold to trip faster
        let effectiveFailureThreshold = this.config.failureThreshold;
        if (avgLatency > this.config.latencyThresholdMs) {
            // Linear sensitivity increase up to 50% more sensitive
            const latencyRatio = Math.min(avgLatency / this.config.latencyThresholdMs, 2);
            effectiveFailureThreshold *= (1 - (latencyRatio - 1) * 0.5);
        }

        if (failureRate >= effectiveFailureThreshold) {
            this.stateMachine.transitionTo(CircuitState.OPEN);
            this.hooks.onTrip?.(error);
        }
    }
}
