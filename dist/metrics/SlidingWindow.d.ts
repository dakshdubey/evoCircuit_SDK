import { CircuitMetrics } from '../types/index.js';
export declare class SlidingWindow {
    private buckets;
    private readonly windowSize;
    private readonly bucketCount;
    private readonly bucketDuration;
    constructor(windowSizeMs: number, bucketCount?: number);
    recordSuccess(latency: number): void;
    recordFailure(latency: number): void;
    getTotals(): CircuitMetrics;
    private getOrCreateCurrentBucket;
    private evictOldBuckets;
}
