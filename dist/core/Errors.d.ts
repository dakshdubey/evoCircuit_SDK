export declare class EvoCircuitError extends Error {
    constructor(message: string);
}
export declare class CircuitOpenError extends EvoCircuitError {
    constructor(key: string, state: string);
}
export declare class ExecutionTimeoutError extends EvoCircuitError {
    constructor(key: string, timeout: number);
}
