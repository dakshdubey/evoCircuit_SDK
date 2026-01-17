"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Circuit = void 0;
const SlidingWindow_js_1 = require("../metrics/SlidingWindow.js");
const StateMachine_js_1 = require("../state/StateMachine.js");
const index_js_1 = require("../types/index.js");
const Errors_js_1 = require("./Errors.js");
class Circuit {
    key;
    config;
    hooks;
    metrics;
    stateMachine;
    constructor(key, config, hooks = {}) {
        this.key = key;
        this.config = config;
        this.hooks = hooks;
        this.metrics = new SlidingWindow_js_1.SlidingWindow(config.windowSize);
        this.stateMachine = new StateMachine_js_1.StateMachine(config, hooks);
    }
    async execute(fn, options = {}) {
        const { fallback, timeoutMs = this.config.latencyThresholdMs * 5 } = options;
        if (!this.stateMachine.isExecutionAllowed()) {
            if (fallback) {
                return fallback();
            }
            throw new Errors_js_1.CircuitOpenError(this.key, this.stateMachine.getState());
        }
        const start = Date.now();
        let timeoutId;
        try {
            const executionPromise = fn();
            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
            });
            const result = await Promise.race([executionPromise, timeoutPromise]);
            clearTimeout(timeoutId);
            const latency = Date.now() - start;
            this.handleSuccess(latency);
            return result;
        }
        catch (error) {
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
    handleSuccess(latency) {
        this.metrics.recordSuccess(latency);
        this.hooks.onSuccess?.(latency);
        if (this.stateMachine.getState() === index_js_1.CircuitState.HALF_OPEN) {
            this.stateMachine.transitionTo(index_js_1.CircuitState.CLOSED);
            this.hooks.onRecover?.();
        }
    }
    handleFailure(error, latency) {
        this.metrics.recordFailure(latency);
        this.stateMachine.incrementFailure();
        this.hooks.onFailure?.(error, latency);
        const state = this.stateMachine.getState();
        if (state === index_js_1.CircuitState.HALF_OPEN) {
            this.stateMachine.transitionTo(index_js_1.CircuitState.OPEN);
            this.hooks.onTrip?.(error);
            return;
        }
        this.checkThresholds(error);
    }
    checkThresholds(error) {
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
            this.stateMachine.transitionTo(index_js_1.CircuitState.OPEN);
            this.hooks.onTrip?.(error);
        }
    }
}
exports.Circuit = Circuit;
