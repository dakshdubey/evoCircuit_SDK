import { CircuitState, BreakerConfig, LifecycleHooks } from '../types/index.js';
export declare class StateMachine {
    private readonly config;
    private readonly hooks;
    private state;
    private lastStateChange;
    private nextAttemptAt;
    private failureCount;
    constructor(config: BreakerConfig, hooks?: LifecycleHooks);
    getState(): CircuitState;
    transitionTo(nextState: CircuitState): void;
    incrementFailure(): void;
    resetFailureCount(): void;
    private calculateNextAttempt;
    isExecutionAllowed(): boolean;
}
