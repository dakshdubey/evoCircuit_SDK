"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMachine = void 0;
const index_js_1 = require("../types/index.js");
class StateMachine {
    config;
    hooks;
    state = index_js_1.CircuitState.CLOSED;
    lastStateChange = Date.now();
    nextAttemptAt = 0;
    failureCount = 0;
    constructor(config, hooks = {}) {
        this.config = config;
        this.hooks = hooks;
    }
    getState() {
        const now = Date.now();
        if (this.state === index_js_1.CircuitState.OPEN && now >= this.nextAttemptAt) {
            this.transitionTo(index_js_1.CircuitState.HALF_OPEN);
        }
        return this.state;
    }
    transitionTo(nextState) {
        if (this.state === nextState)
            return;
        const prevState = this.state;
        this.state = nextState;
        this.lastStateChange = Date.now();
        if (nextState === index_js_1.CircuitState.OPEN) {
            this.calculateNextAttempt();
        }
        else if (nextState === index_js_1.CircuitState.CLOSED) {
            this.failureCount = 0;
            this.nextAttemptAt = 0;
        }
        this.hooks.onStateChange?.(prevState, nextState);
    }
    incrementFailure() {
        this.failureCount++;
    }
    resetFailureCount() {
        this.failureCount = 0;
    }
    calculateNextAttempt() {
        const backoff = Math.pow(2, Math.max(0, this.failureCount - 1));
        const delay = Math.min(this.config.baseCooldown * backoff, this.config.maxCooldown);
        this.nextAttemptAt = Date.now() + delay;
    }
    isExecutionAllowed() {
        const currentState = this.getState();
        return currentState !== index_js_1.CircuitState.OPEN;
    }
}
exports.StateMachine = StateMachine;
