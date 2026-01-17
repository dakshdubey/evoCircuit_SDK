export class EvoCircuitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EvoCircuitError';
    }
}

export class CircuitOpenError extends EvoCircuitError {
    constructor(key: string, state: string) {
        super(`Circuit "${key}" is currently ${state}`);
        this.name = 'CircuitOpenError';
    }
}

export class ExecutionTimeoutError extends EvoCircuitError {
    constructor(key: string, timeout: number) {
        super(`Execution for "${key}" timed out after ${timeout}ms`);
        this.name = 'ExecutionTimeoutError';
    }
}
