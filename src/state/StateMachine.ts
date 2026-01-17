import { CircuitState, BreakerConfig, LifecycleHooks } from '../types/index.js';

export class StateMachine {
    private state: CircuitState = CircuitState.CLOSED;
    private lastStateChange: number = Date.now();
    private nextAttemptAt: number = 0;
    private failureCount: number = 0;

    constructor(
        private readonly config: BreakerConfig,
        private readonly hooks: LifecycleHooks = {}
    ) { }

    public getState(): CircuitState {
        const now = Date.now();

        if (this.state === CircuitState.OPEN && now >= this.nextAttemptAt) {
            this.transitionTo(CircuitState.HALF_OPEN);
        }

        return this.state;
    }

    public transitionTo(nextState: CircuitState): void {
        if (this.state === nextState) return;

        const prevState = this.state;
        this.state = nextState;
        this.lastStateChange = Date.now();

        if (nextState === CircuitState.OPEN) {
            this.calculateNextAttempt();
        } else if (nextState === CircuitState.CLOSED) {
            this.failureCount = 0;
            this.nextAttemptAt = 0;
        }

        this.hooks.onStateChange?.(prevState, nextState);
    }

    public incrementFailure(): void {
        this.failureCount++;
    }

    public resetFailureCount(): void {
        this.failureCount = 0;
    }

    private calculateNextAttempt(): void {
        const backoff = Math.pow(2, Math.max(0, this.failureCount - 1));
        const delay = Math.min(
            this.config.baseCooldown * backoff,
            this.config.maxCooldown
        );
        this.nextAttemptAt = Date.now() + delay;
    }

    public isExecutionAllowed(): boolean {
        const currentState = this.getState();
        return currentState !== CircuitState.OPEN;
    }
}
