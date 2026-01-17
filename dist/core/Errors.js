"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionTimeoutError = exports.CircuitOpenError = exports.EvoCircuitError = void 0;
class EvoCircuitError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EvoCircuitError';
    }
}
exports.EvoCircuitError = EvoCircuitError;
class CircuitOpenError extends EvoCircuitError {
    constructor(key, state) {
        super(`Circuit "${key}" is currently ${state}`);
        this.name = 'CircuitOpenError';
    }
}
exports.CircuitOpenError = CircuitOpenError;
class ExecutionTimeoutError extends EvoCircuitError {
    constructor(key, timeout) {
        super(`Execution for "${key}" timed out after ${timeout}ms`);
        this.name = 'ExecutionTimeoutError';
    }
}
exports.ExecutionTimeoutError = ExecutionTimeoutError;
