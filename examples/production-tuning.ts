import { EvoCircuit } from '../src/index.js';

/**
 * Production Tuning Guide
 * 
 * Scenario 1: High-throughput API (1000+ RPS)
 * - Use a larger minRequests (e.g. 100) to avoid tripping on transient blips.
 * - Use a smaller windowSize (e.g. 5000) for faster reaction.
 */
const highThroughputBreaker = new EvoCircuit({
    windowSize: 5000,
    minRequests: 100,
    failureThreshold: 0.1, // 10% failure is catastrophic at high RPS
    latencyThresholdMs: 200,
});

/**
 * Scenario 2: Unreliable Legacy Service
 * - Use a shorter baseCooldown (e.g. 1000) to retry aggressively.
 * - Use a higher failureThreshold (e.g. 0.7) to tolerate noise.
 */
const legacyServiceBreaker = new EvoCircuit({
    windowSize: 30000,
    minRequests: 10,
    baseCooldown: 1000,
    failureThreshold: 0.7,
});

/**
 * Scenario 3: Critical Payment Gateway
 * - Strict latency requirements.
 * - Long cooldown to prevent repeated failure attempts.
 */
const paymentBreaker = new EvoCircuit({
    windowSize: 60000,
    minRequests: 5,
    baseCooldown: 10000,
    maxCooldown: 300000, // 5 minutes
    latencyThresholdMs: 1500,
    failureThreshold: 0.05, // 5% failure is too much
});

console.log('Production tuning examples loaded.');
