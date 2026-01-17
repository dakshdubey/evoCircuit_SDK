import { BreakerConfig, LifecycleHooks } from '../types/index.js';
export declare class Circuit {
    readonly key: string;
    private readonly config;
    private readonly hooks;
    private readonly metrics;
    private readonly stateMachine;
    constructor(key: string, config: BreakerConfig, hooks?: LifecycleHooks);
    execute<T>(fn: () => Promise<T>, options?: {
        fallback?: () => T | Promise<T>;
        timeoutMs?: number;
    }): Promise<T>;
    private handleSuccess;
    private handleFailure;
    private checkThresholds;
}
