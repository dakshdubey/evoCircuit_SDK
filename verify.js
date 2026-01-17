import { EvoCircuit, CircuitOpenError } from './dist/index.js';

const breaker = new EvoCircuit({
    windowSize: 5000,
    minRequests: 5,
    baseCooldown: 2000,
    failureThreshold: 0.5,
});

async function simulate() {
    console.log('--- Starting Failure Simulation ---');

    // 1. Trigger many failures to trip the circuit
    for (let i = 0; i < 10; i++) {
        try {
            await breaker.execute('api.call', async () => {
                throw new Error('Remote service failed');
            });
        } catch (e) {
            if (e instanceof CircuitOpenError) {
                console.log(`[${i}] Blocked: ${e.message}`);
            } else {
                console.log(`[${i}] Failed: ${(e as Error).message}`);
            }
        }
    }

    console.log('\n--- Waiting for Cooldown (2s) ---');
    await new Promise(r => setTimeout(r, 2100));

    console.log('\n--- Testing Recovery (HALF_OPEN) ---');
    // 2. This should succeed and close the circuit
    try {
        const res = await breaker.execute('api.call', async () => {
            return 'Success response';
        });
        console.log(`Recovery result: ${res}`);
    } catch (e) {
        console.log(`Recovery failed: ${(e as Error).message}`);
    }

    // 3. Subsequent calls should succeed immediately
    const res2 = await breaker.execute('api.call', async () => 'Final success');
    console.log(`Subsequent result: ${res2}`);
}

simulate().catch(console.error);
