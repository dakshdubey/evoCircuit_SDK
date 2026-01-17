import { Circuit } from './Circuit.js';
import { BreakerConfig, ExecutionOptions, LifecycleHooks } from '../types/index.js';

export class EvoCircuit {
    private readonly circuits: Map<string, Circuit> = new Map();
    private readonly config: BreakerConfig;
    private readonly hooks: LifecycleHooks;

    constructor(config: Partial<BreakerConfig> = {}, hooks: LifecycleHooks = {}) {
        this.config = {
            windowSize: config.windowSize ?? 10000,
            minRequests: config.minRequests ?? 10,
            baseCooldown: config.baseCooldown ?? 5000,
            maxCooldown: config.maxCooldown ?? 60000,
            failureThreshold: config.failureThreshold ?? 0.5,
            latencyThresholdMs: config.latencyThresholdMs ?? 1000,
        };
        this.hooks = hooks;
    }

    /**
     * Executes an async operation protected by a circuit breaker.
     * @param key Unique identifier for the operation/endpoint.
     * @param fn The async function to execute.
     * @param options Execution options, including optional fallback.
     */
    public async execute<T>(
        key: string,
        fn: () => Promise<T>,
        options: ExecutionOptions<T> & { timeoutMs?: number } = {}
    ): Promise<T> {
        const circuit = this.getOrCreateCircuit(key);
        return await circuit.execute(fn, {
            fallback: options.fallback,
            timeoutMs: options.timeoutMs
        });
    }

    private getOrCreateCircuit(key: string): Circuit {
        let circuit = this.circuits.get(key);
        if (!circuit) {
            circuit = new Circuit(key, this.config, this.hooks);
            this.circuits.set(key, circuit);
        }
        return circuit;
    }

    /**
     * Manually resets a specific circuit.
     */
    public reset(key: string): void {
        this.circuits.delete(key);
    }

    /**
     * Resets all circuits.
     */
    public resetAll(): void {
        this.circuits.clear();
    }
}
