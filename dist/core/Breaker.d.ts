import { BreakerConfig, ExecutionOptions, LifecycleHooks } from '../types/index.js';
export declare class EvoCircuit {
    private readonly circuits;
    private readonly config;
    private readonly hooks;
    constructor(config?: Partial<BreakerConfig>, hooks?: LifecycleHooks);
    /**
     * Executes an async operation protected by a circuit breaker.
     * @param key Unique identifier for the operation/endpoint.
     * @param fn The async function to execute.
     * @param options Execution options, including optional fallback.
     */
    execute<T>(key: string, fn: () => Promise<T>, options?: ExecutionOptions<T> & {
        timeoutMs?: number;
    }): Promise<T>;
    private getOrCreateCircuit;
    /**
     * Manually resets a specific circuit.
     */
    reset(key: string): void;
    /**
     * Resets all circuits.
     */
    resetAll(): void;
}
