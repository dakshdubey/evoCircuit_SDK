import { CircuitMetrics } from '../types/index.js';

interface Bucket extends CircuitMetrics {
    timestamp: number;
}

export class SlidingWindow {
    private buckets: Bucket[] = [];
    private readonly windowSize: number;
    private readonly bucketCount: number;
    private readonly bucketDuration: number;

    constructor(windowSizeMs: number, bucketCount: number = 10) {
        this.windowSize = windowSizeMs;
        this.bucketCount = bucketCount;
        this.bucketDuration = Math.floor(windowSizeMs / bucketCount);
    }

    public recordSuccess(latency: number): void {
        const bucket = this.getOrCreateCurrentBucket();
        bucket.successes++;
        bucket.count++;
        bucket.totalLatency += latency;
    }

    public recordFailure(latency: number): void {
        const bucket = this.getOrCreateCurrentBucket();
        bucket.failures++;
        bucket.count++;
        bucket.totalLatency += latency;
    }

    public getTotals(): CircuitMetrics {
        this.evictOldBuckets();
        return this.buckets.reduce(
            (acc, bucket) => {
                acc.successes += bucket.successes;
                acc.failures += bucket.failures;
                acc.timeouts += bucket.timeouts;
                acc.totalLatency += bucket.totalLatency;
                acc.count += bucket.count;
                return acc;
            },
            { successes: 0, failures: 0, timeouts: 0, totalLatency: 0, count: 0 }
        );
    }

    private getOrCreateCurrentBucket(): Bucket {
        const now = Date.now();
        this.evictOldBuckets();

        const currentBucketTimestamp = Math.floor(now / this.bucketDuration) * this.bucketDuration;
        let bucket = this.buckets.find((b) => b.timestamp === currentBucketTimestamp);

        if (!bucket) {
            bucket = {
                timestamp: currentBucketTimestamp,
                successes: 0,
                failures: 0,
                timeouts: 0,
                totalLatency: 0,
                count: 0,
            };
            this.buckets.push(bucket);
        }

        return bucket;
    }

    private evictOldBuckets(): void {
        const now = Date.now();
        const expiryThreshold = now - this.windowSize;
        this.buckets = this.buckets.filter((b) => b.timestamp >= expiryThreshold);
    }
}
