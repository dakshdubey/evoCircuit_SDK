"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvoCircuit = void 0;
const Circuit_js_1 = require("./Circuit.js");
class EvoCircuit {
    circuits = new Map();
    config;
    hooks;
    constructor(config = {}, hooks = {}) {
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
    async execute(key, fn, options = {}) {
        const circuit = this.getOrCreateCircuit(key);
        return await circuit.execute(fn, {
            fallback: options.fallback,
            timeoutMs: options.timeoutMs
        });
    }
    getOrCreateCircuit(key) {
        let circuit = this.circuits.get(key);
        if (!circuit) {
            circuit = new Circuit_js_1.Circuit(key, this.config, this.hooks);
            this.circuits.set(key, circuit);
        }
        return circuit;
    }
    /**
     * Manually resets a specific circuit.
     */
    reset(key) {
        this.circuits.delete(key);
    }
    /**
     * Resets all circuits.
     */
    resetAll() {
        this.circuits.clear();
    }
}
exports.EvoCircuit = EvoCircuit;
